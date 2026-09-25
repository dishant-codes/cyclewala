import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MS,
  createSessionToken,
  isAuthorized,
  isSecureRequest,
  verifyLogin,
} from "@/lib/admin-auth";
import { rateLimit, tooMany } from "@/lib/rate-limit";

/* Admin session endpoint.
 *   POST   { email, password } → checks them, sets the session cookie
 *   GET                        → 200 if the cookie is a valid session, else 401
 *   DELETE                     → log out (clears the cookie)
 * The cookie is only ever sent back to /api/admin/*. */
const cookieBase = (request: NextRequest) => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure: isSecureRequest(request),
  path: "/api/admin",
});

export async function POST(request: NextRequest) {
  // 8 attempts per 10 minutes per address — enough for typos, useless for guessing
  if (!rateLimit(request, "admin-login", 8, 10 * 60_000)) return tooMany();

  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.slice(0, 200) : "";
    password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const token = email && password && verifyLogin(email, password) ? createSessionToken() : null;
  if (!token) return NextResponse.json({ ok: true }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, { ...cookieBase(request), maxAge: SESSION_MS / 1000 });
  return res;
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: isAuthorized(request) }, { status: isAuthorized(request) ? 200 : 401 });
}

export async function DELETE(request: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieBase(request), maxAge: 0 });
  return res;
}
