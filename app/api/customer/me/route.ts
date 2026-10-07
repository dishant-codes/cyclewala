import { NextRequest, NextResponse } from "next/server";
import { currentCustomer, toPublic } from "@/lib/customers";

/* Who is signed in? Answers 200 — `customer: null` means nobody — so a visitor's browser console
   isn't filled with 401s on every page load. If the database is down it answers 503 instead, so the page
   keeps whatever it already knew rather than signing the visitor out. Never cached. */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const customer = await currentCustomer(request);
    return NextResponse.json({ customer: customer ? toPublic(customer) : null }, { headers });
  } catch (err) {
    // the database could not be reached — say so, rather than pretending the visitor is signed out
    console.error("[customer] could not check the session", err);
    return NextResponse.json({ customer: null, unavailable: true }, { status: 503, headers });
  }
}
