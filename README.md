# Medical Products Backend

REST API backend для сайта компании, продающей медицинские товары, расходные материалы и медицинское оборудование. Каталог категорий и товаров, приём заявок от клиентов, список сертификатов и админские CRUD-эндпоинты.

## Стек

- Java 21
- Spring Boot 3.3
- Spring Web (REST API)
- Spring Data JPA (Hibernate 6)
- PostgreSQL 16
- Maven
- Jakarta Bean Validation
- Lombok
- springdoc-openapi (Swagger UI)
- Docker / Docker Compose

## Архитектура

Layered architecture: `controller → service → repository`. Контроллеры тонкие, бизнес-логика в сервисах, наружу отдаются только DTO (entity не возвращаются). Фильтрация каталога реализована через JPA Specifications, характеристики товара хранятся в `jsonb`, пагинация — через стабильный контракт `PageResponse<T>`.

## Структура проекта

```
medical-products-backend/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── src/main/
    ├── resources/application.yml
    └── java/com/medicalproducts/backend/
        ├── MedicalProductsBackendApplication.java
        ├── config/        # CORS, OpenAPI
        ├── controller/    # публичные REST-контроллеры
        │   └── admin/     # админские контроллеры
        ├── service/       # бизнес-логика, транзакции
        ├── repository/    # Spring Data JPA репозитории
        ├── spec/          # JPA Specifications для фильтрации товаров
        ├── entity/        # JPA-сущности (Category, Product, Lead, Certificate)
        ├── dto/           # request/response DTO + ErrorResponse + PageResponse
        ├── mapper/        # ручные мапперы entity <-> DTO
        ├── exception/     # ResourceNotFoundException, GlobalExceptionHandler
        └── init/          # DataInitializer (тестовые данные)
```

## Запуск через Docker (рекомендуется)

```bash
cp .env.example .env
docker compose up -d --build
```

Приложение: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html
OpenAPI JSON: http://localhost:8080/api-docs

Остановка:

```bash
docker compose down          # остановить
docker compose down -v       # остановить и удалить данные БД
```

## Локальный запуск (без Docker для backend)

1. Поднять только PostgreSQL:

```bash
docker compose up -d postgres
```

2. Запустить приложение:

```bash
mvn spring-boot:run
```

По умолчанию приложение подключается к `jdbc:postgresql://localhost:5432/medical_products` с пользователем/паролем `medical/medical`. Переопределить можно переменными окружения:

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/medical_products
export SPRING_DATASOURCE_USERNAME=medical
export SPRING_DATASOURCE_PASSWORD=medical
mvn spring-boot:run
```

Сборка jar:

```bash
mvn clean package
java -jar target/medical-products-backend-0.0.1-SNAPSHOT.jar
```

## Подключение к PostgreSQL (из .env.example)

| Параметр | Значение |
|---|---|
| Host (с хоста) | localhost |
| Host (из docker-сети) | postgres |
| Port | 5432 |
| Database | medical_products |
| User | medical |
| Password | medical |

## API Endpoints

### Публичные

| Метод | Путь | Описание |
|---|---|---|
| GET | /api/categories | Список категорий |
| GET | /api/categories/{id} | Категория по id |
| GET | /api/categories/slug/{slug} | Категория по slug |
| GET | /api/categories/{slug}/products | Товары категории (пагинация: page, size) |
| GET | /api/products | Каталог с фильтрами: categorySlug, available, popular, query, page, size |
| GET | /api/products/{id} | Товар по id |
| GET | /api/products/slug/{slug} | Товар по slug |
| GET | /api/products/popular | Популярные товары (до 12, только в наличии) |
| GET | /api/products/search?query= | Поиск по названию, артикулу, краткому описанию |
| POST | /api/leads | Создать заявку клиента |
| GET | /api/certificates | Список сертификатов |

### Админские

| Метод | Путь | Описание |
|---|---|---|
| POST | /api/admin/categories | Создать категорию |
| PUT | /api/admin/categories/{id} | Обновить категорию |
| DELETE | /api/admin/categories/{id} | Удалить категорию (запрещено, если в ней есть товары) |
| POST | /api/admin/products | Создать товар |
| PUT | /api/admin/products/{id} | Обновить товар |
| DELETE | /api/admin/products/{id} | Удалить товар |
| GET | /api/admin/leads | Список заявок (фильтр: status, пагинация) |
| GET | /api/admin/leads/{id} | Заявка по id |
| PUT | /api/admin/leads/{id}/status | Обновить статус заявки |
| POST | /api/admin/certificates | Создать сертификат |
| PUT | /api/admin/certificates/{id} | Обновить сертификат |
| DELETE | /api/admin/certificates/{id} | Удалить сертификат |

Статусы заявок: `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

> Внимание: эндпоинты `/api/admin/**` пока не защищены авторизацией — это осознанно вынесено в следующий этап (Spring Security + JWT). Не выставляйте их в публичный интернет в текущем виде.

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

## Примеры curl-запросов

Список категорий:

```bash
curl http://localhost:8080/api/categories
```

Товары категории с пагинацией:

```bash
curl "http://localhost:8080/api/categories/diagnosticheskoe-oborudovanie/products?page=0&size=10"
```

Каталог с фильтрами:

```bash
curl "http://localhost:8080/api/products?categorySlug=siz&available=true&popular=true"
```

Поиск:

```bash
curl "http://localhost:8080/api/products/search?query=тонометр"
```

Товар по slug:

```bash
curl http://localhost:8080/api/products/slug/pulsoksimetr
```

Создать заявку:

```bash
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "phone": "+7 (900) 123-45-67",
    "email": "ivan@example.com",
    "comment": "Интересует оптовая цена",
    "productName": "Тонометр автоматический"
  }'
```

Создать категорию (админ):

```bash
curl -X POST http://localhost:8080/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Лабораторная посуда",
    "slug": "laboratornaya-posuda",
    "description": "Пробирки, колбы, чашки Петри"
  }'
```

Создать товар (админ):

```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Шприц одноразовый 5 мл",
    "slug": "shprits-odnorazovyy-5ml",
    "article": "MD-0100",
    "shortDescription": "Трёхкомпонентный шприц 5 мл, 100 шт.",
    "price": 550.00,
    "priceOnRequest": false,
    "categoryId": 1,
    "characteristics": { "Объём": "5 мл", "Количество": "100 шт." },
    "available": true,
    "popular": false
  }'
```

Обновить статус заявки (админ):

```bash
curl -X PUT http://localhost:8080/api/admin/leads/1/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "IN_PROGRESS" }'
```

Удалить товар (админ):

```bash
curl -X DELETE http://localhost:8080/api/admin/products/1
```

## Тестовые данные

При первом запуске (пустая таблица категорий) `DataInitializer` создаёт 8 категорий и 12 товаров, включая популярные товары и один товар с ценой «по запросу» (инвалидная коляска).

## Что дальше

- Spring Security + JWT для `/api/admin/**`
- Flyway-миграции вместо `ddl-auto: update`
- Загрузка файлов (изображения товаров, PDF сертификатов) в S3/MinIO
- Полнотекстовый поиск (PostgreSQL `tsvector` или Elasticsearch)
- Кэширование каталога (Spring Cache + Redis)
- Интеграционные тесты на Testcontainers
