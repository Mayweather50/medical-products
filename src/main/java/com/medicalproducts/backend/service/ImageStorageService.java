package com.medicalproducts.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    /** Сертификаты и декларации чаще всего присылают в PDF, поэтому для них набор шире. */
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/png", "image/webp"
    );

    private final Path uploadDir;

    public ImageStorageService(@Value("${app.upload.dir:uploads}") String dir) {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory: " + this.uploadDir, e);
        }
    }

    public String store(MultipartFile file) {
        return save(file, ALLOWED_TYPES,
                "Only JPEG, PNG, WebP and GIF images are allowed");
    }

    /** Сертификаты и другие документы: PDF плюс сканы в виде картинок. */
    public String storeDocument(MultipartFile file) {
        return save(file, ALLOWED_DOCUMENT_TYPES,
                "Only PDF, JPEG, PNG and WebP files are allowed");
    }

    private String save(MultipartFile file, Set<String> allowedTypes, String typeError) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File too large (max 10 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException(typeError);
        }

        String ext = extensionFromType(contentType);
        String filename = UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(filename).normalize();

        if (!target.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        try {
            Files.copy(file.getInputStream(), target);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }

        log.info("File uploaded: {}", filename);
        return "/uploads/" + filename;
    }

    private String extensionFromType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "application/pdf" -> ".pdf";
            default -> ".bin";
        };
    }
}
