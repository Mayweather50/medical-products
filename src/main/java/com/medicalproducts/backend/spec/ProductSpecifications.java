package com.medicalproducts.backend.spec;

import com.medicalproducts.backend.entity.Product;
import org.springframework.data.jpa.domain.Specification;

/**
 * Набор переиспользуемых спецификаций для динамической фильтрации каталога.
 */
public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> hasCategorySlug(String slug) {
        return (root, query, cb) -> cb.equal(root.get("category").get("slug"), slug);
    }

    public static Specification<Product> isAvailable(boolean available) {
        return (root, query, cb) -> cb.equal(root.get("available"), available);
    }

    public static Specification<Product> isPopular(boolean popular) {
        return (root, query, cb) -> cb.equal(root.get("popular"), popular);
    }

    public static Specification<Product> matchesQuery(String text) {
        String like = "%" + text.toLowerCase().trim() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("article")), like),
                cb.like(cb.lower(root.get("shortDescription")), like)
        );
    }
}
