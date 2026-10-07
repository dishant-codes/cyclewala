-- Every table the shop uses (MySQL 5.7+ / MariaDB 10.2+).
--
-- You do NOT have to run this: the site creates the tables by itself the first time it connects
-- (see lib/db.ts). It is here so you can read the structure, or run it by hand in phpMyAdmin
-- (hPanel -> Databases -> phpMyAdmin -> your database -> SQL) if you prefer. It is safe to run twice.
--
--   customers, wishlist_items   customer accounts and their saved cycles
--   orders, bookings            what customers order / book (items are stored as JSON on the order)
--   products                    the catalogue, one row per cycle (the cycle itself is JSON)
--   uploads                     photos uploaded in the admin
--   collections                 small leftovers, e.g. which catalogue entries were already imported

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(32) NOT NULL,
  email VARCHAR(254) NOT NULL,
  name VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  locked_until BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_email (email),
  UNIQUE KEY uq_customers_public_id (public_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist_items (
  customer_id BIGINT UNSIGNED NOT NULL,
  product_slug VARCHAR(160) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (customer_id, product_slug),
  KEY idx_wishlist_customer_created (customer_id, created_at),
  CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(40) NOT NULL,
  customer_key VARCHAR(40) NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(400) NOT NULL,
  note VARCHAR(400) NULL,
  items LONGTEXT NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'new',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_orders_customer (customer_key),
  KEY idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(40) NOT NULL,
  customer_key VARCHAR(40) NULL,
  service_id VARCHAR(40) NOT NULL,
  service_title VARCHAR(120) NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(400) NULL,
  cycle VARCHAR(120) NULL,
  preferred_date VARCHAR(20) NULL,
  note VARCHAR(400) NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'new',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_bookings_customer (customer_key),
  KEY idx_bookings_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(100) NOT NULL,
  data LONGTEXT NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (seq),
  UNIQUE KEY uq_products_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS uploads (
  filename VARCHAR(160) NOT NULL,
  content_type VARCHAR(60) NOT NULL,
  bytes MEDIUMBLOB NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collections (
  name VARCHAR(120) NOT NULL,
  value LONGTEXT NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
