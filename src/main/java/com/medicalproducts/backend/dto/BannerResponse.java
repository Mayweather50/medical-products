package com.medicalproducts.backend.dto;

import java.time.Instant;

public record BannerResponse(
        Long id,
        String title,
        String eyebrow,
        String imageUrl,
        String ctaLabel,
        String linkUrl,
        String tone,
        Integer sortOrder,
        Boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
