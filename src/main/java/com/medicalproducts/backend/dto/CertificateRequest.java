package com.medicalproducts.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CertificateRequest(

        @NotBlank(message = "title is required")
        String title,

        String description,

        /* Либо внешняя ссылка, либо путь на этом же сайте (/uploads/...),
           который возвращает загрузчик файлов. */
        @NotBlank(message = "fileUrl is required")
        @Pattern(regexp = "^(https?://\\S+|/\\S*)$",
                message = "fileUrl must be an http(s) link or a site path starting with /")
        String fileUrl
) {
}
