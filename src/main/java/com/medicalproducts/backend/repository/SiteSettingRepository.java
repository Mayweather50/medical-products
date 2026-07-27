package com.medicalproducts.backend.repository;

import com.medicalproducts.backend.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {

    Optional<SiteSetting> findByKey(String key);
}
