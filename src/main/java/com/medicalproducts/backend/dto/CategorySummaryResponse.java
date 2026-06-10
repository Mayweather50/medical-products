package com.medicalproducts.backend.dto;

/**
 * Короткое представление категории внутри ProductResponse,
 * чтобы не тянуть полный объект категории в каждый товар.
 */
public record CategorySummaryResponse(
        Long id,
        String title,
        String slug
) {
}
