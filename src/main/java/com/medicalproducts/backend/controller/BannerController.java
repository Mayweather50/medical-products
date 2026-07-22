package com.medicalproducts.backend.controller;

import com.medicalproducts.backend.dto.BannerResponse;
import com.medicalproducts.backend.service.BannerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Banners", description = "Баннеры главной страницы")
@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public List<BannerResponse> getAll() {
        return bannerService.getActive();
    }
}
