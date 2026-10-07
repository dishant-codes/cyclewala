import { NextRequest, NextResponse } from "next/server";
import { readJson, sameOrigin, str } from "@/lib/api-guard";
import {
  clearSessionCookie,
  currentCustomer,
  deleteCustomer,
  saveCustomer,
  toPublic,
  verifyPassword,
} from "@/lib/customers";
import { rateLimit, tooMany } from "@/lib/rate-limit";

/* PATCH { name } — rename.   DELETE { password } — delete the account for good. */
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: NO_CACHE });

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return fail("Request blocked.", 403);
  const customer = await currentCustomer(request).catch(() => null);
  if (!customer) return fail("Please sign in.", 401);

  const body = await readJson(request);
  const name = str(body?.name, 80).trim().replace(/\s+/g, " ");
  if (name.length < 2) return fail("Please enter your name.", 400);

  const saved = await saveCustomer({ ...customer, name });
  return NextResponse.json({ customer: toPublic(saved) }, { headers: NO_CACHE });
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return fail("Request blocked.", 403);
  if (!rateLimit(request, "customer-delete", 5, 10 * 60_000)) return tooMany();
  const customer = await currentCustomer(request).catch(() => null);
  if (!customer) return fail("Please sign in.", 401);

  const body = await readJson(request);
  if (!(await verifyPassword(str(body?.password, 300), customer.passwordHash))) return fail("That password isn't right.", 403);

  await deleteCustomer(customer);
  const res = NextResponse.json({ ok: true }, { headers: NO_CACHE });
  clearSessionCookie(res, request);
  return res;
}
