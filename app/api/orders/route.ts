import { NextRequest, NextResponse } from "next/server";
import { createOrder, type OrderItem } from "@/lib/orders";
import { getProductBySlug } from "@/lib/products";
import { rateLimit, rateLimitPeek, rateLimitRecord, tooMany } from "@/lib/rate-limit";
import { isValidIndianMobile } from "@/lib/validate";

/* Public endpoint — anyone checking out submits here, no auth (this is the
   same trust level as walking into the shop and giving your name).

   The browser only says WHICH cycles and HOW MANY. The brand, model and price
   of every line are looked up here from the live catalogue, so a tampered
   request can't change what an order costs. No payment is processed. */
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  /* Two guards, neither of which can lock out a real customer:
     - orders actually placed: 30 an hour per address (a household, a shop counter or a mobile
       carrier sharing one address can order plenty). Only a SUCCESS counts, so a missing option
       or a typo never uses up an allowance.
     - raw attempts: a generous burst limit that only a script hammering the endpoint would hit. */
  if (!rateLimitPeek(request, "order", 30, 60 * 60_000)) return tooMany();
  if (!rateLimit(request, "order-attempt", 120, 10 * 60_000)) return tooMany();

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

    // merge repeats of the same cycle + colour, then price every line from the catalogue
    const qtyByLine = new Map<string, { slug: string; color: string; size: string; type: string; qty: number }>();
    for (const i of items) {
      const slug = clip(i?.slug, 80);
      const color = clip(i?.color, 60);
      const size = clip(i?.size, 20);
      const type = clip(i?.type, 40);
      const qty = Math.max(1, Math.min(20, Math.floor(Number(i?.qty)) || 1));
      const key = `${slug}|${color}|${size}|${type}`;
      const line = qtyByLine.get(key);
      qtyByLine.set(key, { slug, color, size, type, qty: Math.min(20, (line?.qty ?? 0) + qty) });
    }

    const cleanItems: OrderItem[] = [];
    for (const { slug, color, size, type, qty } of qtyByLine.values()) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: "A cycle in your list is no longer available" }, { status: 400 });
      }
      // cycles sold in several options: the colour / size / gear must be a
      // combination the product really has, and that combination's own
      // price and stock apply
      let price = product.price;
      let inStock = product.inStock;
      let chosen: { color?: string; size?: string; type?: string } = {};
      if (product.variants?.length) {
        const same = (a: string | undefined, b: string) => (a ?? "").toLowerCase() === b.toLowerCase();
        const variant = product.variants.find(
          (v) => same(v.color, color) && same(v.size, size) && same(v.type, type)
        );
        if (!variant) {
          return NextResponse.json(
            { error: `Please choose the colour, size and setup for ${product.brand} ${product.model}` },
            { status: 400 }
          );
        }
        price = variant.price;
        inStock = variant.inStock;
        chosen = { color: variant.color, size: variant.size, type: variant.type };
      }
      if (!inStock) {
        const label = [chosen.color, chosen.size, chosen.type].filter(Boolean).join(" · ");
        return NextResponse.json(
          { error: `${product.brand} ${product.model}${label ? ` (${label})` : ""} is out of stock right now` },
          { status: 400 }
        );
      }
      cleanItems.push({ slug: product.slug, ...chosen, brand: product.brand, model: product.model, price, qty });
    }

    const order = await createOrder({
      customer: { name, phone, address, note: clip(c.note, 400) || undefined },
      items: cleanItems,
    });

    rateLimitRecord(request, "order");
    return NextResponse.json({ id: order.id, total: order.total }, { status: 201 });
  } catch (error) {
    console.error("[orders] Failed to place order", error);
    return NextResponse.json({ error: "Order service is temporarily unavailable" }, { status: 503 });
  }
}
