/* Client-safe helpers for colourway products (lib/products.ts pulls in
   server-only storage, so the shop UI imports from here instead). */
import type { Product, ProductVariant } from "@/lib/products";

export type Shown = {
  color: string | undefined;
  image: string;
  price: number | null;
  regularPrice: number | null;
  inStock: boolean;
};

/** What to show for a product with the given colour picked (or its default). */
export function shownFor(product: Product, color?: string): Shown {
  const variants = product.variants;
  if (variants?.length) {
    const v: ProductVariant =
      variants.find((x) => x.color === color) ?? variants.find((x) => x.color === product.defaultColor) ?? variants[0];
    return { color: v.color, image: v.image, price: v.price, regularPrice: v.regularPrice ?? null, inStock: v.inStock };
  }
  return { color: undefined, image: product.image, price: product.price, regularPrice: product.regularPrice ?? null, inStock: product.inStock };
}

export const discountPct = (price: number | null, mrp: number | null) =>
  price !== null && mrp !== null && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
