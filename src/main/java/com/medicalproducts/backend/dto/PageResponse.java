package com.medicalproducts.backend.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Стабильный контракт пагинации вместо сериализации Page/PageImpl напрямую.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext()
        );
    }
}
