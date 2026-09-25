import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/bookings";
import { getService } from "@/data/services";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { isValidIndianMobile } from "@/lib/validate";

/* Public endpoint — a customer requesting a service, no auth (same trust
   level as walking in and asking). The service name and price are looked up
   server-side from data/services.ts; anything the browser sends for those is
   ignored. No payment is taken. */
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: NextRequest) {
  if (!rateLimit(request, "booking", 6, 60 * 60_000)) return tooMany();

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
    if (service.requiresAddress && !address) {
      return NextResponse.json({ error: "Address is required for home service" }, { status: 400 });
    }

    const booking = await createBooking({
      service: { id: service.id, title: service.title, price: service.price },
      customer: {
        name,
        phone,
        address: address || undefined,
        cycle: clip(c.cycle, 120) || undefined,
        date: clip(c.date, 20) || undefined,
        note: clip(c.note, 400) || undefined,
      },
    });

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Couldn't send the request — try again" }, { status: 400 });
  }
}
