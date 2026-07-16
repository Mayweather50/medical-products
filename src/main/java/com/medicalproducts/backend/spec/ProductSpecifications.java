package com.medicalproducts.backend.spec;

import com.medicalproducts.backend.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

/**
 * Набор переиспользуемых спецификаций для динамической фильтрации каталога.
 */
public final class ProductSpecifications {

    private static final int MAX_QUERY_LENGTH = 100;

    private ProductSpecifications() {
    }

    /** Совпадение по слагу самой категории ИЛИ её родителя — клик по родителю показывает товары подкатегорий. */
    public static Specification<Product> hasCategorySlug(String slug) {
        return (root, query, cb) -> {
            Join<Object, Object> category = root.join("category", JoinType.LEFT);
            Join<Object, Object> parent = category.join("parent", JoinType.LEFT);
            return cb.or(cb.equal(category.get("slug"), slug), cb.equal(parent.get("slug"), slug));
        };
    }

    public static Specification<Product> isAvailable(boolean available) {
        return (root, query, cb) -> cb.equal(root.get("available"), available);
    }

    public static Specification<Product> isPopular(boolean popular) {
        return (root, query, cb) -> cb.equal(root.get("popular"), popular);
    }

    public static Specification<Product> matchesQuery(String text) {
        String trimmed = text.trim();
        if (trimmed.length() > MAX_QUERY_LENGTH) {
            trimmed = trimmed.substring(0, MAX_QUERY_LENGTH);
        }
        String escaped = trimmed.toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        String like = "%" + escaped + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like, '\\'),
                cb.like(cb.lower(root.get("article")), like, '\\'),
                cb.like(cb.lower(root.get("shortDescription")), like, '\\')
        );
    }
}
