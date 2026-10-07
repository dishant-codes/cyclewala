import { NextRequest, NextResponse } from "next/server";
import { getBookingsForCustomer } from "@/lib/bookings";
import { currentCustomer } from "@/lib/customers";
import { getOrdersForCustomer } from "@/lib/orders";

/* The signed-in customer's own orders and service requests — nobody else's. They are matched on the
   account the order was placed under, never on a phone number or name, so one customer can't see
   another's. The shop's private notes and the delivery address are not sent back. */
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const customer = await currentCustomer(request).catch(() => null);
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: NO_CACHE });

  try {
    const [orders, bookings] = await Promise.all([
      getOrdersForCustomer(customer.key),
      getBookingsForCustomer(customer.key),
    ]);
    return NextResponse.json(
      {
        orders: orders.map((o) => ({
            id: o.id,
            status: o.status,
            createdAt: o.createdAt,
            total: o.total,
            items: o.items.map((i) => ({
              brand: i.brand,
              model: i.model,
              color: i.color,
              size: i.size,
              type: i.type,
              price: i.price,
              qty: i.qty,
            })),
          })),
        services: bookings.map((b) => ({
            id: b.id,
            status: b.status,
            createdAt: b.createdAt,
            service: { title: b.service.title, price: b.service.price },
            date: b.customer.date,
          })),
      },
      { headers: NO_CACHE }
    );
  } catch (err) {
    console.error("[customer] could not load orders", err);
    return NextResponse.json({ error: "We couldn't load your orders." }, { status: 500, headers: NO_CACHE });
  }
}
