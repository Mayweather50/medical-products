package com.medicalproducts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "categories")
@SQLRestriction("deleted_at IS NULL")
public class Category extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    /** Фото категории (/uploads/...). Может отсутствовать — тогда рисуется иконка. */
    @Column(name = "image_url")
    private String imageUrl;

    /** Имя иконки-заглушки из фронтового набора CAT_ICONS. */
    @Column(nullable = false, length = 64)
    private String icon = "clinic";

    /** Короткое название для плиток и карточек товара. */
    @Column(name = "short_title", nullable = false, length = 120)
    private String shortTitle;

    /** Родительская категория (null — категория верхнего уровня). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;
}
