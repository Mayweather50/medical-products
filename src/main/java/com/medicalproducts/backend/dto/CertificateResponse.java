package com.medicalproducts.backend.dto;

import java.time.Instant;

public record CertificateResponse(
        Long id,
        String title,
        String description,
        String fileUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
