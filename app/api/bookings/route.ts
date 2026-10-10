import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/bookings";
import { notifyNewBooking } from "@/lib/notify";
import { currentCustomer } from "@/lib/customers";
import { getService } from "@/data/services";
import { rateLimit, rateLimitPeek, rateLimitRecord, tooMany } from "@/lib/rate-limit";
import { isValidIndianMobile } from "@/lib/validate";

/* Public endpoint — a customer requesting a service, no auth (same trust
   level as walking in and asking). The service name and price are looked up
   server-side from data/services.ts; anything the browser sends for those is
   ignored. No payment is taken. */
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  // same idea as orders: only completed requests count, plus a generous burst guard
  if (!rateLimitPeek(request, "booking", 30, 60 * 60_000)) return tooMany();
  if (!rateLimit(request, "booking-attempt", 120, 10 * 60_000)) return tooMany();

  try {
    const body = await request.json();
    const service = getService(String(body?.serviceId ?? ""));
    if (!service) {
      return NextResponse.json({ error: "Unknown service" }, { status: 400 });
    }

    const c = body?.customer ?? {};
    const name = clip(c.name, 100);
    const phone = clip(c.phone, 20);
    const address = clip(c.address, 400);

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }
    if (!isValidIndianMobile(phone)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }
    const pickup = c.pickup === true;
    if ((service.requiresAddress || pickup) && !address) {
      return NextResponse.json({ error: "Address is required for pickup" }, { status: 400 });
    }
    // the shop reads the note, so the pickup request rides along there
    const note = [pickup ? "PICKUP & DROP requested" : "", clip(c.note, 400)].filter(Boolean).join(" — ");

    const account = await currentCustomer(request).catch(() => null);
    const booking = await createBooking({
      customerKey: account?.key,
      service: { id: service.id, title: service.title, price: service.price },
      customer: {
        name,
        phone,
        address: address || undefined,
        cycle: clip(c.cycle, 120) || undefined,
        date: clip(c.date, 20) || undefined,
        note: note || undefined,
      },
    });

    rateLimitRecord(request, "booking");
    notifyNewBooking(booking);
    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't send the request — try again" }, { status: 400 });
  }
}
