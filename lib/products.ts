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
import { readCollection, writeCollection } from "@/lib/storage";

const COLLECTION = "products";

export type ProductCategory = "kids" | "mtb" | "hybrid";

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
  createdAt: string;
  updatedAt: string;
};

export async function getProducts(): Promise<Product[]> {
  const existing = await readCollection<Product[] | null>(COLLECTION, null);
  if (existing) return existing;

  // first run: seed once from the shop's real, verified starting catalogue
  const now = new Date().toISOString();
  const seeded: Product[] = SEED_PRODUCTS.map((p) => ({ ...p, createdAt: now, updatedAt: now }));
  await writeCollection(COLLECTION, seeded);
  return seeded;
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
  products.push(product);
  await writeCollection(COLLECTION, products);
  return product;
}

export async function updateProduct(
  slug: string,
  updates: Partial<Omit<Product, "slug" | "createdAt">>
): Promise<Product | null> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const updated: Product = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
  products[index] = updated;
  await writeCollection(COLLECTION, products);
  return updated;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter((p) => p.slug !== slug);
  if (filtered.length === products.length) return false;
  await writeCollection(COLLECTION, filtered);
  return true;
}

/* ---------- input validation for the admin API ---------- */

const CATEGORIES: ProductCategory[] = ["kids", "mtb", "hybrid"];
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
      return { error: "category must be kids, mtb or hybrid" };
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
