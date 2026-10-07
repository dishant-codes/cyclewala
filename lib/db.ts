/* MySQL connection for the whole shop: customer accounts, orders, service bookings, the product
 * catalogue, admin photo uploads and a small key-value table (Hostinger's MySQL, or Laragon's locally).
 *
 * Configure with these environment variables (see .env.example):
 *   DB_HOST       usually "localhost" on Hostinger
 *   DB_PORT       default 3306
 *   DB_NAME       the database you created in hPanel
 *   DB_USER       the database user
 *   DB_PASSWORD   that user's password
 *   DB_SSL        "true" only if your provider requires an encrypted connection
 *
 * One small connection pool is shared by the whole server process (and survives dev hot-reloads).
 * The tables are created on first use, so there is nothing to import by hand — db/schema.sql is the same
 * thing in case you would rather run it yourself in phpMyAdmin.
 *
 * Times are stored in UTC; every connection is switched to UTC so the answer never depends on the
 * database server's own time zone.
 */
import mysql, { type Pool } from "mysql2/promise";

/* THE DATABASE IS SWITCHED OFF BY DEFAULT.
 *
 * Everything below (and lib/customer-store-mysql.ts, the MySQL branches in lib/orders.ts, lib/bookings.ts,
 * lib/product-store.ts and lib/storage.ts, and scripts/migrate-files-to-mysql.mjs) stays in the code but is
 * inert: nothing touches MySQL unless USE_DATABASE=true is set in the environment. Until then the shop
 * stores everything exactly as it did before — Vercel Blob on Vercel, Netlify Blobs on Netlify, plain
 * files elsewhere.
 *
 * To turn it on (e.g. on Hostinger): set USE_DATABASE=true together with DB_HOST, DB_NAME, DB_USER and
 * DB_PASSWORD. Having the DB_* values present is NOT enough on its own.
 */
export function mysqlConfigured(): boolean {
  return process.env.USE_DATABASE === "true" && !!(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);
}

const T = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS customers (
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
  ) ${T}`,
  `CREATE TABLE IF NOT EXISTS wishlist_items (
    customer_id BIGINT UNSIGNED NOT NULL,
    product_slug VARCHAR(160) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (customer_id, product_slug),
    KEY idx_wishlist_customer_created (customer_id, created_at),
    CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
  ) ${T}`,
  `CREATE TABLE IF NOT EXISTS orders (
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
  ) ${T}`,
  `CREATE TABLE IF NOT EXISTS bookings (
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
  ) ${T}`,
  `CREATE TABLE IF NOT EXISTS products (
    seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL,
    data LONGTEXT NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    PRIMARY KEY (seq),
    UNIQUE KEY uq_products_slug (slug)
  ) ${T}`,
  `CREATE TABLE IF NOT EXISTS uploads (
    filename VARCHAR(160) NOT NULL,
    content_type VARCHAR(60) NOT NULL,
    bytes MEDIUMBLOB NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (filename)
  ) ${T}`,
  `CREATE TABLE IF NOT EXISTS collections (
    name VARCHAR(120) NOT NULL,
    value LONGTEXT NOT NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (name)
  ) ${T}`,
];

type Shared = { pool?: Pool; ready?: Promise<Pool>; sig?: string };
const g = globalThis as unknown as { __cwDb?: Shared };
const shared: Shared = (g.__cwDb ??= {});

/* Changes whenever the list of tables does. In development the pool outlives a hot reload, so without this a
   server that was already running would never create a table added later. */
const SIG = SCHEMA.join("\n");

/** The pool, with the tables guaranteed to exist. */
export function db(): Promise<Pool> {
  if (shared.ready && shared.sig === SIG) return shared.ready;
  if (shared.pool) void shared.pool.end().catch(() => {});
  shared.pool = undefined;
  shared.sig = SIG;
  shared.ready = (async () => {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? "",
      charset: "utf8mb4",
      timezone: "Z",
      decimalNumbers: true,
      waitForConnections: true,
      // shared hosting allows only a handful of connections per database
      connectionLimit: 5,
      queueLimit: 50,
      connectTimeout: 10_000,
      enableKeepAlive: true,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    });
    pool.on("connection", (conn) => {
      conn.query("SET time_zone = '+00:00'");
    });
    for (const sql of SCHEMA) await pool.query(sql);
    shared.pool = pool;
    return pool;
  })().catch((err) => {
    // let the next request try again instead of caching the failure forever
    shared.ready = undefined;
    throw err;
  });
  return shared.ready;
}

