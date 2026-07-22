package com.medicalproducts.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ProductResponse(
        Long id,
        String title,
        String slug,
        String article,
        String shortDescription,
        String description,
        BigDecimal price,
        boolean priceOnRequest,
        String imageUrl,
        List<String> images,
        CategorySummaryResponse category,
        Map<String, String> characteristics,
        boolean available,
        boolean popular,
        Instant createdAt,
        Instant updatedAt
) {
}
