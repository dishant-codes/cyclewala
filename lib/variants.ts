/* Client-safe helpers for cycles sold in several options (lib/products.ts
   pulls in server-only storage, so the shop UI imports from here instead).

   A variant is one buyable combination: colour, and for some models a wheel
   size and a gear/brake setup too. The shop keeps the customer's current
   choice as a `Selection` and asks these helpers what that means. */
import type { Product, ProductVariant } from "@/lib/products";

export type Selection = { color?: string; size?: string; type?: string };
export type OptionKey = keyof Selection;

export type Shown = {
  color: string | undefined;
  size: string | undefined;
  type: string | undefined;
  image: string;
  price: number | null;
  regularPrice: number | null;
  inStock: boolean;
};

const KEYS: OptionKey[] = ["color", "size", "type"];

/** how many of the wanted options a variant matches */
const score = (v: ProductVariant, sel: Selection) => KEYS.reduce((n, k) => n + (sel[k] !== undefined && v[k] === sel[k] ? 1 : 0), 0);

/** The variant for this selection — exact match, else the closest one. */
export function variantFor(product: Product, sel: Selection = {}): ProductVariant | undefined {
  const variants = product.variants;
  if (!variants?.length) return undefined;
  const wanted: Selection = sel.color === undefined && product.defaultColor ? { ...sel, color: product.defaultColor } : sel;
  let best = variants[0];
  let bestScore = -1;
  for (const v of variants) {
    const s = score(v, wanted);
    // closest match wins; among equals the cheapest, so a fresh card opens at its "From" price
    if (s > bestScore || (s === bestScore && (v.price ?? Infinity) < (best.price ?? Infinity))) {
      best = v;
      bestScore = s;
    }
  }
  return best;
}

/** What to show for a product with the given options picked (or its default). */
export function shownFor(product: Product, sel: Selection = {}): Shown {
  const v = variantFor(product, sel);
  if (v) {
    return {
      color: v.color,
      size: v.size,
      type: v.type,
      image: v.image,
      price: v.price,
      regularPrice: v.regularPrice ?? null,
      inStock: v.inStock,
    };
  }
  return {
    color: undefined,
    size: undefined,
    type: undefined,
    image: product.image,
    price: product.price,
    regularPrice: product.regularPrice ?? null,
    inStock: product.inStock,
  };
}

/** Change one option; the others are kept when that combination exists,
 *  otherwise the closest real combination wins (so a pick never dead-ends). */
export function selectOption(product: Product, current: Selection, key: OptionKey, value: string): Selection {
  const variants = (product.variants ?? []).filter((v) => v[key] === value);
  if (!variants.length) return current;
  const want: Selection = { ...current, [key]: value };
  let best = variants[0];
  let bestScore = -1;
  for (const v of variants) {
    const s = score(v, want);
    if (s > bestScore || (s === bestScore && (v.price ?? Infinity) < (best.price ?? Infinity))) {
      best = v;
      bestScore = s;
    }
  }
  return { color: best.color, size: best.size, type: best.type };
}

/** Distinct values of one option across the product, in catalogue order. */
export function optionValues(product: Product, key: OptionKey): string[] {
  const out: string[] = [];
  for (const v of product.variants ?? []) {
    const val = v[key];
    if (val !== undefined && !out.includes(val)) out.push(val);
  }
  return out;
}

/** True when the customer must pick size/gear (not just colour) to know the price. */
export const needsOptions = (product: Product) => optionValues(product, "size").length > 1 || optionValues(product, "type").length > 1;

/** Lowest price across all variants (for "From ₹…" on multi-option models). */
export function fromPrice(product: Product): number | null {
  const prices = (product.variants ?? []).map((v) => v.price).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : product.price;
}

export const discountPct = (price: number | null, mrp: number | null) =>
  price !== null && mrp !== null && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
