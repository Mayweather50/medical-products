package com.medicalproducts.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record BannerRequest(

        @NotBlank(message = "title is required")
        String title,

        String eyebrow,

        String imageUrl,

        String ctaLabel,

        String linkUrl,

        @Pattern(regexp = "teal|deep|azure", message = "tone must be one of: teal, deep, azure")
        String tone,

        Integer sortOrder,

        Boolean active
) {
}
