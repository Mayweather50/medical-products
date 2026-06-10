package com.medicalproducts.backend.dto;

import java.util.List;

public record ImportResult(
        int totalRows,
        int successCount,
        int failedCount,
        List<String> errors
) {
}
