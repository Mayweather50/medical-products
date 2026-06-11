# Medical Products — Медкор

Полноценный проект интернет-витрины компании, продающей медицинские товары, расходные материалы и оборудование: REST API backend на Spring Boot и SPA-frontend на React.

## Стек

**Backend**
- Java 21, Spring Boot 3.3
- Spring Web, Spring Data JPA (Hibernate 6), Spring Security + JWT
- PostgreSQL 16, Flyway-миграции
- Jakarta Bean Validation, Lombok, springdoc-openapi (Swagger UI)
- Apache POI (импорт из Excel)

**Frontend**
- React 18 + Vite
- React Router 6
- Нативный fetch к REST API (без моков)

## Архитектура

```
medical-products/
├── pom.xml                  # backend (Maven)
├── Dockerfile               # backend image
├── docker-compose.yml       # postgres + backend + frontend
├── src/main/java/...        # слои: controller → service → repository
│   └── resources/db/migration/   # Flyway: V1 схема, V2 заказы
└── frontend/                # SPA-витрина
    ├── Dockerfile           # сборка + nginx (раздаёт статику, проксирует /api)
    └── src/
        ├── api.js           # клиент REST API
        ├── App.jsx          # роутинг: / , /catalog , /product/:slug
        ├── components/      # Header, Footer, ProductCard, LeadModal…
        ├── pages/           # HomePage, CatalogPage, ProductPage
        ├── context/         # категории (общие), модалка заявки
        └── lib/             # форматирование, мета категорий
```

Backend отдаёт только DTO, фильтрация каталога — JPA Specifications, характеристики товара — `jsonb`, пагинация — стабильный контракт `PageResponse<T>`. Frontend держит фильтры каталога в URL (ссылку можно переслать), фильтрация и пагинация выполняются на сервере.

## Запуск через Docker (рекомендуется)

```bash
cp .env.example .env
docker compose up -d --build
```

| Сервис | Адрес |
|---|---|
| Витрина (frontend) | http://localhost:3000 |
| API (backend) | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/api-docs |

В production-сборке nginx фронтенда проксирует `/api` на backend — фронт и API живут на одном origin, CORS не задействован.

Остановка:

```bash
docker compose down          # остановить
docker compose down -v       # остановить и удалить данные БД
```

## Локальная разработка

### Backend

```bash
docker compose up -d postgres   # поднять только БД
mvn spring-boot:run
```

По умолчанию backend подключается к `jdbc:postgresql://localhost:5432/medical_products`. Параметры переопределяются переменными окружения `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.

### Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

Dev-сервер Vite проксирует `/api` на `http://localhost:8080` (см. `frontend/vite.config.js`), поэтому отдельная настройка CORS не нужна. Адрес API можно переопределить переменной `VITE_API_URL`.

Production-сборка статики: `npm run build` → `frontend/dist`.

## API Endpoints

### Публичные

| Метод | Путь | Описание |
|---|---|---|
| GET | /api/categories | Список категорий (с `productCount`) |
| GET | /api/categories/{id} | Категория по id |
| GET | /api/categories/slug/{slug} | Категория по slug |
| GET | /api/categories/{slug}/products | Товары категории (пагинация: page, size) |
| GET | /api/products | Каталог с фильтрами: categorySlug, available, popular, query, page, size |
| GET | /api/products/{id} | Товар по id |
| GET | /api/products/slug/{slug} | Товар по slug |
| GET | /api/products/popular | Популярные товары (до 12, только в наличии) |
| GET | /api/products/search?query= | Поиск по названию, артикулу, краткому описанию |
| POST | /api/leads | Создать заявку клиента |
| POST | /api/orders | Создать заказ |
| GET | /api/certificates | Список сертификатов |
| POST | /api/auth/login | Вход (JWT) |
| POST | /api/auth/register | Регистрация |

### Админские (требуют роль ADMIN, JWT в заголовке Authorization)

| Метод | Путь | Описание |
|---|---|---|
| POST/PUT/DELETE | /api/admin/categories… | CRUD категорий |
| POST/PUT/DELETE | /api/admin/products… | CRUD товаров (+ импорт из Excel) |
| GET/PUT | /api/admin/leads… | Просмотр заявок, смена статуса |
| GET/PUT | /api/admin/orders… | Просмотр заказов, смена статуса |
| POST/PUT/DELETE | /api/admin/certificates… | CRUD сертификатов |

Статусы заявок: `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

## Формат ошибок

```json
{
  "timestamp": "2026-06-10T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/leads",
  "fieldErrors": [
    { "field": "phone", "message": "phone is required" }
  ]
}
```

Frontend разбирает `fieldErrors` и подсвечивает соответствующие поля формы заявки.

## Тестовые данные

При первом запуске (пустая таблица категорий) `DataInitializer` создаёт 8 категорий, 12 товаров (включая популярные и один товар с ценой «по запросу») и 4 сертификата.

## Что дальше

- Загрузка файлов (изображения товаров, PDF сертификатов) в S3/MinIO
- Корзина и оформление заказа на фронтенде (API `/api/orders` уже готов)
- Админ-панель на фронтенде (API `/api/admin/**` уже защищён JWT)
- Полнотекстовый поиск (PostgreSQL `tsvector` или Elasticsearch)
- Кэширование каталога (Spring Cache + Redis)
- Интеграционные тесты на Testcontainers
