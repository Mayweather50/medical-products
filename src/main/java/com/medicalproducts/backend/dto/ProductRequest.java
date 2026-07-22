package com.medicalproducts.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductRequest(

        @NotBlank(message = "title is required")
        String title,

        @NotBlank(message = "slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "slug must contain only lowercase latin letters, digits and hyphens")
        String slug,

        String article,

        @Size(max = 1000, message = "shortDescription must be at most 1000 characters")
        String shortDescription,

        String description,

        BigDecimal price,

        Boolean priceOnRequest,

        String imageUrl,

        @Size(max = 12, message = "images must have at most 12 entries")
        List<String> images,

        @NotNull(message = "categoryId is required")
        Long categoryId,

        @Size(max = 50, message = "characteristics must have at most 50 entries")
        Map<String, String> characteristics,

        Boolean available,

        Boolean popular
) {

    /**
     * Бизнес-правило: если цена не "по запросу", она обязана быть указана и быть положительной.
     */
    @JsonIgnore
    @AssertTrue(message = "price is required and must be positive when priceOnRequest is false")
    public boolean isPriceValid() {
        if (Boolean.TRUE.equals(priceOnRequest)) {
            return true;
        }
        return price != null && price.signum() > 0;
    }
}
