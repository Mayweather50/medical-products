package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.ImportResult;
import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.entity.Product;
import com.medicalproducts.backend.repository.CategoryRepository;
import com.medicalproducts.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Expected Excel columns (first row = header):
 * A: title (required)
 * B: slug (required)
 * C: article
 * D: shortDescription
 * E: description
 * F: price
 * G: priceOnRequest (true/false)
 * H: imageUrl
 * I: categorySlug (required)
 * J: available (true/false)
 * K: popular (true/false)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ImportResult importProducts(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int totalRows = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) {
                    continue;
                }
                totalRows++;
                try {
                    Product product = parseRow(row, i + 1);
                    productRepository.save(product);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Failed to parse Excel file", e);
            throw new IllegalArgumentException("Failed to parse Excel file: " + e.getMessage());
        }

        log.info("Excel import complete: total={}, success={}, failed={}", totalRows, successCount, errors.size());
        return new ImportResult(totalRows, successCount, errors.size(), errors);
    }

    private Product parseRow(Row row, int rowNum) {
        String title = getStringCell(row, 0);
        String slug = getStringCell(row, 1);

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("slug is required");
        }

        if (productRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("product with slug '" + slug + "' already exists");
        }

        String categorySlug = getStringCell(row, 8);
        if (categorySlug == null || categorySlug.isBlank()) {
            throw new IllegalArgumentException("categorySlug is required");
        }

        Category category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new IllegalArgumentException("category with slug '" + categorySlug + "' not found"));

        Product product = new Product();
        product.setTitle(title);
        product.setSlug(slug);
        product.setArticle(getStringCell(row, 2));
        product.setShortDescription(getStringCell(row, 3));
        product.setDescription(getStringCell(row, 4));

        String priceStr = getStringCell(row, 5);
        if (priceStr != null && !priceStr.isBlank()) {
            product.setPrice(new BigDecimal(priceStr.replace(",", ".")));
        }

        product.setPriceOnRequest(getBooleanCell(row, 6));
        product.setImageUrl(getStringCell(row, 7));
        product.setCategory(category);
        product.setAvailable(getBooleanCell(row, 9, true));
        product.setPopular(getBooleanCell(row, 10));

        return product;
    }

    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < 9; i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = getStringCell(row, i);
                if (val != null && !val.isBlank()) return false;
            }
        }
        return true;
    }

    private String getStringCell(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString();
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case BLANK -> null;
            default -> null;
        };
    }

    private boolean getBooleanCell(Row row, int col) {
        return getBooleanCell(row, col, false);
    }

    private boolean getBooleanCell(Row row, int col, boolean defaultValue) {
        Cell cell = row.getCell(col);
        if (cell == null) return defaultValue;
        return switch (cell.getCellType()) {
            case BOOLEAN -> cell.getBooleanCellValue();
            case STRING -> "true".equalsIgnoreCase(cell.getStringCellValue().trim())
                    || "1".equals(cell.getStringCellValue().trim())
                    || "да".equalsIgnoreCase(cell.getStringCellValue().trim());
            case NUMERIC -> cell.getNumericCellValue() != 0;
            default -> defaultValue;
        };
    }
}
