package com.medicalproducts.backend.mapper;

import com.medicalproducts.backend.dto.LeadRequest;
import com.medicalproducts.backend.dto.LeadResponse;
import com.medicalproducts.backend.entity.Lead;
import org.springframework.stereotype.Component;

@Component
public class LeadMapper {

    public Lead toEntity(LeadRequest request) {
        Lead lead = new Lead();
        lead.setName(request.name());
        lead.setPhone(request.phone());
        lead.setEmail(request.email());
        lead.setComment(request.comment());
        lead.setProductName(request.productName());
        return lead;
    }

    public LeadResponse toResponse(Lead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getName(),
                lead.getPhone(),
                lead.getEmail(),
                lead.getComment(),
                lead.getProductName(),
                lead.getStatus(),
                lead.getCreatedAt(),
                lead.getUpdatedAt()
        );
    }
}
