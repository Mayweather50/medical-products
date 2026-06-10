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
        @Pattern(regexp = "^\\+?[0-9()\\-\\s]{5,30}$",
                message = "phone must contain only digits, +, -, parentheses and spaces")
        String phone,

        @Email(message = "email must be a valid email address")
        String email,

        @Size(max = 2000, message = "comment must be at most 2000 characters")
        String comment,

        @Size(max = 255)
        String productName
) {
}
