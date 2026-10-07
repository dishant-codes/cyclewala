/* One-time copy of the shop's file data into MySQL:
 *
 *   data/orders.json          -> orders
 *   data/bookings.json        -> bookings
 *   data/products.json        -> products        (your catalogue, including every admin edit)
 *   data/catalog-imports.json -> collections     (which built-in catalogue entries were already imported)
 *   data/uploads/*            -> uploads         (photos uploaded in the admin)
 *
 * Run it from the project folder, once, after the DB_* settings are in .env / .env.local:
 *
 *   npm run db:migrate
 *
 * It only reads your files — nothing is deleted or changed — and it is safe to run again: orders,
 * bookings and photos already in the database are skipped. Products already in the database are left
 * alone unless you add --force (which replaces them with the file's copy).
 *
 * To copy from a different folder (e.g. a backup of your live DATA_DIR):  npm run db:migrate -- --from ./backup
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const args = process.argv.slice(2);
const force = args.includes("--force");
const fromIdx = args.indexOf("--from");
const dir = path.resolve(fromIdx >= 0 ? args[fromIdx + 1] : process.env.DATA_DIR || "data");

for (const k of ["DB_HOST", "DB_NAME", "DB_USER"]) {
  if (!process.env[k]) {
    console.error(`Missing ${k}. Put the DB_* settings in .env or .env.local first.`);
    process.exit(1);
  }
}

const readJson = (name, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  } catch {
    return fallback;
  }
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  charset: "utf8mb4",
  timezone: "Z",
  decimalNumbers: true,
  connectionLimit: 3,
});
pool.on("connection", (c) => c.query("SET time_zone = '+00:00'"));

console.log(`Copying from ${dir}\n        into ${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}\n`);

// tables
const schema = fs.readFileSync(path.resolve("db/schema.sql"), "utf8");
for (const stmt of schema.split(/;\s*(?:\r?\n|$)/).map((s) => s.replace(/^(\s*--.*\r?\n)+/gm, "").trim()).filter(Boolean)) {
  await pool.query(stmt);
}

const changed = async (sql, rows) => {
  let n = 0;
  for (const r of rows) {
    const [res] = await pool.query(sql, r);
    n += res.affectedRows > 0 ? 1 : 0;
  }
  return n;
};

// orders
const orders = readJson("orders.json", []);
const orderRows = orders.map((o) => [
  o.id, o.customerKey ?? null, o.customer.name, o.customer.phone, o.customer.address, o.customer.note ?? null,
  JSON.stringify(o.items), o.total, o.status, new Date(o.createdAt), new Date(o.updatedAt),
]);
const o = await changed(
  "INSERT IGNORE INTO orders (id, customer_key, name, phone, address, note, items, total, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
  orderRows
);
console.log(`orders      ${o} added, ${orders.length - o} already there   (${orders.length} in file)`);

// bookings
const bookings = readJson("bookings.json", []);
const bookingRows = bookings.map((b) => [
  b.id, b.customerKey ?? null, b.service.id, b.service.title, b.service.price, b.customer.name, b.customer.phone,
  b.customer.address ?? null, b.customer.cycle ?? null, b.customer.date ?? null, b.customer.note ?? null,
  b.status, new Date(b.createdAt), new Date(b.updatedAt),
]);
const b = await changed(
  "INSERT IGNORE INTO bookings (id, customer_key, service_id, service_title, service_price, name, phone, address, cycle, preferred_date, note, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  bookingRows
);
console.log(`bookings    ${b} added, ${bookings.length - b} already there   (${bookings.length} in file)`);

// products
const products = readJson("products.json", null);
if (!products) {
  console.log("products    no products.json found — skipped (the site will build the catalogue from its built-in lists)");
} else {
  const [[{ n: existing }]] = await pool.query("SELECT COUNT(*) AS n FROM products");
  if (existing > 0 && !force) {
    console.log(`products    skipped — the database already has ${existing}. Use --force to replace them with the file's ${products.length}.`);
  } else {
    if (force) await pool.query("DELETE FROM products");
    for (let i = 0; i < products.length; i += 100) {
      const chunk = products.slice(i, i + 100);
      await pool.query("INSERT INTO products (slug, data, created_at, updated_at) VALUES ? ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)", [
        chunk.map((p) => [p.slug, JSON.stringify(p), new Date(p.createdAt), new Date(p.updatedAt)]),
      ]);
    }
    console.log(`products    ${products.length} copied`);
  }
}

// which built-in catalogue entries were already imported (so deleted ones are not brought back)
const imports = readJson("catalog-imports.json", null);
if (imports) {
  const [[has]] = await pool.query("SELECT COUNT(*) AS n FROM collections WHERE name = 'catalog-imports'");
  if (!has.n || force) {
    await pool.query("INSERT INTO collections (name, value) VALUES ('catalog-imports', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [JSON.stringify(imports)]);
    console.log(`imports     ${imports.length} catalogue entries marked as imported`);
  } else console.log("imports     already recorded — skipped");
}

// uploaded photos
const upDir = path.join(dir, "uploads");
const types = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
let photos = 0;
let photoFiles = 0;
if (fs.existsSync(upDir)) {
  for (const f of fs.readdirSync(upDir)) {
    const ext = f.split(".").pop()?.toLowerCase() ?? "";
    if (!types[ext]) continue;
    photoFiles++;
    const [res] = await pool.query("INSERT IGNORE INTO uploads (filename, content_type, bytes) VALUES (?, ?, ?)", [f, types[ext], fs.readFileSync(path.join(upDir, f))]);
    photos += res.affectedRows > 0 ? 1 : 0;
  }
}
console.log(`uploads     ${photos} added, ${photoFiles - photos} already there   (${photoFiles} in folder)`);

console.log("\nDone. Your original files were not touched.");
await pool.end();
