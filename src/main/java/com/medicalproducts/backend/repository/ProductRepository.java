package com.medicalproducts.backend.repository;

import com.medicalproducts.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = "category")
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByCategoryId(Long categoryId);

    long countByCategoryId(Long categoryId);

    /** Кол-во товаров в каждой категории одним запросом (для списка категорий). */
    @Query("select p.category.id as categoryId, count(p) as productCount from Product p group by p.category.id")
    List<CategoryProductCount> countGroupedByCategory();

    interface CategoryProductCount {
        Long getCategoryId();
        long getProductCount();
    }

    @EntityGraph(attributePaths = "category")
    List<Product> findTop12ByPopularTrueAndAvailableTrueOrderByCreatedAtDesc();

    @Query(value = "SELECT p.* FROM products p JOIN categories c ON p.category_id = c.id WHERE p.deleted_at IS NOT NULL ORDER BY p.deleted_at DESC",
            nativeQuery = true)
    List<Product> findDeleted();

    /**
     * Переопределяем метод из JpaSpecificationExecutor, чтобы категория
     * подтягивалась одним запросом (защита от N+1 на страницах каталога).
     */
    @Override
    @EntityGraph(attributePaths = "category")
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);
}
