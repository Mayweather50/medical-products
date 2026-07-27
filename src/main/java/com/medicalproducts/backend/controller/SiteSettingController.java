package com.medicalproducts.backend.controller;

import com.medicalproducts.backend.service.SiteSettingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Settings", description = "Публичные настройки сайта: контакты, реквизиты, тексты")
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    @GetMapping
    public Map<String, String> getAll() {
        return siteSettingService.getAll();
    }
}
