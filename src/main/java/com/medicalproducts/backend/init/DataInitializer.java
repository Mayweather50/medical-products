package com.medicalproducts.backend.init;

import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.entity.Certificate;
import com.medicalproducts.backend.entity.Product;
import com.medicalproducts.backend.entity.Role;
import com.medicalproducts.backend.entity.User;
import com.medicalproducts.backend.repository.CategoryRepository;
import com.medicalproducts.backend.repository.CertificateRepository;
import com.medicalproducts.backend.repository.ProductRepository;
import com.medicalproducts.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Наполняет базу тестовыми данными при первом запуске (если таблица категорий пуста).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin12345}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdminUser();
        if (categoryRepository.count() > 0) {
            log.info("Database already initialized, skipping seed data");
            return;
        }
        log.info("Seeding initial categories and products...");

        Category stomatEquipment = category("Стоматологическое оборудование", "stomatologicheskoe-oborudovanie",
                "Стоматологические установки, автоклавы, компрессоры и аспирация");
        Category labEquipment = category("Зуботехническое оборудование", "zubotehnicheskoe-oborudovanie",
                "Микромоторы, печи, смесители и оснащение зуботехнической лаборатории");
        Category xray = category("Рентген оборудование", "rentgen-oborudovanie",
                "Радиовизиографы, дентальные и панорамные рентген-аппараты");
        Category implant = category("Имплантология и хирургия", "implantologiya-i-hirurgiya",
                "Имплантаты, физиодиспенсеры и хирургический инструмент");
        Category anesthesia = category("Анестезия", "anesteziya",
                "Карпульная анестезия, иглы и аксессуары для обезболивания");

        categoryRepository.saveAll(java.util.List.of(
                stomatEquipment, labEquipment, xray, implant, anesthesia));

        productRepository.saveAll(java.util.List.of(
                productOnRequest("Стоматологическая установка", "stomatologicheskaya-ustanovka", "DEN-0001",
                        "Стоматологическая установка с верхней подачей инструментов и креслом пациента",
                        stomatEquipment,
                        chars("Подача инструментов", "Верхняя", "Кресло", "В комплекте", "Гидроблок", "Керамический")),
                product("Автоклав класса B", "avtoklav-klass-b", "DEN-0002",
                        "Паровой стерилизатор класса B, объём камеры 18 л",
                        new BigDecimal("185000.00"), stomatEquipment, true,
                        chars("Класс", "B", "Объём камеры", "18 л", "Циклы", "Программируемые")),
                product("Стоматологический компрессор", "stomatologicheskiy-kompressor", "DEN-0003",
                        "Безмасляный компрессор на 2 установки с осушителем",
                        new BigDecimal("62000.00"), stomatEquipment, false,
                        chars("Тип", "Безмасляный", "Установок", "2", "Осушитель", "Да")),
                product("Зуботехнический микромотор", "zubotehnicheskiy-mikromotor", "DEN-0004",
                        "Бесщёточный микромотор с наконечником для зуботехнических работ",
                        new BigDecimal("28000.00"), labEquipment, true,
                        chars("Тип", "Бесщёточный", "Обороты", "до 50 000 об/мин", "Управление", "Педаль")),
                product("Вакуумный смеситель", "vakuumnyy-smesitel", "DEN-0005",
                        "Вакуумный смеситель для гипса и паковочных масс",
                        new BigDecimal("95000.00"), labEquipment, false,
                        chars("Объём", "500 мл", "Вакуум", "Встроенный насос", "Таймер", "Да")),
                product("Пескоструйный аппарат", "peskostruynyy-apparat", "DEN-0006",
                        "Лабораторный пескоструйный аппарат с двумя бачками",
                        new BigDecimal("41000.00"), labEquipment, false,
                        chars("Бачки", "2", "Абразив", "50 и 110 мкм", "Давление", "Регулируемое")),
                productOnRequest("Радиовизиограф", "radioviziograf", "DEN-0007",
                        "Дентальный радиовизиограф с высоким разрешением сенсора",
                        xray,
                        chars("Тип сенсора", "CMOS", "Разрешение", "> 20 пар линий/мм", "Размер", "Size 1.5")),
                productOnRequest("Дентальный рентген-аппарат", "dentalnyy-rentgen-apparat", "DEN-0008",
                        "Настенный высокочастотный дентальный рентген-аппарат",
                        xray,
                        chars("Тип", "Высокочастотный", "Напряжение", "60–70 кВ", "Крепление", "Настенное")),
                productOnRequest("Панорамный рентген (ОПТГ)", "panoramnyy-rentgen-optg", "DEN-0009",
                        "Панорамный рентген-аппарат для ортопантомограммы",
                        xray,
                        chars("Режимы", "ОПТГ, ТРГ", "Сенсор", "CMOS", "Управление", "ПК")),
                productOnRequest("Набор дентальных имплантатов", "nabor-dentalnyh-implantatov", "DEN-0010",
                        "Хирургический набор дентальных имплантатов с инструментом",
                        implant,
                        chars("Материал", "Титан Grade 4", "Поверхность", "SLA", "Соединение", "Внутренний шестигранник")),
                product("Физиодиспенсер хирургический", "fiziodispenser-hirurgicheskiy", "DEN-0011",
                        "Хирургический мотор-физиодиспенсер с наконечником и помпой",
                        new BigDecimal("145000.00"), implant, true,
                        chars("Обороты", "300–40 000 об/мин", "Момент", "до 80 Н·см", "Помпа", "Перистальтическая")),
                productOnRequest("Пьезохирургический аппарат", "pezohirurgicheskiy-apparat", "DEN-0012",
                        "Ультразвуковой пьезохирургический аппарат для костной хирургии",
                        implant,
                        chars("Технология", "Пьезо", "Насадки", "Набор", "Охлаждение", "Ирригация")),
                product("Артикаин карпульный", "artikain-karpulnyy", "DEN-0013",
                        "Артикаин с адреналином 1:100000, 50 карпул по 1,7 мл",
                        new BigDecimal("1900.00"), anesthesia, true,
                        chars("Действующее вещество", "Артикаин 4%", "Вазоконстриктор", "Адреналин 1:100000", "Упаковка", "50x1,7 мл")),
                product("Иглы карпульные", "igly-karpulnye", "DEN-0014",
                        "Одноразовые карпульные иглы для инъекций, 100 шт.",
                        new BigDecimal("450.00"), anesthesia, false,
                        chars("Размеры", "27G, 30G", "Длина", "12–35 мм", "Количество", "100 шт.")),
                product("Карпульный инъектор", "karpulnyy-inektor", "DEN-0015",
                        "Металлический карпульный шприц-инъектор с аспирацией",
                        new BigDecimal("2800.00"), anesthesia, false,
                        chars("Материал", "Нержавеющая сталь", "Аспирация", "Да", "Тип", "Байонетный"))
        ));

        certificateRepository.saveAll(java.util.List.of(
                certificate("Регистрационное удостоверение Росздравнадзора",
                        "Подтверждает регистрацию медицинских изделий в РФ. РЗН 2024/12345",
                        "/docs/rzn-2024-12345.pdf"),
                certificate("Декларация соответствия ТР ТС",
                        "Соответствие техническим регламентам Таможенного союза. ЕАЭС N RU Д-CN.РА01.В.01234",
                        "/docs/eaes-ru-d-cn-ra01.pdf"),
                certificate("Сертификат ISO 13485",
                        "Система менеджмента качества медицинских изделий. ISO 13485:2016",
                        "/docs/iso-13485-2016.pdf"),
                certificate("Сертификат соответствия ГОСТ Р",
                        "Добровольная сертификация продукции по ГОСТ Р. РОСС RU.0001.11АБ12",
                        "/docs/gost-r-ross-ru.pdf")
        ));

        log.info("Seed data created: {} categories, {} products, {} certificates",
                categoryRepository.count(), productRepository.count(), certificateRepository.count());
    }

    /** Создаёт администратора при первом запуске (логин/пароль задаются через app.admin.*). */
    private void seedAdminUser() {
        if (userRepository.count() > 0) {
            return;
        }
        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ROLE_ADMIN);
        userRepository.save(admin);
        log.warn("Created default admin user '{}'. Change the password in production (app.admin.password)!",
                adminUsername);
    }

    private Certificate certificate(String title, String description, String fileUrl) {
        Certificate certificate = new Certificate();
        certificate.setTitle(title);
        certificate.setDescription(description);
        certificate.setFileUrl(fileUrl);
        return certificate;
    }

    private Category category(String title, String slug, String description) {
        Category category = new Category();
        category.setTitle(title);
        category.setSlug(slug);
        category.setDescription(description);
        return category;
    }

    private Product product(String title, String slug, String article, String shortDescription,
                            BigDecimal price, Category category, boolean popular,
                            Map<String, String> characteristics) {
        Product product = new Product();
        product.setTitle(title);
        product.setSlug(slug);
        product.setArticle(article);
        product.setShortDescription(shortDescription);
        product.setDescription(shortDescription + ". Сертифицированный товар, поставка со склада.");
        product.setPrice(price);
        product.setPriceOnRequest(false);
        product.setCategory(category);
        product.setPopular(popular);
        product.setAvailable(true);
        product.setCharacteristics(characteristics);
        return product;
    }

    private Product productOnRequest(String title, String slug, String article, String shortDescription,
                                     Category category, Map<String, String> characteristics) {
        Product product = product(title, slug, article, shortDescription, null, category, false, characteristics);
        product.setPriceOnRequest(true);
        return product;
    }

    private Map<String, String> chars(String... keyValues) {
        Map<String, String> map = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put(keyValues[i], keyValues[i + 1]);
        }
        return map;
    }
}
