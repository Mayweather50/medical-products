package com.medicalproducts.backend.controller.admin;

import com.medicalproducts.backend.service.SiteSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Admin: Settings", description = "Настройки сайта")
@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSiteSettingController {

    private final SiteSettingService siteSettingService;

    @GetMapping
    public Map<String, String> getAll() {
        return siteSettingService.getAll();
    }

    @Operation(summary = "Сохранить настройки; переданные ключи обновляются, остальные не меняются")
    @PutMapping
    public Map<String, String> update(@RequestBody Map<String, String> values) {
        return siteSettingService.update(values);
    }
}
