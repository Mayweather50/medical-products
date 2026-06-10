package com.medicalproducts.backend.dto;

import com.medicalproducts.backend.entity.LeadStatus;
import jakarta.validation.constraints.NotNull;

public record LeadStatusUpdateRequest(

        @NotNull(message = "status is required")
        LeadStatus status
) {
}
