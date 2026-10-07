/* Customer accounts in MySQL — the production store. The database itself enforces one account per
   email (a UNIQUE key), so two sign-ups at the same instant can never both succeed, and each wishlist
   change is a single INSERT or DELETE rather than rewriting a file. */
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { newId } from "@/lib/storage";
import { db } from "@/lib/db";
import { EmailTaken, MAX_WISHLIST, type Customer, type CustomerStore } from "@/lib/customer-types";

type Row = RowDataPacket & {
  id: number | string;
  public_id: string;
  email: string;
  name: string;
  password_hash: string;
  failed_attempts: number;
  locked_until: number | string;
  created_at: Date;
  updated_at: Date;
};

const iso = (d: Date) => new Date(d).toISOString();

async function wishlistOf(id: string | number): Promise<string[]> {
  const pool = await db();
  const [rows] = await pool.query<(RowDataPacket & { product_slug: string })[]>(
    "SELECT product_slug FROM wishlist_items WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?",
    [id, MAX_WISHLIST]
  );
  return rows.map((r) => r.product_slug);
}

async function hydrate(row: Row): Promise<Customer> {
  return {
    key: String(row.id),
    id: row.public_id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    wishlist: await wishlistOf(row.id),
    failed: row.failed_attempts,
    lockedUntil: Number(row.locked_until),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export const mysqlStore: CustomerStore = {
  async findByKey(key) {
    if (!/^\d{1,19}$/.test(key)) return null;
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM customers WHERE id = ? LIMIT 1", [key]);
    return rows[0] ? hydrate(rows[0]) : null;
  },

  async findByEmail(email) {
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM customers WHERE email = ? LIMIT 1", [email]);
    return rows[0] ? hydrate(rows[0]) : null;
  },

  async insert({ email, name, passwordHash }) {
    const pool = await db();
    try {
      const [res] = await pool.query<ResultSetHeader>(
        "INSERT INTO customers (public_id, email, name, password_hash) VALUES (?, ?, ?, ?)",
        [newId("CU"), email, name, passwordHash]
      );
      const [rows] = await pool.query<Row[]>("SELECT * FROM customers WHERE id = ?", [res.insertId]);
      return hydrate(rows[0]);
    } catch (err) {
      if ((err as { code?: string }).code === "ER_DUP_ENTRY") throw new EmailTaken();
      throw err;
    }
  },

  async update(c) {
    const pool = await db();
    await pool.query("UPDATE customers SET name = ?, password_hash = ?, failed_attempts = ?, locked_until = ? WHERE id = ?", [
      c.name,
      c.passwordHash,
      c.failed,
      c.lockedUntil,
      c.key,
    ]);
  },

  async setWished(c, slug, wished) {
    const pool = await db();
    if (wished) {
      // adding a cycle that is already saved just brings it back to the top
      await pool.query(
        "INSERT INTO wishlist_items (customer_id, product_slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP(3)",
        [c.key, slug]
      );
    } else {
      await pool.query("DELETE FROM wishlist_items WHERE customer_id = ? AND product_slug = ?", [c.key, slug]);
    }
    const list = await wishlistOf(c.key);
    if (list.length >= MAX_WISHLIST) {
      // keep the newest MAX_WISHLIST — drop anything older
      await pool.query(
        `DELETE FROM wishlist_items WHERE customer_id = ? AND created_at < (
           SELECT created_at FROM (SELECT created_at FROM wishlist_items WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1 OFFSET ?) t
         )`,
        [c.key, c.key, MAX_WISHLIST - 1]
      );
    }
    return list;
  },

  async remove(c) {
    const pool = await db();
    // the wishlist rows go with it (ON DELETE CASCADE)
    await pool.query("DELETE FROM customers WHERE id = ?", [c.key]);
  },
};
