package com.medicalproducts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Настройка сайта в виде «ключ — значение»: контакты, реквизиты, тексты главной.
 * Не наследует BaseEntity: мягкое удаление здесь не нужно, набор ключей задаётся
 * миграцией, а из админки меняются только значения.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "site_settings")
public class SiteSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 64)
    private String key;

    @Column(nullable = false, columnDefinition = "text")
    private String value = "";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
