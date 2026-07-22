package com.medicalproducts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

/** Слайд баннера на главной странице. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "banners")
@SQLRestriction("deleted_at IS NULL")
public class Banner extends BaseEntity {

    @Column(nullable = false)
    private String title;

    /** Надпись над заголовком. */
    private String eyebrow;

    @Column(name = "image_url")
    private String imageUrl;

    /** Текст кнопки. */
    @Column(name = "cta_label")
    private String ctaLabel;

    /** Куда ведёт кнопка, например /catalog?cat=implantaty. */
    @Column(name = "link_url")
    private String linkUrl;

    /** Градиент-подложка, если фото не задано: teal / deep / azure. */
    @Column(nullable = false, length = 32)
    private String tone = "teal";

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;
}
