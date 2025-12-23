-- +goose Up
CREATE TABLE dashboards (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT UNIQUE,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME
);

CREATE TABLE products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT,
    category_id INTEGER,
    price       REAL,
    created_at  DATETIME,
    updated_at  DATETIME,
    deleted_at  DATETIME,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  quantity INT NOT NULL,
  revenue NUMERIC NOT NULL,
  date TIMESTAMP NOT NULL
);

-- +goose Down
DROP TABLE sales;
DROP TABLE products;
DROP TABLE categories;
DROP TABLE dashboards;
