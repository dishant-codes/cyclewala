/* Product type + persistence for the admin-managed catalogue.
 *
 * The "products" collection is the live source of truth for the public Shop
 * page AND the admin dashboard — editing a product in /admin shows up on the
 * site immediately. It's seeded once (on first read) from the real, verified
 * starting catalogue in `data/products-seed.ts` (transcribed from the shop's
 * own supplier PDFs).
 *
 * Storage itself (a local JSON file, or Netlify Blobs when deployed there)
 * is handled by lib/storage.ts — this file doesn't know or care which one is
 * active.
 */
import { SEED_PRODUCTS } from "@/data/products-seed";
import { productStore } from "@/lib/product-store";
import OYEKID_CATALOG from "@/data/oyekid-catalog.json";
import NEUFMAN_CATALOG from "@/data/neufman-catalog.json";
import SCHNELL_CATALOG from "@/data/schnell-catalog.json";
import HERO_CATALOG from "@/data/hero-catalog.json";
import KEYSTO_CATALOG from "@/data/keysto-catalog.json";
import HERCULES_CATALOG from "@/data/hercules-catalog.json";
import RADIANT_CATALOG from "@/data/radiant-catalog.json";
import BSA_CATALOG from "@/data/bsa-catalog.json";
import KROSS_CATALOG from "@/data/kross-catalog.json";
import ALLWYN_CATALOG from "@/data/allwyn-catalog.json";
import FIREFOX_CATALOG from "@/data/firefox-catalog.json";
import CORRADO_CATALOG from "@/data/corrado-catalog.json";

/** the hand-made Oyekid placeholders the full Oyekid catalogue supersedes */
const SUPERSEDED = ["oyekid-mermaid", "oyekid-shark-tank", "oyekid-yuvaa"];

export type ProductCategory = "kids" | "mtb" | "hybrid" | "ebike";

/** One purchasable combination of a cycle — colour, and for some models wheel
 *  size and gear/brake setup too. Picking it on the shop changes the photo and
 *  the price and decides exactly what lands on the order. */
export type ProductVariant = {
  color: string;
  /** wheel size, e.g. "27.5T" (only on models sold in several sizes) */
  size?: string;
  /** gear / setup, e.g. "21SPEED", "SINGLE SPEED", "IBC FSDD" */
  type?: string;
  /** CSS background for the swatch dot (a colour or a two-tone gradient) */
  swatch: string;
  image: string;
  price: number | null;
  regularPrice?: number | null;
  inStock: boolean;
  sku?: string;
};

export type Product = {
  slug: string;
  brand: string;
  model: string;
  category: ProductCategory;
  sizes: string;
  specs: string[];
  price: number | null;
  /** illustrative only — no real review data exists yet */
  rating: number;
  image: string;
  inStock: boolean;
  /** shop-by-size group, e.g. "Balance Bike" / "12T" / "20T" */
  group?: string;
  tagline?: string;
  description?: string;
  /** MRP shown struck-through next to `price` */
  regularPrice?: number | null;
  /** variants; when present, orders must name one of these exact combinations */
  variants?: ProductVariant[];
  defaultColor?: string;
  createdAt: string;
  updatedAt: string;
};

let catalogChecked = false; // per server instance: the catalogue is checked once, then cached

type CatalogEntry = Omit<Product, "createdAt" | "updatedAt"> & { replaces?: string[] };

/** every brand's built-in catalogue, in the order the shop lists them */
const CATALOG: CatalogEntry[] = [
  ...(OYEKID_CATALOG as unknown as CatalogEntry[]),
  ...(NEUFMAN_CATALOG as unknown as CatalogEntry[]),
  ...(SCHNELL_CATALOG as unknown as CatalogEntry[]),
  ...(HERO_CATALOG as unknown as CatalogEntry[]),
  ...(KEYSTO_CATALOG as unknown as CatalogEntry[]),
  ...(HERCULES_CATALOG as unknown as CatalogEntry[]),
  ...(RADIANT_CATALOG as unknown as CatalogEntry[]),
  ...(BSA_CATALOG as unknown as CatalogEntry[]),
  ...(KROSS_CATALOG as unknown as CatalogEntry[]),
  ...(ALLWYN_CATALOG as unknown as CatalogEntry[]),
  ...(FIREFOX_CATALOG as unknown as CatalogEntry[]),
  ...(CORRADO_CATALOG as unknown as CatalogEntry[]),
];

/** Copies any catalogue product the live collection hasn't seen yet into it,
 *  once. Needed because the live collection (e.g. Vercel Blob) already exists
 *  and is never re-seeded from the repo. After the copy the product is an
 *  ordinary one: admin edits and deletes stick (it's recorded as imported). */
async function importCatalog(products: Product[]): Promise<Product[]> {
  if (catalogChecked) return products;
  const store = productStore();
  const imported = await store.readImports();
  const fresh = CATALOG.filter((c) => !imported.includes(c.slug));
  if (fresh.length) {
    const now = new Date().toISOString();
    let next = imported.length ? [...products] : products.filter((p) => !SUPERSEDED.includes(p.slug));
    for (const { replaces, ...c } of fresh) {
      // a catalogue entry can supersede an older hand-made one (same cycle, real data now)
      if (replaces?.length) next = next.filter((p) => !replaces.includes(p.slug));
      if (!next.some((p) => p.slug === c.slug)) next.push({ ...c, createdAt: now, updatedAt: now });
    }
    await store.replaceAll(next);
    await store.writeImports([...imported, ...fresh.map((c) => c.slug)]);
    products = next;
  }
  catalogChecked = true;
  return products;
}

