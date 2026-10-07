import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/api-guard";
import { clearSessionCookie } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(res, request);
  return res;
}
