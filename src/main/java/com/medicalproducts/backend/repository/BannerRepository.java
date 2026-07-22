package com.medicalproducts.backend.repository;

import com.medicalproducts.backend.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByActiveTrueOrderBySortOrderAscIdAsc();

    List<Banner> findAllByOrderBySortOrderAscIdAsc();
}
