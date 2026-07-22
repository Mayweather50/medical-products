package com.medicalproducts.backend.mapper;

import com.medicalproducts.backend.dto.ProductRequest;
import com.medicalproducts.backend.dto.ProductResponse;
import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final CategoryMapper categoryMapper;

    public Product toEntity(ProductRequest request, Category category) {
        Product product = new Product();
        applyRequest(product, request, category);
        return product;
    }

    public void updateEntity(Product product, ProductRequest request, Category category) {
        applyRequest(product, request, category);
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getSlug(),
                product.getArticle(),
                product.getShortDescription(),
                product.getDescription(),
                product.getPrice(),
                product.isPriceOnRequest(),
                product.getImageUrl(),
                product.getImages(),
                categoryMapper.toSummary(product.getCategory()),
                product.getCharacteristics(),
                product.isAvailable(),
                product.isPopular(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private void applyRequest(Product product, ProductRequest request, Category category) {
        product.setTitle(request.title());
        product.setSlug(request.slug());
        product.setArticle(request.article());
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setPriceOnRequest(Boolean.TRUE.equals(request.priceOnRequest()));
        applyImages(product, request);
        product.setCategory(category);
        product.setCharacteristics(request.characteristics() == null
                ? new LinkedHashMap<>()
                : new LinkedHashMap<>(request.characteristics()));
        product.setAvailable(request.available() == null || request.available());
        product.setPopular(Boolean.TRUE.equals(request.popular()));
    }

    /**
     * Держит обложку и галерею согласованными: обложка — всегда первый кадр.
     * Клиент может прислать только imageUrl (старый формат) или только images.
     */
    private void applyImages(Product product, ProductRequest request) {
        List<String> images = request.images() == null ? List.of() : request.images().stream()
                .filter(url -> url != null && !url.isBlank())
                .map(String::trim)
                .distinct()
                .toList();

        if (images.isEmpty()) {
            String cover = request.imageUrl();
            boolean hasCover = cover != null && !cover.isBlank();
            product.setImageUrl(hasCover ? cover.trim() : null);
            product.setImages(hasCover ? new ArrayList<>(List.of(cover.trim())) : new ArrayList<>());
            return;
        }

        product.setImages(new ArrayList<>(images));
        product.setImageUrl(images.get(0));
    }
}
