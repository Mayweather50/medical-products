package com.medicalproducts.backend.service;

import com.medicalproducts.backend.entity.SiteSetting;
import com.medicalproducts.backend.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteSettingService {

    private final SiteSettingRepository repository;

    /** Все настройки одним объектом — фронтенд забирает их при старте. */
    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        Map<String, String> result = new LinkedHashMap<>();
        repository.findAll().forEach(s -> result.put(s.getKey(), s.getValue()));
        return result;
    }

    /**
     * Обновляет переданные ключи, остальные не трогает.
     * Неизвестный ключ создаётся — так новые поля можно добавлять без миграции.
     */
    @Transactional
    public Map<String, String> update(Map<String, String> values) {
        values.forEach((key, value) -> {
            String safeValue = value == null ? "" : value;
            SiteSetting setting = repository.findByKey(key).orElseGet(() -> {
                SiteSetting created = new SiteSetting();
                created.setKey(key);
                return created;
            });
            setting.setValue(safeValue);
            setting.setUpdatedAt(Instant.now());
            repository.save(setting);
        });
        log.info("Site settings updated: {} key(s)", values.size());
        return getAll();
    }
}
