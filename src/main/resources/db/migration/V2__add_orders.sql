CREATE TABLE orders (
    id             BIGSERIAL    PRIMARY KEY,
    customer_name  VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50)  NOT NULL,
    comment        VARCHAR(1000),
    status         VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);

CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT  NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT  NOT NULL REFERENCES products(id),
    quantity   INT     NOT NULL DEFAULT 1
);

CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
