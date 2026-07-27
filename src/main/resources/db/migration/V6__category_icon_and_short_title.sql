-- Иконка и короткое название категории переезжают из фронтенда (lib/categoryMeta.js)
-- в БД, чтобы их можно было менять из админки.
--
-- До этой миграции:
--   * иконка хранилась в image_url как 'icon:<name>' и терялась при загрузке фото;
--   * короткое название было зашито в JS-карте по slug и для новых категорий
--     из админки не задавалось вовсе.

ALTER TABLE categories ADD COLUMN icon varchar(64);
ALTER TABLE categories ADD COLUMN short_title varchar(120);

-- 1. Иконку, уже выбранную в админке, забираем из image_url
UPDATE categories
SET icon = substring(image_url FROM 6)
WHERE image_url LIKE 'icon:%';

-- 2. Остальным проставляем значения из прежней карты categoryMeta.js по slug
UPDATE categories AS c
SET icon = COALESCE(c.icon, m.icon),
    short_title = m.short_title
FROM (VALUES
    ('3d-tehnologii',                    'cadcam',       '3D технологии'),
    ('stomatologicheskoe-oborudovanie',  'dental-unit',  'Стомат. оборудование'),
    ('stomatologicheskie-materialy',     'consumables',  'Стомат. материалы'),
    ('zubotehnicheskie-materialy',       'consumables',  'Зуботех. материалы'),
    ('zubotehnicheskoe-oborudovanie',    'lab',          'Зуботех. оборудование'),
    ('implantologiya-i-hirurgiya',       'dental-unit',  'Имплантология'),
    ('instrumenty',                      'clinic',       'Инструменты'),
    ('rentgen-oborudovanie',             'diagnostics',  'Рентген'),
    ('sterilizatsiya',                   'disinfection', 'Стерилизация'),
    ('dezinfektsiya-i-sterilizatsiya',   'disinfection', 'Дезинфекция'),
    ('anesteziya',                       'anesthesia',   'Анестезия'),
    ('skalery-i-nasadki',                'dental-unit',  'Скалеры и насадки'),
    ('gigiena-i-profilaktika',           'care',         'Гигиена'),
    ('cad-cam-tehnologii',               'cadcam',       'Cad/Cam технологии'),
    ('reanimatsiya-i-anesteziologiya',   'anesthesia',   'Реанимация'),
    ('mebel',                            'furniture',    'Мебель'),
    ('rashodnye-materialy',              'consumables',  'Расходные материалы'),
    ('siz',                              'ppe',          'СИЗ'),
    ('diagnosticheskoe-oborudovanie',    'diagnostics',  'Диагностика'),
    ('reabilitatsionnye-tovary',         'rehab',        'Реабилитация'),
    ('tovary-dlya-uhoda',                'care',         'Уход'),
    ('dezinfektsiya-i-antiseptiki',      'disinfection', 'Дезинфекция'),
    ('meditsinskaya-mebel',              'furniture',    'Мебель'),
    ('oborudovanie-dlya-klinik',         'clinic',       'Для клиник')
) AS m(slug, icon, short_title)
WHERE c.slug = m.slug;

-- 3. Категории, которых в карте не было (созданы из админки): иконка по умолчанию,
--    короткое название = полному
UPDATE categories SET icon = 'clinic' WHERE icon IS NULL OR icon = '';
UPDATE categories SET short_title = title WHERE short_title IS NULL OR short_title = '';

-- 4. image_url теперь хранит только настоящее фото
UPDATE categories SET image_url = NULL WHERE image_url LIKE 'icon:%';

ALTER TABLE categories ALTER COLUMN icon SET NOT NULL;
ALTER TABLE categories ALTER COLUMN short_title SET NOT NULL;
