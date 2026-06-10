package com.medicalproducts.backend.controller;

import com.medicalproducts.backend.dto.CertificateResponse;
import com.medicalproducts.backend.service.CertificateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Certificates", description = "Публичный список сертификатов")
@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public List<CertificateResponse> getAll() {
        return certificateService.getAll();
    }
}
