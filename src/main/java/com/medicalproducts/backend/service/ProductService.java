package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.dto.ProductRequest;
import com.medicalproducts.backend.dto.ProductResponse;
import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.entity.Product;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.ProductMapper;
import com.medicalproducts.backend.repository.ProductRepository;
import com.medicalproducts.backend.spec.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAll(String categorySlug,
                                                Boolean available,
                                                Boolean popular,
                                                String query,
                                                int page,
                                                int size) {
        Specification<Product> spec = buildSpecification(categorySlug, available, popular, query);
        Page<ProductResponse> result = productRepository
                .findAll(spec, pageRequest(page, size))
                .map(productMapper::toResponse);
        return PageResponse.of(result);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getByCategorySlug(String categorySlug, int page, int size) {
        // 404, если категории нет — иначе пустая страница вводила бы в заблуждение
        categoryService.findBySlug(categorySlug);
        return getAll(categorySlug, null, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String query, int page, int size) {
        if (!StringUtils.hasText(query)) {
            throw new IllegalArgumentException("query parameter must not be blank");
        }
        return getAll(null, null, null, query, page, size);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getPopular() {
        return productRepository.findTop12ByPopularTrueAndAvailableTrueOrderByCreatedAtDesc().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return productMapper.toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product with slug '" + slug + "' not found"));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Product with slug '" + request.slug() + "' already exists");
        }
        Category category = categoryService.findById(request.categoryId());
        Product product = productRepository.save(productMapper.toEntity(request, category));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);
        if (productRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new IllegalArgumentException("Product with slug '" + request.slug() + "' already exists");
        }
        Category category = categoryService.findById(request.categoryId());
        productMapper.updateEntity(product, request, category);
        return productMapper.toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        productRepository.delete(findById(id));
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));
    }

    private Specification<Product> buildSpecification(String categorySlug,
                                                      Boolean available,
                                                      Boolean popular,
                                                      String query) {
        Specification<Product> spec = Specification.where(null);
        if (StringUtils.hasText(categorySlug)) {
            spec = spec.and(ProductSpecifications.hasCategorySlug(categorySlug));
        }
        if (available != null) {
            spec = spec.and(ProductSpecifications.isAvailable(available));
        }
        if (popular != null) {
            spec = spec.and(ProductSpecifications.isPopular(popular));
        }
        if (StringUtils.hasText(query)) {
            spec = spec.and(ProductSpecifications.matchesQuery(query));
        }
        return spec;
    }

    private Pageable pageRequest(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
