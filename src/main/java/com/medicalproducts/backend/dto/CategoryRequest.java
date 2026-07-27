package com.medicalproducts.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CategoryRequest(

        @NotBlank(message = "title is required")
        String title,

        @NotBlank(message = "slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "slug must contain only lowercase latin letters, digits and hyphens")
        String slug,

        String description,

        String imageUrl,

        /** Имя иконки-заглушки; если не передано — остаётся прежняя (по умолчанию clinic). */
        String icon,

        /** Короткое название для плиток; если не передано — берётся полное. */
        String shortTitle,

        Long parentId
) {
}
