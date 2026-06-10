package com.medicalproducts.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "name is required")
        @Size(max = 255)
        String name,

        @NotBlank(message = "phone is required")
        @Pattern(regexp = "^\\+?[0-9]{1}[0-9()\\-\\s]{4,29}$",
                message = "phone must start with a digit (optionally +) and contain 5-30 characters")
        String phone,

        @Size(max = 1000, message = "comment must be at most 1000 characters")
        String comment,

        @NotEmpty(message = "items must not be empty")
        @Valid
        List<OrderItemRequest> items
) {
}
