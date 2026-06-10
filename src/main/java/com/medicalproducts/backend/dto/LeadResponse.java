package com.medicalproducts.backend.dto;

import com.medicalproducts.backend.entity.LeadStatus;

import java.time.Instant;

public record LeadResponse(
        Long id,
        String name,
        String phone,
        String email,
        String comment,
        String productName,
        LeadStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
