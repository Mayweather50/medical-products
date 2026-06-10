package com.medicalproducts.backend.dto;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        String customerPhone,
        String comment,
        String status,
        List<OrderItemResponse> items,
        Instant createdAt
) {
}
