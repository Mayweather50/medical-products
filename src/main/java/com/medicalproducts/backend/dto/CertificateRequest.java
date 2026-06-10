package com.medicalproducts.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CertificateRequest(

        @NotBlank(message = "title is required")
        String title,

        String description,

        @NotBlank(message = "fileUrl is required")
        String fileUrl
) {
}
