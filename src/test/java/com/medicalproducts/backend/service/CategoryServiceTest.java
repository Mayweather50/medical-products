package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.CategoryRequest;
import com.medicalproducts.backend.dto.CategoryResponse;
import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.CategoryMapper;
import com.medicalproducts.backend.repository.CategoryRepository;
import com.medicalproducts.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;
    private CategoryResponse categoryResponse;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setTitle("Test Category");
        category.setSlug("test-category");
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());

        categoryResponse = new CategoryResponse(1L, "Test Category", "test-category",
                null, null, 0L, Instant.now(), Instant.now());
    }

    @Test
    void getById_existing_returnsResponse() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.countByCategoryId(1L)).thenReturn(0L);
        when(categoryMapper.toResponse(category, 0L)).thenReturn(categoryResponse);

        CategoryResponse result = categoryService.getById(1L);

        assertThat(result.title()).isEqualTo("Test Category");
    }

    @Test
    void getById_nonExisting_throwsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_duplicateSlug_throwsException() {
        CategoryRequest request = new CategoryRequest("Cat", "existing", null, null);
        when(categoryRepository.existsBySlug("existing")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("existing");
    }

    @Test
    void delete_withProducts_throwsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("still contains products");
    }

    @Test
    void delete_noProducts_softDeletes() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(1L)).thenReturn(false);

        categoryService.delete(1L);

        assertThat(category.getDeletedAt()).isNotNull();
    }
}
