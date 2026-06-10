package com.medicalproducts.backend.controller.admin;

import com.medicalproducts.backend.dto.LeadResponse;
import com.medicalproducts.backend.dto.LeadStatusUpdateRequest;
import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.entity.LeadStatus;
import com.medicalproducts.backend.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Leads", description = "Просмотр и обработка заявок")
@RestController
@RequestMapping("/api/admin/leads")
@RequiredArgsConstructor
public class AdminLeadController {

    private final LeadService leadService;

    @GetMapping
    public PageResponse<LeadResponse> getAll(@RequestParam(required = false) LeadStatus status,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return leadService.getAll(status, page, size);
    }

    @GetMapping("/{id}")
    public LeadResponse getById(@PathVariable Long id) {
        return leadService.getById(id);
    }

    @PutMapping("/{id}/status")
    public LeadResponse updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody LeadStatusUpdateRequest request) {
        return leadService.updateStatus(id, request.status());
    }
}
