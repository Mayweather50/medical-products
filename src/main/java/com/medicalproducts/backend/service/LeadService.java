package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.LeadRequest;
import com.medicalproducts.backend.dto.LeadResponse;
import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.entity.Lead;
import com.medicalproducts.backend.entity.LeadStatus;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.LeadMapper;
import com.medicalproducts.backend.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeadService {

    private static final int MAX_PAGE_SIZE = 100;

    private final LeadRepository leadRepository;
    private final LeadMapper leadMapper;

    @Transactional
    public LeadResponse create(LeadRequest request) {
        Lead lead = leadRepository.save(leadMapper.toEntity(request));
        return leadMapper.toResponse(lead);
    }

    @Transactional(readOnly = true)
    public PageResponse<LeadResponse> getAll(LeadStatus status, int page, int size) {
        Pageable pageable = pageRequest(page, size);
        Page<Lead> leads = status == null
                ? leadRepository.findAll(pageable)
                : leadRepository.findByStatus(status, pageable);
        return PageResponse.of(leads.map(leadMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public LeadResponse getById(Long id) {
        return leadMapper.toResponse(findById(id));
    }

    @Transactional
    public LeadResponse updateStatus(Long id, LeadStatus status) {
        Lead lead = findById(id);
        lead.setStatus(status);
        return leadMapper.toResponse(lead);
    }

    private Lead findById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead with id " + id + " not found"));
    }

    private Pageable pageRequest(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
