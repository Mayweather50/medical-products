package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.CertificateRequest;
import com.medicalproducts.backend.dto.CertificateResponse;
import com.medicalproducts.backend.entity.Certificate;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.CertificateMapper;
import com.medicalproducts.backend.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CertificateMapper certificateMapper;

    @Transactional(readOnly = true)
    public List<CertificateResponse> getAll() {
        return certificateRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(certificateMapper::toResponse)
                .toList();
    }

    @Transactional
    public CertificateResponse create(CertificateRequest request) {
        Certificate certificate = certificateRepository.save(certificateMapper.toEntity(request));
        return certificateMapper.toResponse(certificate);
    }

    @Transactional
    public CertificateResponse update(Long id, CertificateRequest request) {
        Certificate certificate = findById(id);
        certificateMapper.updateEntity(certificate, request);
        return certificateMapper.toResponse(certificate);
    }

    @Transactional
    public void delete(Long id) {
        certificateRepository.delete(findById(id));
    }

    private Certificate findById(Long id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate with id " + id + " not found"));
    }
}
