/* Which storage the customer accounts use — the same rule as the rest of the shop (lib/storage.ts):
 *
 *   - MySQL, whenever DB_HOST / DB_NAME / DB_USER are set (Hostinger, or Laragon locally).
 *   - Otherwise the shop's general storage, one small document per customer: Vercel Blob on Vercel,
 *     Netlify Blobs on Netlify, or plain files on a server / your own machine.
 *
 * So the very same code runs on Vercel today (Blob) and on Hostinger later (MySQL) — only the
 * environment variables differ. If a host has no persistent storage at all (Vercel without a Blob
 * token), saving an account fails with an error instead of quietly losing it.
 */
import { mysqlConfigured } from "@/lib/db";
import { mysqlStore } from "@/lib/customer-store-mysql";
import { fileStore } from "@/lib/customer-store-file";
import type { CustomerStore } from "@/lib/customer-types";

export const customerStorageAvailable = () => true;

export function customerStore(): CustomerStore {
  return mysqlConfigured() ? mysqlStore : fileStore;
}
