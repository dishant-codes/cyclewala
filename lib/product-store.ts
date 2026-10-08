/* Where the product catalogue is kept.
 *
 *   - MongoDB (collection `products`, one document per cycle) whenever the database is configured. Editing
 *     one cycle in the admin rewrites just that document — not a 700 KB file — and two admins can't
 *     overwrite each other's edits to different cycles.
 *   - Otherwise the old behaviour: one JSON collection through lib/storage.ts (a file, Netlify Blobs or
 *     Vercel Blob depending on the host).
 *
 * lib/products.ts sits on top of this and doesn't care which one it is.
 */
import type { Product } from "@/lib/products";
import { db, dbConfigured } from "@/lib/db";
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

/* ---------------- MongoDB ---------------- */

type Doc = { _id: string; seq: number; data: Product };
const products = async () => (await db()).collection<Doc>("products");

/* The storefront asks for the whole catalogue on nearly every visit, so keep it in memory for a few
   seconds. Every write below clears it, so an admin's own edit shows up at once. */
const TTL = 5_000;
let cache: { at: number; list: Product[] } | null = null;
const clear = () => {
  cache = null;
};

const mongoStore: ProductStore = {
  async readAll() {
    if (cache && Date.now() - cache.at < TTL) return cache.list;
    const docs = await (await products()).find().sort({ seq: 1 }).toArray();
    if (docs.length === 0) {
      // empty can mean "never created" or "every cycle deleted" — the imports marker tells them apart
      const imported = await this.readImports();
      if (imported.length === 0) return null;
    }
    const list = docs.map((d) => d.data);
    cache = { at: Date.now(), list };
    return list;
  },

  async replaceAll(list) {
    const col = await products();
    await col.deleteMany({ _id: { $nin: list.map((p) => p.slug) } });
    for (let i = 0; i < list.length; i += 200) {
      await col.bulkWrite(
        list.slice(i, i + 200).map((p, j) => ({
          replaceOne: { filter: { _id: p.slug }, replacement: { seq: i + j, data: p }, upsert: true },
        }))
      );
    }
    clear();
  },

  async insert(p) {
    const col = await products();
    const last = await col.find().sort({ seq: -1 }).limit(1).next();
    try {
      await col.insertOne({ _id: p.slug, seq: (last?.seq ?? -1) + 1, data: p });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) throw new Error(`A product with slug "${p.slug}" already exists`);
      throw err;
    } finally {
      clear();
    }
  },

  async update(p) {
    await (await products()).updateOne({ _id: p.slug }, { $set: { data: p } });
    clear();
  },

  async remove(slug) {
    const res = await (await products()).deleteOne({ _id: slug });
    clear();
    return res.deletedCount > 0;
  },

  readImports: () => readCollection<string[]>(IMPORTS, []),
  writeImports: (slugs) => writeCollection(IMPORTS, slugs),
};

export const productStore = (): ProductStore => (dbConfigured() ? mongoStore : fileStore);
