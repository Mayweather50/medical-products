package com.medicalproducts.backend.init;

import com.medicalproducts.backend.entity.Category;
import com.medicalproducts.backend.entity.Certificate;
import com.medicalproducts.backend.entity.Product;
import com.medicalproducts.backend.repository.CategoryRepository;
import com.medicalproducts.backend.repository.CertificateRepository;
import com.medicalproducts.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
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

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("Database already initialized, skipping seed data");
            return;
        }
        log.info("Seeding initial categories and products...");

        Category consumables = category("Медицинские расходные материалы", "rashodnye-materialy",
                "Одноразовые расходные материалы для медицинских учреждений");
        Category ppe = category("Средства индивидуальной защиты", "siz",
                "СИЗ: маски, халаты, перчатки и другая защита персонала");
        Category diagnostics = category("Диагностическое оборудование", "diagnosticheskoe-oborudovanie",
                "Приборы для диагностики и контроля состояния пациента");
        Category rehab = category("Реабилитационные товары", "reabilitatsionnye-tovary",
                "Средства реабилитации и восстановления подвижности");
        Category care = category("Товары для ухода", "tovary-dlya-uhoda",
                "Товары для ухода за пациентами на дому и в стационаре");
        Category disinfection = category("Дезинфекция и антисептики", "dezinfektsiya-i-antiseptiki",
                "Антисептики и средства дезинфекции поверхностей и кожи");
        Category furniture = category("Медицинская мебель", "meditsinskaya-mebel",
                "Кушетки, кресла, шкафы и другая мебель для медучреждений");
        Category clinicEquipment = category("Оборудование для клиник", "oborudovanie-dlya-klinik",
                "Профессиональное оборудование для оснащения клиник");

        categoryRepository.saveAll(java.util.List.of(
                consumables, ppe, diagnostics, rehab, care, disinfection, furniture, clinicEquipment));

        productRepository.saveAll(java.util.List.of(
                product("Перчатки нитриловые", "perchatki-nitrilovye", "MD-0001",
                        "Нитриловые смотровые перчатки, неопудренные, 100 шт. в упаковке",
                        new BigDecimal("450.00"), consumables, true,
                        chars("Материал", "Нитрил", "Размеры", "S, M, L, XL", "Количество", "100 шт.")),
                product("Маски медицинские", "maski-meditsinskie", "MD-0002",
                        "Трёхслойные одноразовые медицинские маски, 50 шт. в упаковке",
                        new BigDecimal("250.00"), ppe, true,
                        chars("Слои", "3", "Количество", "50 шт.", "Крепление", "Резинки")),
                product("Антисептик кожный", "antiseptik-kozhnyy", "MD-0003",
                        "Спиртовой кожный антисептик, 1 л, с дозатором",
                        new BigDecimal("320.00"), disinfection, false,
                        chars("Объём", "1 л", "Основа", "Этиловый спирт 70%", "Дозатор", "Да")),
                product("Тонометр автоматический", "tonometr-avtomaticheskiy", "MD-0004",
                        "Автоматический тонометр на плечо с индикатором аритмии",
                        new BigDecimal("2890.00"), diagnostics, true,
                        chars("Тип", "Автоматический", "Манжета", "22–42 см", "Память", "2x60 измерений")),
                product("Пульсоксиметр", "pulsoksimetr", "MD-0005",
                        "Пульсоксиметр на палец с OLED-дисплеем",
                        new BigDecimal("1490.00"), diagnostics, true,
                        chars("Дисплей", "OLED", "Диапазон SpO2", "70–100%", "Питание", "2x AAA")),
                product("Термометр бесконтактный", "termometr-beskontaktnyy", "MD-0006",
                        "Инфракрасный бесконтактный термометр для лба",
                        new BigDecimal("1990.00"), diagnostics, false,
                        chars("Тип", "Инфракрасный", "Время измерения", "1 сек", "Память", "32 измерения")),
                product("Бахилы одноразовые", "bahily-odnorazovye", "MD-0007",
                        "Полиэтиленовые одноразовые бахилы, 100 пар",
                        new BigDecimal("180.00"), consumables, false,
                        chars("Материал", "ПНД", "Количество", "100 пар", "Плотность", "20 мкм")),
                product("Халат медицинский", "halat-meditsinskiy", "MD-0008",
                        "Одноразовый нестерильный медицинский халат на завязках",
                        new BigDecimal("390.00"), ppe, false,
                        chars("Материал", "Спанбонд", "Плотность", "25 г/м²", "Размер", "Универсальный")),
                product("Кушетка медицинская", "kushetka-meditsinskaya", "MD-0009",
                        "Смотровая кушетка с регулируемым подголовником",
                        new BigDecimal("8900.00"), furniture, false,
                        chars("Нагрузка", "до 160 кг", "Каркас", "Сталь", "Обивка", "Винилискожа")),
                product("Контейнер для утилизации отходов", "konteyner-dlya-utilizatsii", "MD-0010",
                        "Контейнер для сбора и утилизации медицинских отходов класса Б, 5 л",
                        new BigDecimal("120.00"), care, false,
                        chars("Объём", "5 л", "Класс отходов", "Б", "Цвет", "Жёлтый")),
                product("Костыли подмышечные", "kostyli-podmyshechnye", "MD-0011",
                        "Алюминиевые подмышечные костыли с регулировкой высоты, пара",
                        new BigDecimal("1350.00"), rehab, false,
                        chars("Материал", "Алюминий", "Нагрузка", "до 120 кг", "Регулировка", "Да")),
                productOnRequest("Инвалидная коляска", "invalidnaya-kolyaska", "MD-0012",
                        "Кресло-коляска механическая, складная, с регулируемыми подножками",
                        rehab,
                        chars("Тип", "Механическая", "Ширина сиденья", "45 см", "Вес", "19 кг"))
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
