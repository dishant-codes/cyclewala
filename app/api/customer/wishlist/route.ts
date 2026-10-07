import { NextRequest, NextResponse } from "next/server";
import { readJson, sameOrigin, str } from "@/lib/api-guard";
import { currentCustomer, updateWishlist } from "@/lib/customers";
import { getProducts } from "@/lib/products";
import { rateLimit, tooMany } from "@/lib/rate-limit";

/* Add or remove one cycle on the signed-in customer's wishlist. Idempotent: it says what the end state
   should be ({ slug, wished }), so a repeated request can't flip it back. */
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: NO_CACHE });

export async function PUT(request: NextRequest) {
  if (!sameOrigin(request)) return fail("Request blocked.", 403);
  if (!rateLimit(request, "customer-wishlist", 120, 10 * 60_000)) return tooMany();

  const customer = await currentCustomer(request).catch(() => null);
  if (!customer) return fail("Please sign in.", 401);

  const body = await readJson(request);
  const slug = str(body?.slug, 160);
  const wished = body?.wished === true;
  if (!slug || typeof body?.wished !== "boolean") return fail("Something went wrong — please try again.", 400);

  // only real cycles can be added (removing a stale one is always allowed)
  if (wished && !(await getProducts()).some((p) => p.slug === slug)) return fail("That cycle is no longer available.", 404);

  try {
    const wishlist = await updateWishlist(customer, slug, wished);
    return NextResponse.json({ wishlist }, { headers: NO_CACHE });
  } catch (err) {
    console.error("[customer] wishlist save failed", err);
    return fail("We couldn't update your wishlist. Please try again.", 500);
  }
}
