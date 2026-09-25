/* Admin auth — email + password, then a signed session cookie.
 *
 * The password is checked once, at login (POST /api/admin/auth). What the
 * browser keeps afterwards is an HttpOnly cookie holding `expiry.signature`:
 * page scripts can't read it, it is never the password, it expires on its
 * own, and it is only sent to /api/admin/*. Changing ADMIN_PASSWORD (or
 * ADMIN_SESSION_SECRET) instantly invalidates every existing session.
 *
 * Everything fails CLOSED: with no usable credentials configured, every
 * request is rejected.
 *
 * Production: set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) in the
 * host's environment. The built-in development login below is ignored when
 * NODE_ENV is "production".
 */
import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "cw_admin";
export const SESSION_MS = 12 * 60 * 60 * 1000;
const MIN_PASSWORD = 10;

const DEV_LOGIN = { email: "gauravtote@cyclewala.com", password: "12345" };

function credentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (process.env.NODE_ENV !== "production") {
    return email && password ? { email, password } : DEV_LOGIN;
  }
  if (!email || !password || password.length < MIN_PASSWORD) return null;
  return { email, password };
}

const digest = (s: string) => createHash("sha256").update(s).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export function verifyLogin(email: string, password: string): boolean {
  const c = credentials();
  if (!c) {
    console.error(
      `[admin] Login refused: set ADMIN_EMAIL and an ADMIN_PASSWORD of at least ${MIN_PASSWORD} characters in the server environment.`
    );
    return false;
  }
  // evaluate both so the response time doesn't reveal which one was wrong
  const emailOk = safeEqual(email.trim().toLowerCase(), c.email.toLowerCase());
  const passOk = safeEqual(password, c.password);
  return emailOk && passOk;
}

function sign(expiry: number): string | null {
  const c = credentials();
  if (!c) return null;
  const key = process.env.ADMIN_SESSION_SECRET || c.password;
  return createHmac("sha256", key).update(`admin:${expiry}:${c.email.toLowerCase()}`).digest("hex");
}

export function createSessionToken(): string | null {
  const expiry = Date.now() + SESSION_MS;
  const sig = sign(expiry);
  return sig ? `${expiry}.${sig}` : null;
}

export function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expiry = Number(token.slice(0, dot));
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expected = sign(expiry);
  return !!expected && safeEqual(token.slice(dot + 1), expected);
}

/** Use the Secure flag whenever the request came in over HTTPS (directly or
 *  through a proxy), so plain-http local runs still work. */
export function isSecureRequest(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https"
  );
}
