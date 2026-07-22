package com.medicalproducts.backend.controller.admin;

import com.medicalproducts.backend.dto.BannerRequest;
import com.medicalproducts.backend.dto.BannerResponse;
import com.medicalproducts.backend.service.BannerService;
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
import com.medicalproducts.backend.service.ImageStorageService;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin: Banners", description = "Управление баннерами главной страницы")
@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;
    private final ImageStorageService imageStorageService;

    @GetMapping
    public List<BannerResponse> getAll() {
        return bannerService.getAll();
    }

    @PostMapping
    public ResponseEntity<BannerResponse> create(@Valid @RequestBody BannerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bannerService.create(request));
    }

    @PutMapping("/{id}")
    public BannerResponse update(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return bannerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Загрузить изображение баннера")
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("url", imageStorageService.store(file)));
    }
}
