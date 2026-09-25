/* Shared input validation for the public forms (checkout, service booking).
 *
 * Every phone number collected here is used to call the customer back about
 * a real order or booking, so it has to be a genuine 10-digit Indian mobile
 * number — not just anything that merely looks phone-shaped. Mirrors the
 * server-side check in app/api/orders/route.ts and app/api/bookings/route.ts;
 * this client-side copy exists only to give instant feedback before submit.
 */

const clean = (v: string) => v.replace(/[\s\-().]/g, "");

/** True for a 10-digit Indian mobile number, optionally with a +91/91/0 prefix. */
export function isValidIndianMobile(value: string): boolean {
  return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(clean(value));
}

export const PHONE_HINT = "Enter a valid 10-digit mobile number, e.g. 98765 43210";
