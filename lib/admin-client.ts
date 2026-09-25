"use client";

/* Client-side helpers for the admin panel. Signing in sets an HttpOnly
   session cookie (see lib/admin-auth.ts) — nothing secret is ever stored
   where page scripts can read it. Every admin fetch goes through `adminFetch`
   so an expired session always bounces back to the login screen instead of
   showing a silently-broken dashboard. */

/** true if the browser currently holds a valid admin session */
export async function hasAdminSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/auth", { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminLogout() {
  try {
    await fetch("/api/admin/auth", { method: "DELETE" });
  } catch {
    /* offline — the cookie simply expires on its own */
  }
}

export async function adminFetch(input: string, init: RequestInit = {}) {
  const res = await fetch(input, { ...init, cache: "no-store" });
  if (res.status === 401) {
    // hard navigation on purpose: drops any half-loaded admin state
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  return res;
}
