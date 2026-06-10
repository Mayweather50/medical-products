package com.medicalproducts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "leads", indexes = {
        @Index(name = "idx_leads_status", columnList = "status")
})
public class Lead extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 32)
    private String phone;

    private String email;

    @Column(columnDefinition = "text")
    private String comment;

    @Column(name = "product_name")
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeadStatus status = LeadStatus.NEW;
}
