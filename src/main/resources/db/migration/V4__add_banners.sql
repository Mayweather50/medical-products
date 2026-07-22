-- Баннеры главной страницы: редактируются из админки.
CREATE TABLE banners (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    eyebrow     VARCHAR(255),
    image_url   VARCHAR(255),
    cta_label   VARCHAR(255),
    link_url    VARCHAR(255),
    tone        VARCHAR(32)  NOT NULL DEFAULT 'teal',
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_banners_sort_order ON banners (sort_order);

-- Стартовые слайды — те же, что были захардкожены на фронте.
INSERT INTO banners (title, eyebrow, image_url, cta_label, link_url, tone, sort_order) VALUES
    ('Оборудование и материалы для стоматологии', 'Каталог', '/banners/banner-1.jpg',
     'Открыть каталог', '/catalog', 'teal', 1),
    ('Cad/Cam технологии: сканеры и фрезерные станки', 'Цифровая стоматология', '/banners/banner-2.jpg',
     'Смотреть раздел', '/catalog?cat=cad-cam-tehnologii', 'deep', 2),
    ('Оснащение стоматологического кабинета', 'Под ключ', '/banners/banner-3.jpg',
     'Смотреть оборудование', '/catalog?cat=stomatologicheskoe-oborudovanie', 'azure', 3);
