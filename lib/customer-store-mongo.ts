/* Customer accounts in MongoDB — the production store. A unique index on `email` makes the database
   itself enforce one account per email, so two sign-ups at the same instant can never both succeed, and
   each wishlist change is one atomic update on the customer's own document. */
import { ObjectId, type Document } from "mongodb";
import { newId } from "@/lib/storage";
import { db } from "@/lib/db";
import { EmailTaken, MAX_WISHLIST, type Customer, type CustomerStore } from "@/lib/customer-types";

type Doc = {
  _id: ObjectId;
  publicId: string;
  email: string;
  name: string;
  passwordHash: string;
  wishlist: string[];
  failed: number;
  lockedUntil: number;
  createdAt: Date;
  updatedAt: Date;
};

const customers = async () => (await db()).collection<Doc>("customers");

const toCustomer = (d: Doc): Customer => ({
  key: d._id.toHexString(),
  id: d.publicId,
  email: d.email,
  name: d.name,
  passwordHash: d.passwordHash,
  wishlist: d.wishlist ?? [],
  failed: d.failed ?? 0,
  lockedUntil: Number(d.lockedUntil) || 0,
  createdAt: new Date(d.createdAt).toISOString(),
  updatedAt: new Date(d.updatedAt).toISOString(),
});

export const mongoStore: CustomerStore = {
  async findByKey(key) {
    if (!/^[0-9a-f]{24}$/.test(key)) return null;
    const d = await (await customers()).findOne({ _id: new ObjectId(key) });
    return d ? toCustomer(d) : null;
  },

  async findByEmail(email) {
    const d = await (await customers()).findOne({ email });
    return d ? toCustomer(d) : null;
  },

  async insert({ email, name, passwordHash }) {
    const now = new Date();
    const doc: Doc = {
      _id: new ObjectId(),
      publicId: newId("CU"),
      email,
      name,
      passwordHash,
      wishlist: [],
      failed: 0,
      lockedUntil: 0,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await (await customers()).insertOne(doc);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) throw new EmailTaken();
      throw err;
    }
    return toCustomer(doc);
  },

  async update(c) {
    await (await customers()).updateOne(
      { _id: new ObjectId(c.key) },
      { $set: { name: c.name, passwordHash: c.passwordHash, failed: c.failed, lockedUntil: c.lockedUntil, updatedAt: new Date() } }
    );
  },

  async setWished(c, slug, wished) {
    const col = await customers();
    // one atomic pipeline update: drop the slug if present, put it back at the front when adding,
    // and keep only the newest MAX_WISHLIST
    const without: Document = { $filter: { input: { $ifNull: ["$wishlist", []] }, cond: { $ne: ["$$this", slug] } } };
    const next: Document = wished ? { $slice: [{ $concatArrays: [[slug], without] }, MAX_WISHLIST] } : without;
    const d = await col.findOneAndUpdate({ _id: new ObjectId(c.key) }, [{ $set: { wishlist: next } }], { returnDocument: "after" });
    return d?.wishlist ?? [];
  },

  async remove(c) {
    await (await customers()).deleteOne({ _id: new ObjectId(c.key) });
  },
};