export async function getProducts(): Promise<Product[]> {
  const store = productStore();
  const existing = await store.readAll();
  if (existing) return importCatalog(existing);

  // first run: seed once from the shop's real, verified starting catalogue
  const now = new Date().toISOString();
  const seeded: Product[] = SEED_PRODUCTS.map((p) => ({ ...p, createdAt: now, updatedAt: now }));
  await store.replaceAll(seeded);
  return importCatalog(seeded);
}

/** The catalogue as shipped in the code, with no storage involved — the last resort when storage is down. */
function builtInCatalog(): Product[] {
  const now = new Date().toISOString();
  const replaced = new Set(CATALOG.flatMap((c) => c.replaces ?? []));
  const out: Product[] = SEED_PRODUCTS.filter((p) => !SUPERSEDED.includes(p.slug) && !replaced.has(p.slug)).map((p) => ({ ...p, createdAt: now, updatedAt: now }));
  for (const { replaces, ...c } of CATALOG) {
    void replaces;
    if (!out.some((p) => p.slug === c.slug)) out.push({ ...c, createdAt: now, updatedAt: now });
  }
  return out;
}

let recent: { at: number; list: Product[] } | null = null;
const RECENT_MS = 10_000;

/** What the public shop shows. Never throws: if storage (the database or Blob) is unreachable, the shop keeps
 *  showing the last list it managed to read, or the built-in catalogue, instead of an empty page. Orders and
 *  the admin use getProducts(), which does throw — they must never act on a stand-in list. */
export async function getPublicProducts(): Promise<Product[]> {
  if (recent && Date.now() - recent.at < RECENT_MS) return recent.list;
  try {
    const list = await getProducts();
    recent = { at: Date.now(), list };
    return list;
  } catch (err) {
    console.error("[products] storage unavailable, serving a fallback list:", err);
    return recent?.list ?? builtInCatalog();
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function createProduct(input: Omit<Product, "createdAt" | "updatedAt">): Promise<Product> {
  const products = await getProducts();
  if (products.some((p) => p.slug === input.slug)) {
    throw new Error(`A product with slug "${input.slug}" already exists`);
  }
  const now = new Date().toISOString();
  const product: Product = { ...input, createdAt: now, updatedAt: now };
  await productStore().insert(product);
  recent = null;
  return product;
}

export async function updateProduct(
  slug: string,
  updates: Partial<Omit<Product, "slug" | "createdAt">>
): Promise<Product | null> {
  const products = await getProducts();
  const current = products.find((p) => p.slug === slug);
  if (!current) return null;
  const updated: Product = { ...current, ...updates, updatedAt: new Date().toISOString() };
  await productStore().update(updated);
  recent = null;
  return updated;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const products = await getProducts();
  if (!products.some((p) => p.slug === slug)) return false;
  recent = null;
  return productStore().remove(slug);
}

/* ---------- input validation for the admin API ---------- */

const CATEGORIES: ProductCategory[] = ["kids", "mtb", "hybrid", "ebike"];
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max + 1) : "");

export type ProductFields = Partial<Omit<Product, "createdAt" | "updatedAt">>;

/** Validates admin-submitted product fields. `partial` (edits) allows any
 *  subset; otherwise every required field must be present. Returns a clean
 *  object or a message the admin can read. */
export function parseProductFields(
  body: Record<string, unknown>,
  partial: boolean
): { value: ProductFields } | { error: string } {
  const out: ProductFields = {};
  const has = (k: string) => body[k] !== undefined;
  const need = (k: string) => !partial && !has(k);

  if (has("slug") || need("slug")) {
    const slug = text(body.slug, 80);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return { error: "Invalid slug" };
    out.slug = slug;
  }
  for (const [key, max, label] of [["brand", 80, "Brand"], ["model", 80, "Model"], ["sizes", 80, "Sizes"]] as const) {
    if (has(key) || need(key)) {
      const v = text(body[key], max);
      if (!v || v.length > max) return { error: `${label} is required (max ${max} characters)` };
      out[key] = v;
    }
  }
  if (has("category") || need("category")) {
    if (!CATEGORIES.includes(body.category as ProductCategory)) {
      return { error: "category must be kids, mtb, hybrid or ebike" };
    }
    out.category = body.category as ProductCategory;
  }
  if (has("specs")) {
    if (!Array.isArray(body.specs) || body.specs.length > 20) return { error: "specs must be a list of up to 20 lines" };
    out.specs = body.specs.map((x) => text(x, 200)).filter(Boolean);
  }
  if (has("price")) {
    if (body.price === null || body.price === "") out.price = null;
    else {
      const n = Number(body.price);
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return { error: "Price must be a number between 0 and 10,00,000" };
      out.price = Math.round(n * 100) / 100;
    }
  }
  if (has("image") || need("image")) {
    const img = text(body.image, 200);
    if (!/^\/[A-Za-z0-9._\-/]+$/.test(img) || img.includes("..") || img.length > 200) return { error: "Invalid image path" };
    out.image = img;
  }
  if (has("inStock")) out.inStock = body.inStock !== false;
  if (has("rating")) {
    const r = Number(body.rating);
    if (Number.isFinite(r) && r >= 0 && r <= 5) out.rating = r;
  }
  return { value: out };
}
