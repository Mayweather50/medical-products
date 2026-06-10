package com.medicalproducts.backend.repository;

import com.medicalproducts.backend.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    List<Certificate> findAllByOrderByCreatedAtDesc();
}
