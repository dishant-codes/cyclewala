import { NextRequest, NextResponse } from "next/server";
import { readJson, sameOrigin, str } from "@/lib/api-guard";
import {
  EmailTaken,
  createCustomer,
  customerAuthAvailable,
  isValidEmail,
  normalizeEmail,
  passwordProblem,
  setSessionCookie,
  toPublic,
} from "@/lib/customers";
import { rateLimit, tooMany } from "@/lib/rate-limit";

/* Create an account, then sign the new customer straight in. */
export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return fail("Request blocked.", 403);
  if (!customerAuthAvailable()) return fail("Sign-in is not available right now. Please try again later.", 503);
  if (!rateLimit(request, "customer-signup", 6, 60 * 60_000)) return tooMany();

  const body = await readJson(request);
  if (!body) return fail("Something went wrong — please try again.");

  const name = str(body.name, 80).trim().replace(/\s+/g, " ");
  const email = normalizeEmail(str(body.email, 260));
  const password = str(body.password, 300);

  if (name.length < 2) return fail("Please enter your name.");
  if (!isValidEmail(email)) return fail("Please enter a valid email address.");
  const problem = passwordProblem(password, email);
  if (problem) return fail(problem);

  try {
    const customer = await createCustomer({ email, name, password });
    const res = NextResponse.json({ customer: toPublic(customer) }, { status: 201, headers: { "Cache-Control": "no-store" } });
    if (!setSessionCookie(res, request, customer)) return fail("Sign-in is not available right now. Please try again later.", 503);
    return res;
  } catch (err) {
    if (err instanceof EmailTaken) return fail("An account with this email already exists — try signing in instead.", 409);
    console.error("[customer] signup failed", err);
    return fail("We couldn't create your account. Please try again.", 500);
  }
}
