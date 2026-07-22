package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.BannerRequest;
import com.medicalproducts.backend.dto.BannerResponse;
import com.medicalproducts.backend.entity.Banner;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.mapper.BannerMapper;
import com.medicalproducts.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    /** Публичный список: только активные слайды в порядке сортировки. */
    @Transactional(readOnly = true)
    public List<BannerResponse> getActive() {
        return bannerRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(bannerMapper::toResponse)
                .toList();
    }

    /** Список для админки: включая выключенные слайды. */
    @Transactional(readOnly = true)
    public List<BannerResponse> getAll() {
        return bannerRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(bannerMapper::toResponse)
                .toList();
    }

    @Transactional
    public BannerResponse create(BannerRequest request) {
        Banner banner = bannerMapper.toEntity(request);
        banner = bannerRepository.save(banner);
        log.info("Banner created: id={}, title='{}'", banner.getId(), banner.getTitle());
        return bannerMapper.toResponse(banner);
    }

    @Transactional
    public BannerResponse update(Long id, BannerRequest request) {
        Banner banner = findById(id);
        bannerMapper.updateEntity(banner, request);
        log.info("Banner updated: id={}, title='{}'", id, request.title());
        return bannerMapper.toResponse(banner);
    }

    @Transactional
    public void delete(Long id) {
        Banner banner = findById(id);
        banner.markDeleted();
        log.info("Banner soft-deleted: id={}, title='{}'", id, banner.getTitle());
    }

    private Banner findById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner with id " + id + " not found"));
    }
}
