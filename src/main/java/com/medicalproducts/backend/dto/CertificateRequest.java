package com.medicalproducts.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CertificateRequest(

        @NotBlank(message = "title is required")
        String title,

        String description,

        @NotBlank(message = "fileUrl is required")
        @org.hibernate.validator.constraints.URL(message = "fileUrl must be a valid URL")
        String fileUrl
) {
}
