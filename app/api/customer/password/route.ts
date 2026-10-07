import { NextRequest, NextResponse } from "next/server";
import { readJson, sameOrigin, str } from "@/lib/api-guard";
import { currentCustomer, hashPassword, passwordProblem, saveCustomer, setSessionCookie, verifyPassword } from "@/lib/customers";
import { rateLimit, tooMany } from "@/lib/rate-limit";

/* Change password: needs the current one. Every other signed-in device is signed out (the session
   signature is tied to the password), and this device gets a fresh cookie. */
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: NO_CACHE });

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return fail("Request blocked.", 403);
  if (!rateLimit(request, "customer-password", 8, 10 * 60_000)) return tooMany();
  const customer = await currentCustomer(request).catch(() => null);
  if (!customer) return fail("Please sign in.", 401);

  const body = await readJson(request);
  const current = str(body?.current, 300);
  const next = str(body?.next, 300);

  if (!(await verifyPassword(current, customer.passwordHash))) return fail("Your current password isn't right.", 403);
  const problem = passwordProblem(next, customer.email);
  if (problem) return fail(problem, 400);
  if (next === current) return fail("Choose a password you haven't used here before.", 400);

  const saved = await saveCustomer({ ...customer, passwordHash: await hashPassword(next), failed: 0, lockedUntil: 0 });
  const res = NextResponse.json({ ok: true }, { headers: NO_CACHE });
  setSessionCookie(res, request, saved);
  return res;
}
