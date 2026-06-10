package com.medicalproducts.backend.dto;

public record OrderItemResponse(
        Long productId,
        String productTitle,
        String productSlug,
        String article,
        int quantity
) {
}
