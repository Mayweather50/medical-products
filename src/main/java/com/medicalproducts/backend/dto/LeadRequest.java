package com.medicalproducts.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LeadRequest(

        @NotBlank(message = "name is required")
        @Size(max = 255)
        String name,

        @NotBlank(message = "phone is required")
        @Pattern(regexp = "^\\+?[0-9]{1}[0-9()\\-\\s]{4,29}$",
                message = "phone must start with a digit (optionally +) and contain 5-30 characters")
        String phone,

        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid email address")
        String email,

        @Size(max = 2000, message = "comment must be at most 2000 characters")
        String comment,

        @Size(max = 255)
        String productName
) {
}
