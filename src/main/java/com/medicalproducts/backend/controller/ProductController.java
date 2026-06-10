package com.medicalproducts.backend.controller;

import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.dto.ProductResponse;
import com.medicalproducts.backend.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Products", description = "Публичный каталог товаров")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public PageResponse<ProductResponse> getAll(@RequestParam(required = false) String categorySlug,
                                                @RequestParam(required = false) Boolean available,
                                                @RequestParam(required = false) Boolean popular,
                                                @RequestParam(required = false) String query,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return productService.getAll(categorySlug, available, popular, query, page, size);
    }

    @GetMapping("/popular")
    public List<ProductResponse> getPopular() {
        return productService.getPopular();
    }

    @GetMapping("/search")
    public PageResponse<ProductResponse> search(@RequestParam String query,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return productService.search(query, page, size);
    }

    @GetMapping("/{id:\\d+}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/slug/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }
}
