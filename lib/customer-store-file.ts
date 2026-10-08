/* Customer accounts as small documents in the shop's general storage — used whenever MongoDB is NOT
   configured (see lib/customer-store.ts): Vercel Blob on Vercel, Netlify Blobs on Netlify, plain files on a
   server or your own machine. One document per customer, keyed by a hash of their email, through the same
   lib/storage.ts the orders and catalogue use. */
import { createHash } from "crypto";
import { newId, readCollection, writeCollection } from "@/lib/storage";
import { EmailTaken, MAX_WISHLIST, type Customer, type CustomerStore } from "@/lib/customer-types";

type Doc = Customer & { deleted?: boolean };

const keyOf = (email: string) => createHash("sha256").update(email).digest("hex");
const name = (key: string) => `customers/${key}`;

async function read(key: string): Promise<Customer | null> {
  if (!/^[0-9a-f]{64}$/.test(key)) return null;
  const doc = await readCollection<Doc | null>(name(key), null);
  return doc && !doc.deleted ? doc : null;
}

async function write(c: Customer) {
  await writeCollection(name(c.key), { ...c, updatedAt: new Date().toISOString() });
}

export const fileStore: CustomerStore = {
  findByKey: read,
  findByEmail: (email) => read(keyOf(email)),

  async insert({ email, name: displayName, passwordHash }) {
    const key = keyOf(email);
    if (await read(key)) throw new EmailTaken();
    const now = new Date().toISOString();
    const c: Customer = {
      key,
      id: newId("CU"),
      email,
      name: displayName,
      passwordHash,
      wishlist: [],
      failed: 0,
      lockedUntil: 0,
      createdAt: now,
      updatedAt: now,
    };
    await writeCollection(name(key), c);
    return c;
  },

  async update(c) {
    await write(c);
  },

  async setWished(c, slug, wished) {
    const fresh = (await read(c.key)) ?? c;
    const rest = fresh.wishlist.filter((s) => s !== slug);
    const wishlist = (wished ? [slug, ...rest] : rest).slice(0, MAX_WISHLIST);
    await write({ ...fresh, wishlist });
    return wishlist;
  },

  async remove(c) {
    await writeCollection(name(c.key), { key: c.key, id: c.id, deleted: true, deletedAt: new Date().toISOString() });
  },
};
