package com.medicalproducts.backend.dto;

import java.time.Instant;

public record CategoryResponse(
        Long id,
        String title,
        String slug,
        String description,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
