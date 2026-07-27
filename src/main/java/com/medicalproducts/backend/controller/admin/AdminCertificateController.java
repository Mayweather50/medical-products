package com.medicalproducts.backend.controller.admin;

import com.medicalproducts.backend.dto.CertificateRequest;
import com.medicalproducts.backend.dto.CertificateResponse;
import com.medicalproducts.backend.service.CertificateService;
import com.medicalproducts.backend.service.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin: Certificates", description = "Управление сертификатами")
@RestController
@RequestMapping("/api/admin/certificates")
@RequiredArgsConstructor
public class AdminCertificateController {

    private final CertificateService certificateService;
    private final ImageStorageService imageStorageService;

    @GetMapping
    public List<CertificateResponse> getAll() {
        return certificateService.getAll();
    }

    @PostMapping
    public ResponseEntity<CertificateResponse> create(@Valid @RequestBody CertificateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(certificateService.create(request));
    }

    @PutMapping("/{id}")
    public CertificateResponse update(@PathVariable Long id, @Valid @RequestBody CertificateRequest request) {
        return certificateService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        certificateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Загрузить файл сертификата (PDF или скан)")
    @PostMapping(value = "/upload-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("url", imageStorageService.storeDocument(file)));
    }
}
