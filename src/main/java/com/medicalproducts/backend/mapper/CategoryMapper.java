package com.medicalproducts.backend.mapper;

import com.medicalproducts.backend.dto.CategoryRequest;
import com.medicalproducts.backend.dto.CategoryResponse;
import com.medicalproducts.backend.dto.CategorySummaryResponse;
import com.medicalproducts.backend.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {
        Category category = new Category();
        applyRequest(category, request);
        return category;
    }

    public void updateEntity(Category category, CategoryRequest request) {
        applyRequest(category, request);
    }

    public CategoryResponse toResponse(Category category, long productCount) {
        return new CategoryResponse(
                category.getId(),
                category.getTitle(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getIcon(),
                category.getShortTitle(),
                category.getParent() != null ? category.getParent().getId() : null,
                productCount,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    public CategorySummaryResponse toSummary(Category category) {
        return new CategorySummaryResponse(
                category.getId(),
                category.getTitle(),
                category.getSlug(),
                category.getIcon(),
                category.getShortTitle()
        );
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setTitle(request.title());
        category.setSlug(request.slug());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());

        // icon и shortTitle необязательны: пустое значение не затирает уже сохранённое
        if (hasText(request.icon())) {
            category.setIcon(request.icon());
        } else if (!hasText(category.getIcon())) {
            category.setIcon("clinic");
        }

        category.setShortTitle(hasText(request.shortTitle()) ? request.shortTitle() : request.title());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
