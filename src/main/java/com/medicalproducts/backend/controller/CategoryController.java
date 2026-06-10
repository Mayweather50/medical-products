package com.medicalproducts.backend.controller;

import com.medicalproducts.backend.dto.CategoryResponse;
import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.dto.ProductResponse;
import com.medicalproducts.backend.service.CategoryService;
import com.medicalproducts.backend.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Categories", description = "Публичный каталог категорий")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductService productService;

    @GetMapping
    public List<CategoryResponse> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id:\\d+}")
    public CategoryResponse getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }

    @GetMapping("/slug/{slug}")
    public CategoryResponse getBySlug(@PathVariable String slug) {
        return categoryService.getBySlug(slug);
    }

    @GetMapping("/{slug}/products")
    public PageResponse<ProductResponse> getProductsByCategory(@PathVariable String slug,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size) {
        return productService.getByCategorySlug(slug, page, size);
    }
}
