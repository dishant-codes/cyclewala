import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

/* Public read-only endpoint — the Shop page fetches from here so that
   admin edits show up on the live site immediately. No auth: this is the
   same data anyone browsing the shop already sees. */
/* bookkeeping the storefront never reads — leaving it out keeps the list lean */
function slim<T extends Record<string, unknown>>(p: T) {
  const { createdAt, updatedAt, source, ...rest } = p as Record<string, unknown>;
  void createdAt; void updatedAt; void source;
  const variants = Array.isArray(rest.variants)
    ? (rest.variants as Record<string, unknown>[]).map(({ sku, ...v }) => (void sku, v))
    : rest.variants;
  return { ...rest, variants };
}

export async function GET() {
  // a few seconds of CDN caching keeps repeat visits cheap; admin edits still show up within about a minute
  return NextResponse.json((await getProducts()).map((p) => slim(p as unknown as Record<string, unknown>)), {
    headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" },
  });
}
