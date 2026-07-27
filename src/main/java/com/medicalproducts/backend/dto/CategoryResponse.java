package com.medicalproducts.backend.dto;

import java.time.Instant;

public record CategoryResponse(
        Long id,
        String title,
        String slug,
        String description,
        String imageUrl,
        String icon,
        String shortTitle,
        Long parentId,
        long productCount,
        Instant createdAt,
        Instant updatedAt
) {
}
