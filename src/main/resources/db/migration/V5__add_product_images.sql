-- Галерея товара: упорядоченный список ссылок на изображения.
-- image_url остаётся обложкой (первый кадр) — его используют плитки каталога.
ALTER TABLE products ADD COLUMN images JSONB NOT NULL DEFAULT '[]'::jsonb;

-- У существующих товаров галерея = одна текущая картинка.
UPDATE products
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url <> '';
