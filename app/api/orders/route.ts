import { NextRequest, NextResponse } from "next/server";
import { createOrder, type OrderItem } from "@/lib/orders";
import { getProductBySlug } from "@/lib/products";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { isValidIndianMobile } from "@/lib/validate";

/* Public endpoint — anyone checking out submits here, no auth (this is the
   same trust level as walking into the shop and giving your name).

   The browser only says WHICH cycles and HOW MANY. The brand, model and price
   of every line are looked up here from the live catalogue, so a tampered
   request can't change what an order costs. No payment is processed. */
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  // 6 orders per hour per address is plenty for a real customer
  if (!rateLimit(request, "order", 6, 60 * 60_000)) return tooMany();

  try {
    const body = await request.json();
    const c = body?.customer ?? {};
    const name = clip(c.name, 100);
    const phone = clip(c.phone, 20);
    const address = clip(c.address, 400);

    if (!name || !phone || !address) {
      return NextResponse.json({ error: "Name, phone and address are required" }, { status: 400 });
    }
    if (!isValidIndianMobile(phone)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    const items = body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your list is empty" }, { status: 400 });
    }
    if (items.length > 20) {
      return NextResponse.json({ error: "Too many different cycles in one order" }, { status: 400 });
    }

    // merge repeats of the same cycle, then price every line from the catalogue
    const qtyBySlug = new Map<string, number>();
    for (const i of items) {
      const slug = clip(i?.slug, 80);
      const qty = Math.max(1, Math.min(20, Math.floor(Number(i?.qty)) || 1));
      qtyBySlug.set(slug, Math.min(20, (qtyBySlug.get(slug) ?? 0) + qty));
    }

    const cleanItems: OrderItem[] = [];
    for (const [slug, qty] of qtyBySlug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: "A cycle in your list is no longer available" }, { status: 400 });
      }
      if (!product.inStock) {
        return NextResponse.json(
          { error: `${product.brand} ${product.model} is out of stock right now` },
          { status: 400 }
        );
      }
      cleanItems.push({ slug: product.slug, brand: product.brand, model: product.model, price: product.price, qty });
    }

    const order = await createOrder({
      customer: { name, phone, address, note: clip(c.note, 400) || undefined },
      items: cleanItems,
    });

    return NextResponse.json({ id: order.id, total: order.total }, { status: 201 });
  } catch (error) {
    console.error("[orders] Failed to place order", error);
    return NextResponse.json({ error: "Couldn't place the order — try again" }, { status: 400 });
  }
}
