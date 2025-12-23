-- +goose Up
CREATE TABLE dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value REAL NOT NULL, 
  unit TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  revenue REAL NOT NULL,
  date TIMESTAMP NOT NULL
);

-- Indexes remain the same
CREATE INDEX idx_metrics_dashboard_id ON metrics(dashboard_id);
CREATE INDEX idx_feedback_dashboard_id ON feedbacks(dashboard_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);

-- +goose Down
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS metrics;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS dashboards;