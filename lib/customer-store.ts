/* Which storage the customer accounts use — the same rule as the rest of the shop (lib/storage.ts):
 *
 *   - MongoDB, whenever MONGODB_URI is set (MongoDB Atlas, or any MongoDB server).
 *   - Otherwise the shop's general storage, one small document per customer: Vercel Blob on Vercel,
 *     Netlify Blobs on Netlify, or plain files on a server / your own machine.
 *
 * So the very same code runs with or without a database — only the environment variables differ. If a
 * host has no persistent storage at all (Vercel without a Blob token), saving an account fails with an
 * error instead of quietly losing it.
 */
import { dbConfigured } from "@/lib/db";
import { mongoStore } from "@/lib/customer-store-mongo";
import { fileStore } from "@/lib/customer-store-file";
import type { CustomerStore } from "@/lib/customer-types";

export const customerStorageAvailable = () => true;

export function customerStore(): CustomerStore {
  return dbConfigured() ? mongoStore : fileStore;
}
