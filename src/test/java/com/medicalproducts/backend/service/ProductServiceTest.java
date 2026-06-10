package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.ProductRequest;
import com.medicalproducts.backend.dto.ProductResponse;
import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.entity.Product;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.ProductMapper;
import com.medicalproducts.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductMapper productMapper;
    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setTitle("Test Category");
        category.setSlug("test-category");

        product = new Product();
        product.setId(1L);
        product.setTitle("Test Product");
        product.setSlug("test-product");
        product.setPrice(new BigDecimal("100.00"));
        product.setCategory(category);
        product.setAvailable(true);
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());

        productResponse = new ProductResponse(1L, "Test Product", "test-product", "ART-001",
                "Short desc", "Full desc", new BigDecimal("100.00"), false,
                null, null, Map.of(), true, false, Instant.now(), Instant.now());
    }

    @Test
    void getById_existingProduct_returnsResponse() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        ProductResponse result = productService.getById(1L);

        assertThat(result.title()).isEqualTo("Test Product");
        verify(productRepository).findById(1L);
    }

    @Test
    void getById_nonExisting_throwsNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void create_validRequest_createsProduct() {
        ProductRequest request = new ProductRequest("New Product", "new-product", "ART-002",
                "Short", "Full", new BigDecimal("50.00"), false, null, 1L,
                Map.of(), true, false);

        when(productRepository.existsBySlug("new-product")).thenReturn(false);
        when(categoryService.findById(1L)).thenReturn(category);
        when(productMapper.toEntity(request, category)).thenReturn(product);
        when(productRepository.save(product)).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        ProductResponse result = productService.create(request);

        assertThat(result).isNotNull();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void create_duplicateSlug_throwsException() {
        ProductRequest request = new ProductRequest("Product", "existing-slug", "ART",
                null, null, new BigDecimal("10.00"), false, null, 1L,
                null, null, null);

        when(productRepository.existsBySlug("existing-slug")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("existing-slug");
    }

    @Test
    void delete_existingProduct_softDeletes() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.delete(1L);

        assertThat(product.getDeletedAt()).isNotNull();
    }

    @Test
    void getBySlug_existingSlug_returnsResponse() {
        when(productRepository.findBySlug("test-product")).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        ProductResponse result = productService.getBySlug("test-product");

        assertThat(result.slug()).isEqualTo("test-product");
    }

    @Test
    void getBySlug_nonExisting_throwsNotFound() {
        when(productRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getBySlug("unknown"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void search_blankQuery_throwsException() {
        assertThatThrownBy(() -> productService.search("  ", 0, 10))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("blank");
    }
}
