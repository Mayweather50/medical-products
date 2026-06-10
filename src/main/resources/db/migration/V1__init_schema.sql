-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    article             VARCHAR(255),
    short_description   VARCHAR(1000),
    description         TEXT,
    price               NUMERIC(12, 2),
    price_on_request    BOOLEAN NOT NULL DEFAULT FALSE,
    image_url           VARCHAR(255),
    category_id         BIGINT NOT NULL REFERENCES categories(id),
    characteristics     JSONB DEFAULT '{}',
    available           BOOLEAN NOT NULL DEFAULT TRUE,
    popular             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(popular);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    file_url    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(32) NOT NULL,
    email           VARCHAR(255),
    comment         TEXT,
    product_name    VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'NEW',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMP WITH TIME ZONE
);
