package com.medicalproducts.backend.controller.admin;

import com.medicalproducts.backend.dto.ImportResult;
import com.medicalproducts.backend.dto.ProductRequest;
import com.medicalproducts.backend.dto.ProductResponse;
import com.medicalproducts.backend.service.ExcelImportService;
import com.medicalproducts.backend.service.ImageStorageService;
import com.medicalproducts.backend.service.ProductService;
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

@Tag(name = "Admin: Products", description = "Управление товарами")
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final ExcelImportService excelImportService;
    private final ImageStorageService imageStorageService;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Корзина удалённых товаров")
    @GetMapping("/trash")
    public List<ProductResponse> getTrash() {
        return productService.getDeleted();
    }

    @Operation(summary = "Восстановить товар из корзины")
    @PostMapping("/trash/{id}/restore")
    public ProductResponse restore(@PathVariable Long id) {
        return productService.restore(id);
    }

    @Operation(summary = "Удалить товар навсегда")
    @DeleteMapping("/trash/{id}")
    public ResponseEntity<Void> deletePermanently(@PathVariable Long id) {
        productService.deletePermanently(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Очистить корзину — удалить все товары навсегда")
    @DeleteMapping("/trash")
    public ResponseEntity<Map<String, Integer>> emptyTrash() {
        return ResponseEntity.ok(Map.of("deleted", productService.emptyTrash()));
    }

    @Operation(summary = "Загрузить изображение товара")
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = imageStorageService.store(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @Operation(summary = "Импорт товаров из Excel",
            description = "Загрузите .xlsx файл со столбцами: title, slug, article, shortDescription, "
                    + "description, price, priceOnRequest, imageUrl, categorySlug, available, popular")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResult> importFromExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !(filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
            throw new IllegalArgumentException("Only .xlsx and .xls files are supported");
        }
        return ResponseEntity.ok(excelImportService.importProducts(file));
    }
}
