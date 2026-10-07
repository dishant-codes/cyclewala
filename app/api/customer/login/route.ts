import { NextRequest, NextResponse } from "next/server";
import { readJson, sameOrigin, str } from "@/lib/api-guard";
import {
  burnPasswordCheck,
  clearFailedSignIns,
  customerAuthAvailable,
  getCustomerByEmail,
  isLocked,
  normalizeEmail,
  recordFailedSignIn,
  setSessionCookie,
  toPublic,
  verifyPassword,
} from "@/lib/customers";
import { rateLimit, tooMany } from "@/lib/rate-limit";

/* Sign in. The same vague message comes back whether the email is unknown or the password is wrong, and
   an unknown email still costs one password hash, so neither the words nor the timing say which. */
export const dynamic = "force-dynamic";

const NO_CACHE = { "Cache-Control": "no-store" };
const fail = (error: string, status = 401) => NextResponse.json({ error }, { status, headers: NO_CACHE });
const WRONG = "Incorrect email or password.";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return fail("Request blocked.", 403);
  if (!customerAuthAvailable()) return fail("Sign-in is not available right now. Please try again later.", 503);
  if (!rateLimit(request, "customer-login", 12, 10 * 60_000)) return tooMany();

  const body = await readJson(request);
  if (!body) return fail("Something went wrong — please try again.", 400);
  const email = normalizeEmail(str(body.email, 260));
  const password = str(body.password, 300);
  if (!email || !password) return fail("Enter your email and password.", 400);

  try {
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      await burnPasswordCheck(password);
      return fail(WRONG);
    }
    if (isLocked(customer)) {
      return fail("Too many wrong attempts on this account. Please wait 15 minutes and try again.", 429);
    }
    if (!(await verifyPassword(password, customer.passwordHash))) {
      await recordFailedSignIn(customer);
      return fail(WRONG);
    }

    await clearFailedSignIns(customer);
    const res = NextResponse.json({ customer: toPublic(customer) }, { headers: NO_CACHE });
    if (!setSessionCookie(res, request, customer)) return fail("Sign-in is not available right now. Please try again later.", 503);
    return res;
  } catch (err) {
    console.error("[customer] login failed", err);
    return fail("We couldn't sign you in. Please try again.", 500);
  }
}
