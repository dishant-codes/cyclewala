/* Customer accounts — sign up / sign in, and each customer's wishlist.
 *
 * Storage: MySQL when DB_HOST / DB_NAME / DB_USER are set (see lib/db.ts and lib/customer-store-mysql.ts);
 * otherwise the shop's general storage — Vercel Blob, Netlify Blobs or files (lib/customer-store-file.ts).
 *
 * Passwords: never stored. Only a salted scrypt hash (memory-hard, from Node's own crypto — no extra
 * package). Sign-in compares in constant time, and an unknown email still costs one hash so the response
 * time doesn't reveal which emails exist.
 *
 * Sessions: an HttpOnly cookie holding `key.expiry.signature`. The signature covers a fingerprint of the
 * current password hash, so changing the password signs every other device out. Fails CLOSED: with no
 * signing secret configured in production, no customer can sign in.
 *
 * Production: set CUSTOMER_SESSION_SECRET (a long random string) and the DB_* variables in the host's
 * environment. The secret falls back to ADMIN_SESSION_SECRET, then to a key derived from ADMIN_PASSWORD,
 * so an existing deployment keeps working.
 */
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { isSecureRequest } from "@/lib/admin-auth";
import { customerStorageAvailable, customerStore } from "@/lib/customer-store";
import { EmailTaken, type Customer } from "@/lib/customer-types";

export { EmailTaken };
export type { Customer };

export const CUSTOMER_COOKIE = "cw_customer";
export const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
export const MIN_PASSWORD = 8;
export const MAX_PASSWORD = 128;
/** consecutive wrong passwords before the account pauses sign-in for a while */
const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60_000;

/** what the browser is allowed to see */
export type PublicCustomer = { name: string; email: string; wishlist: string[] };
export const toPublic = (c: Customer): PublicCustomer => ({ name: c.name, email: c.email, wishlist: c.wishlist });

/* ---------------- email + password rules ---------------- */

export const normalizeEmail = (v: string) => v.trim().toLowerCase();
export const isValidEmail = (v: string) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const COMMON = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890", "qwerty123", "qwertyuiop",
  "iloveyou", "11111111", "00000000", "abcd1234", "cyclewala", "cyclewala123", "admin123", "welcome1",
]);

/** a plain-English reason the password is not acceptable, or null when it is fine */
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters for your password.`;
  if (password.length > MAX_PASSWORD) return `Keep your password under ${MAX_PASSWORD} characters.`;
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) return "That password is too easy to guess — try something less common.";
  if (email && lower === email.split("@")[0]) return "Your password can't be the same as your email.";
  return null;
}

/* ---------------- hashing ---------------- */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 };

const scrypt = (password: string, salt: Buffer, keylen: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCb(password, salt, keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, SCRYPT.keylen);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, , , , saltB64, hashB64] = stored.split("$");
  if (alg !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | null = null;
/** Spend the same time as a real check when the email is unknown. */
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= hashPassword("not-a-real-password");
  await verifyPassword(password, await dummyHash);
}

/* ---------------- accounts ---------------- */

export const getCustomerByKey = (key: string) => customerStore().findByKey(key);
export const getCustomerByEmail = (email: string) => customerStore().findByEmail(normalizeEmail(email));

/** Saves the customer's name, password and sign-in lock counters. */
export async function saveCustomer(customer: Customer): Promise<Customer> {
  await customerStore().update(customer);
  return { ...customer, updatedAt: new Date().toISOString() };
}

export async function createCustomer(input: { email: string; name: string; password: string }): Promise<Customer> {
  const email = normalizeEmail(input.email);
  return customerStore().insert({ email, name: input.name.trim(), passwordHash: await hashPassword(input.password) });
}

/** Account deletion: everything stored for the customer goes, so the email can sign up again. */
export const deleteCustomer = (customer: Customer) => customerStore().remove(customer);

/** Add or remove one cycle; resolves to the new wishlist (newest first). */
export const updateWishlist = (customer: Customer, slug: string, wished: boolean) =>
  customerStore().setWished(customer, slug, wished);

export const isLocked = (c: Customer) => c.lockedUntil > Date.now();

export async function recordFailedSignIn(c: Customer): Promise<void> {
  const failed = c.failed + 1;
  await saveCustomer({ ...c, failed, lockedUntil: failed >= LOCK_AFTER ? Date.now() + LOCK_MS : c.lockedUntil });
}

export async function clearFailedSignIns(c: Customer): Promise<void> {
  if (c.failed > 0 || c.lockedUntil) await saveCustomer({ ...c, failed: 0, lockedUntil: 0 });
}

/* ---------------- sessions ---------------- */

function secret(): string | null {
  const s = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "production") return s || adminPassword || "dev-only-customer-secret";
  return adminPassword && adminPassword.length >= 10 ? `customers:${adminPassword}` : null;
}

/** Sign-in needs a signing secret (and, via lib/customer-store.ts, somewhere to keep accounts). */
export const customerAuthAvailable = () => secret() !== null && customerStorageAvailable();

const fingerprint = (c: Pick<Customer, "passwordHash">) => createHash("sha256").update(c.passwordHash).digest("hex").slice(0, 16);

function sign(c: Customer, expiry: number): string | null {
  const key = secret();
  return key ? createHmac("sha256", key).update(`customer|${c.key}|${expiry}|${fingerprint(c)}`).digest("hex") : null;
}

export function createSessionToken(c: Customer): string | null {
  const expiry = Date.now() + SESSION_MS;
  const sig = sign(c, expiry);
  return sig ? `${c.key}.${expiry}.${sig}` : null;
}

const safeEqual = (a: string, b: string) => {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
};

/** The signed-in customer for this request, or null. */
export async function currentCustomer(request: NextRequest): Promise<Customer | null> {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const [key, expiryText, sig] = token.split(".");
  const expiry = Number(expiryText);
  if (!key || !sig || !Number.isFinite(expiry) || expiry < Date.now()) return null;
  const customer = await getCustomerByKey(key);
  if (!customer) return null;
  const expected = sign(customer, expiry);
  return expected && safeEqual(sig, expected) ? customer : null;
}

const cookieBase = (request: NextRequest) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isSecureRequest(request),
  path: "/",
});

export function setSessionCookie(res: NextResponse, request: NextRequest, customer: Customer): boolean {
  const token = createSessionToken(customer);
  if (!token) return false;
  res.cookies.set(CUSTOMER_COOKIE, token, { ...cookieBase(request), maxAge: SESSION_MS / 1000 });
  return true;
}

export function clearSessionCookie(res: NextResponse, request: NextRequest) {
  res.cookies.set(CUSTOMER_COOKIE, "", { ...cookieBase(request), maxAge: 0 });
}
