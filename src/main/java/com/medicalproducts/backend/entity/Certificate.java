package com.medicalproducts.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "certificates")
@SQLRestriction("deleted_at IS NULL")
public class Certificate extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;
}
