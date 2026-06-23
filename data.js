/* Mock-данные, точно повторяющие модель бэкенда medical-products.
   Категории, товары, сертификаты. Используется фронтендом-прототипом. */
(function () {
  const CATEGORIES = [
    {
      id: 1,
      title: "Медицинские расходные материалы",
      shortTitle: "Расходные материалы",
      slug: "rashodnye-materialy",
      description: "Одноразовые расходные материалы для медицинских учреждений",
      icon: "consumables",
    },
    {
      id: 2,
      title: "Средства индивидуальной защиты",
      shortTitle: "СИЗ",
      slug: "siz",
      description: "СИЗ: маски, халаты, перчатки и другая защита персонала",
      icon: "ppe",
    },
    {
      id: 3,
      title: "Диагностическое оборудование",
      shortTitle: "Диагностика",
      slug: "diagnosticheskoe-oborudovanie",
      description: "Приборы для диагностики и контроля состояния пациента",
      icon: "diagnostics",
    },
    {
      id: 4,
      title: "Реабилитационные товары",
      shortTitle: "Реабилитация",
      slug: "reabilitatsionnye-tovary",
      description: "Средства реабилитации и восстановления подвижности",
      icon: "rehab",
    },
    {
      id: 5,
      title: "Товары для ухода",
      shortTitle: "Уход",
      slug: "tovary-dlya-uhoda",
      description: "Товары для ухода за пациентами на дому и в стационаре",
      icon: "care",
    },
    {
      id: 6,
      title: "Дезинфекция и антисептики",
      shortTitle: "Дезинфекция",
      slug: "dezinfektsiya-i-antiseptiki",
      description: "Антисептики и средства дезинфекции поверхностей и кожи",
      icon: "disinfection",
    },
    {
      id: 7,
      title: "Медицинская мебель",
      shortTitle: "Мебель",
      slug: "meditsinskaya-mebel",
      description: "Кушетки, кресла, шкафы и другая мебель для медучреждений",
      icon: "furniture",
    },
    {
      id: 8,
      title: "Оборудование для клиник",
      shortTitle: "Для клиник",
      slug: "oborudovanie-dlya-klinik",
      description: "Профессиональное оборудование для оснащения клиник",
      icon: "clinic",
    },
  ];

  const catBySlug = {};
  CATEGORIES.forEach((c) => (catBySlug[c.slug] = c));

  function P(o) {
    return Object.assign(
      {
        article: "",
        price: null,
        priceOnRequest: false,
        available: true,
        popular: false,
        characteristics: {},
      },
      o,
      {
        category: catBySlug[o.categorySlug],
        description:
          o.shortDescription +
          ". Сертифицированный товар, поставка со склада. Документы и инструкция в комплекте.",
      }
    );
  }

  const PRODUCTS = [
    P({
      id: 1,
      title: "Перчатки нитриловые",
      slug: "perchatki-nitrilovye",
      article: "MD-0001",
      shortDescription:
        "Нитриловые смотровые перчатки, неопудренные, 100 шт. в упаковке",
      price: 450.0,
      categorySlug: "rashodnye-materialy",
      popular: true,
      characteristics: {
        Материал: "Нитрил",
        Размеры: "S, M, L, XL",
        Количество: "100 шт.",
        Стерильность: "Нестерильные",
        Цвет: "Голубой",
      },
    }),
    P({
      id: 2,
      title: "Маски медицинские",
      slug: "maski-meditsinskie",
      article: "MD-0002",
      shortDescription:
        "Трёхслойные одноразовые медицинские маски, 50 шт. в упаковке",
      price: 250.0,
      categorySlug: "siz",
      popular: true,
      characteristics: {
        Слои: "3",
        Количество: "50 шт.",
        Крепление: "Резинки",
        Тип: "Одноразовые",
      },
    }),
    P({
      id: 3,
      title: "Антисептик кожный",
      slug: "antiseptik-kozhnyy",
      article: "MD-0003",
      shortDescription: "Спиртовой кожный антисептик, 1 л, с дозатором",
      price: 320.0,
      categorySlug: "dezinfektsiya-i-antiseptiki",
      characteristics: {
        Объём: "1 л",
        Основа: "Этиловый спирт 70%",
        Дозатор: "Да",
        Применение: "Кожа рук",
      },
    }),
    P({
      id: 4,
      title: "Тонометр автоматический",
      slug: "tonometr-avtomaticheskiy",
      article: "MD-0004",
      shortDescription:
        "Автоматический тонометр на плечо с индикатором аритмии",
      price: 2890.0,
      categorySlug: "diagnosticheskoe-oborudovanie",
      popular: true,
      characteristics: {
        Тип: "Автоматический",
        Манжета: "22–42 см",
        Память: "2×60 измерений",
        Питание: "4× AA",
        Гарантия: "24 мес.",
      },
    }),
    P({
      id: 5,
      title: "Пульсоксиметр",
      slug: "pulsoksimetr",
      article: "MD-0005",
      shortDescription: "Пульсоксиметр на палец с OLED-дисплеем",
      price: 1490.0,
      categorySlug: "diagnosticheskoe-oborudovanie",
      popular: true,
      characteristics: {
        Дисплей: "OLED",
        "Диапазон SpO2": "70–100%",
        Питание: "2× AAA",
        Вес: "50 г",
      },
    }),
    P({
      id: 6,
      title: "Термометр бесконтактный",
      slug: "termometr-beskontaktnyy",
      article: "MD-0006",
      shortDescription: "Инфракрасный бесконтактный термометр для лба",
      price: 1990.0,
      categorySlug: "diagnosticheskoe-oborudovanie",
      characteristics: {
        Тип: "Инфракрасный",
        "Время измерения": "1 сек",
        Память: "32 измерения",
        Дистанция: "3–5 см",
      },
    }),
    P({
      id: 7,
      title: "Бахилы одноразовые",
      slug: "bahily-odnorazovye",
      article: "MD-0007",
      shortDescription: "Полиэтиленовые одноразовые бахилы, 100 пар",
      price: 180.0,
      categorySlug: "rashodnye-materialy",
      characteristics: {
        Материал: "ПНД",
        Количество: "100 пар",
        Плотность: "20 мкм",
      },
    }),
    P({
      id: 8,
      title: "Халат медицинский",
      slug: "halat-meditsinskiy",
      article: "MD-0008",
      shortDescription:
        "Одноразовый нестерильный медицинский халат на завязках",
      price: 390.0,
      categorySlug: "siz",
      characteristics: {
        Материал: "Спанбонд",
        Плотность: "25 г/м²",
        Размер: "Универсальный",
        Крепление: "Завязки",
      },
    }),
    P({
      id: 9,
      title: "Кушетка медицинская",
      slug: "kushetka-meditsinskaya",
      article: "MD-0009",
      shortDescription:
        "Смотровая кушетка с регулируемым подголовником",
      price: 8900.0,
      categorySlug: "meditsinskaya-mebel",
      characteristics: {
        Нагрузка: "до 160 кг",
        Каркас: "Сталь",
        Обивка: "Винилискожа",
        Размер: "186×60 см",
      },
    }),
    P({
      id: 10,
      title: "Контейнер для утилизации отходов",
      slug: "konteyner-dlya-utilizatsii",
      article: "MD-0010",
      shortDescription:
        "Контейнер для сбора и утилизации медицинских отходов класса Б, 5 л",
      price: 120.0,
      categorySlug: "tovary-dlya-uhoda",
      characteristics: {
        Объём: "5 л",
        "Класс отходов": "Б",
        Цвет: "Жёлтый",
      },
    }),
    P({
      id: 11,
      title: "Костыли подмышечные",
      slug: "kostyli-podmyshechnye",
      article: "MD-0011",
      shortDescription:
        "Алюминиевые подмышечные костыли с регулировкой высоты, пара",
      price: 1350.0,
      categorySlug: "reabilitatsionnye-tovary",
      characteristics: {
        Материал: "Алюминий",
        Нагрузка: "до 120 кг",
        Регулировка: "Да",
        Комплект: "Пара",
      },
    }),
    P({
      id: 12,
      title: "Инвалидная коляска",
      slug: "invalidnaya-kolyaska",
      article: "MD-0012",
      shortDescription:
        "Кресло-коляска механическая, складная, с регулируемыми подножками",
      price: null,
      priceOnRequest: true,
      categorySlug: "reabilitatsionnye-tovary",
      characteristics: {
        Тип: "Механическая",
        "Ширина сиденья": "45 см",
        Вес: "19 кг",
        Нагрузка: "до 110 кг",
      },
    }),
  ];

  // Кол-во товаров в каждой категории
  CATEGORIES.forEach((c) => {
    c.count = PRODUCTS.filter((p) => p.categorySlug === c.slug).length;
  });

  const CERTIFICATES = [
    {
      id: 1,
      title: "Регистрационное удостоверение Росздравнадзора",
      description: "Подтверждает регистрацию медицинских изделий в РФ",
      code: "РЗН 2024/12345",
    },
    {
      id: 2,
      title: "Декларация соответствия ТР ТС",
      description: "Соответствие техническим регламентам Таможенного союза",
      code: "ЕАЭС N RU Д-CN.РА01.В.01234",
    },
    {
      id: 3,
      title: "Сертификат ISO 13485",
      description: "Система менеджмента качества медицинских изделий",
      code: "ISO 13485:2016",
    },
    {
      id: 4,
      title: "Сертификат соответствия ГОСТ Р",
      description: "Добровольная сертификация продукции по ГОСТ Р",
      code: "РОСС RU.0001.11АБ12",
    },
  ];

  window.MOCK = { CATEGORIES, PRODUCTS, CERTIFICATES, catBySlug };
})();
