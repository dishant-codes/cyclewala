/* Small guards shared by the customer API routes. */
import type { NextRequest } from "next/server";

/** A browser always sends an Origin header on a cross-site POST/PUT/PATCH/DELETE. If one is present it
 *  has to be this very site — this stops another website from making a signed-in customer's browser
 *  change their wishlist or password. (Requests with no Origin are non-browser clients, which carry no
 *  ambient cookie to abuse.) */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Parse a JSON body; null when it is missing, malformed or not an object. */
export async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
