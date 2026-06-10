package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.CategoryRequest;
import com.medicalproducts.backend.dto.CategoryResponse;
import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.CategoryMapper;
import com.medicalproducts.backend.repository.CategoryRepository;
import com.medicalproducts.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "title")).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return categoryMapper.toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public CategoryResponse getBySlug(String slug) {
        return categoryMapper.toResponse(findBySlug(slug));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Category with slug '" + request.slug() + "' already exists");
        }
        Category category = categoryRepository.save(categoryMapper.toEntity(request));
        log.info("Category created: id={}, title='{}', slug='{}'", category.getId(), category.getTitle(), category.getSlug());
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findById(id);
        if (categoryRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new IllegalArgumentException("Category with slug '" + request.slug() + "' already exists");
        }
        categoryMapper.updateEntity(category, request);
        log.info("Category updated: id={}, title='{}'", id, request.title());
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        if (productRepository.existsByCategoryId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete category '" + category.getTitle() + "': it still contains products");
        }
        category.markDeleted();
        log.info("Category soft-deleted: id={}, title='{}'", id, category.getTitle());
    }

    Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category with id " + id + " not found"));
    }

    Category findBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category with slug '" + slug + "' not found"));
    }
}
