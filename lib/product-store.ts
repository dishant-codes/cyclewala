/* Where the product catalogue is kept.
 *
 *   - MySQL (table `products`, one row per cycle) whenever the database is configured. Editing one cycle
 *     in the admin rewrites just that row — not a 700 KB file — and two admins can't overwrite each
 *     other's edits to different cycles.
 *   - Otherwise the old behaviour: one JSON collection through lib/storage.ts (a file, Netlify Blobs or
 *     Vercel Blob depending on the host).
 *
 * lib/products.ts sits on top of this and doesn't care which one it is.
 */
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Product } from "@/lib/products";
import { db, mysqlConfigured } from "@/lib/db";
import { readCollection, writeCollection } from "@/lib/storage";

const COLLECTION = "products";
/** slugs of catalogue products already copied into the live collection */
const IMPORTS = "catalog-imports";

export interface ProductStore {
  /** every product in catalogue order, or null when the catalogue has never been created */
  readAll(): Promise<Product[] | null>;
  /** make the stored catalogue exactly this list (first seed, and when new catalogue entries are imported) */
  replaceAll(list: Product[]): Promise<void>;
  /** throws when the slug already exists */
  insert(p: Product): Promise<void>;
  update(p: Product): Promise<void>;
  remove(slug: string): Promise<boolean>;
  readImports(): Promise<string[]>;
  writeImports(slugs: string[]): Promise<void>;
}

/* ---------------- files ---------------- */

const fileStore: ProductStore = {
  readAll: () => readCollection<Product[] | null>(COLLECTION, null),
  replaceAll: (list) => writeCollection(COLLECTION, list),
  async insert(p) {
    const all = (await readCollection<Product[]>(COLLECTION, [])) ?? [];
    if (all.some((x) => x.slug === p.slug)) throw new Error(`A product with slug "${p.slug}" already exists`);
    await writeCollection(COLLECTION, [...all, p]);
  },
  async update(p) {
    const all = await readCollection<Product[]>(COLLECTION, []);
    await writeCollection(COLLECTION, all.map((x) => (x.slug === p.slug ? p : x)));
  },
  async remove(slug) {
    const all = await readCollection<Product[]>(COLLECTION, []);
    const rest = all.filter((x) => x.slug !== slug);
    if (rest.length === all.length) return false;
    await writeCollection(COLLECTION, rest);
    return true;
  },
  readImports: () => readCollection<string[]>(IMPORTS, []),
  writeImports: (slugs) => writeCollection(IMPORTS, slugs),
};

/* ---------------- MySQL ---------------- */

type Row = RowDataPacket & { data: string };
const parse = (r: Row) => JSON.parse(r.data) as Product;

/* The storefront asks for the whole catalogue on nearly every visit, so keep it in memory for a few
   seconds. Every write below clears it, so an admin's own edit shows up at once. */
const TTL = 5_000;
let cache: { at: number; list: Product[] } | null = null;
const clear = () => {
  cache = null;
};

const mysqlStore: ProductStore = {
  async readAll() {
    if (cache && Date.now() - cache.at < TTL) return cache.list;
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT data FROM products ORDER BY seq");
    if (rows.length === 0) {
      // empty can mean "never created" or "every cycle deleted" — the imports marker tells them apart
      const imported = await this.readImports();
      if (imported.length === 0) return null;
    }
    const list = rows.map(parse);
    cache = { at: Date.now(), list };
    return list;
  },

  async replaceAll(list) {
    const pool = await db();
    const [existing] = await pool.query<(RowDataPacket & { slug: string })[]>("SELECT slug FROM products");
    const keep = new Set(list.map((p) => p.slug));
    const gone = existing.map((r) => r.slug).filter((s) => !keep.has(s));
    if (gone.length) await pool.query("DELETE FROM products WHERE slug IN (?)", [gone]);
    for (let i = 0; i < list.length; i += 100) {
      const chunk = list.slice(i, i + 100);
      await pool.query(
        "INSERT INTO products (slug, data, created_at, updated_at) VALUES ? ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)",
        [chunk.map((p) => [p.slug, JSON.stringify(p), new Date(p.createdAt), new Date(p.updatedAt)])]
      );
    }
    clear();
  },

  async insert(p) {
    const pool = await db();
    try {
      await pool.query("INSERT INTO products (slug, data, created_at, updated_at) VALUES (?, ?, ?, ?)", [
        p.slug,
        JSON.stringify(p),
        new Date(p.createdAt),
        new Date(p.updatedAt),
      ]);
    } catch (err) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") throw new Error(`A product with slug "${p.slug}" already exists`);
      throw err;
    } finally {
      clear();
    }
  },

  async update(p) {
    const pool = await db();
    await pool.query("UPDATE products SET data = ?, updated_at = ? WHERE slug = ?", [JSON.stringify(p), new Date(p.updatedAt), p.slug]);
    clear();
  },

  async remove(slug) {
    const pool = await db();
    const [res] = await pool.query<ResultSetHeader>("DELETE FROM products WHERE slug = ?", [slug]);
    clear();
    return res.affectedRows > 0;
  },

  readImports: () => readCollection<string[]>(IMPORTS, []),
  writeImports: (slugs) => writeCollection(IMPORTS, slugs),
};

export const productStore = (): ProductStore => (mysqlConfigured() ? mysqlStore : fileStore);
