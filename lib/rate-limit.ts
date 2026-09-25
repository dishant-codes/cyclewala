/* Small in-memory rate limiter for the public forms and the admin login.
 *
 * It is per server process, which is right for the single Node process this
 * site runs as. (If it is ever scaled to several instances, swap this for a
 * shared store such as Redis — the call sites won't change.)
 *
 * The client address comes from X-Forwarded-For, which is only trustworthy
 * when the site sits behind a reverse proxy that sets it (nginx, Caddy,
 * Render, Railway, ...). Direct exposure to the internet would let a client
 * pick its own address.
 */
import type { NextRequest } from "next/server";

const hits = new Map<string, number[]>();
let lastSweep = 0;

export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** true = allowed, false = over the limit. */
export function rateLimit(request: NextRequest, bucket: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  // drop stale keys now and then so the map can't grow forever
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [key, stamps] of hits) {
      if (!stamps.some((t) => now - t < 3_600_000)) hits.delete(key);
    }
  }

  const key = `${bucket}:${clientIp(request)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export const tooMany = () =>
  Response.json({ error: "Too many attempts — please wait a few minutes and try again." }, { status: 429 });
