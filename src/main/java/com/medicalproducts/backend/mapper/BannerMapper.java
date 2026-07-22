package com.medicalproducts.backend.mapper;

import com.medicalproducts.backend.dto.BannerRequest;
import com.medicalproducts.backend.dto.BannerResponse;
import com.medicalproducts.backend.entity.Banner;
import org.springframework.stereotype.Component;

@Component
public class BannerMapper {

    public Banner toEntity(BannerRequest request) {
        Banner banner = new Banner();
        applyRequest(banner, request);
        return banner;
    }

    public void updateEntity(Banner banner, BannerRequest request) {
        applyRequest(banner, request);
    }

    public BannerResponse toResponse(Banner banner) {
        return new BannerResponse(
                banner.getId(),
                banner.getTitle(),
                banner.getEyebrow(),
                banner.getImageUrl(),
                banner.getCtaLabel(),
                banner.getLinkUrl(),
                banner.getTone(),
                banner.getSortOrder(),
                banner.getActive(),
                banner.getCreatedAt(),
                banner.getUpdatedAt()
        );
    }

    private void applyRequest(Banner banner, BannerRequest request) {
        banner.setTitle(request.title());
        banner.setEyebrow(request.eyebrow());
        banner.setImageUrl(request.imageUrl());
        banner.setCtaLabel(request.ctaLabel());
        banner.setLinkUrl(request.linkUrl());
        banner.setTone(request.tone() != null ? request.tone() : "teal");
        banner.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        banner.setActive(request.active() != null ? request.active() : Boolean.TRUE);
    }
}
