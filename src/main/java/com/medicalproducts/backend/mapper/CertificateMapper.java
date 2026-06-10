package com.medicalproducts.backend.mapper;

import com.medicalproducts.backend.dto.CertificateRequest;
import com.medicalproducts.backend.dto.CertificateResponse;
import com.medicalproducts.backend.entity.Certificate;
import org.springframework.stereotype.Component;

@Component
public class CertificateMapper {

    public Certificate toEntity(CertificateRequest request) {
        Certificate certificate = new Certificate();
        applyRequest(certificate, request);
        return certificate;
    }

    public void updateEntity(Certificate certificate, CertificateRequest request) {
        applyRequest(certificate, request);
    }

    public CertificateResponse toResponse(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getTitle(),
                certificate.getDescription(),
                certificate.getFileUrl(),
                certificate.getCreatedAt(),
                certificate.getUpdatedAt()
        );
    }

    private void applyRequest(Certificate certificate, CertificateRequest request) {
        certificate.setTitle(request.title());
        certificate.setDescription(request.description());
        certificate.setFileUrl(request.fileUrl());
    }
}
