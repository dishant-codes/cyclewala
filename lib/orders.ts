/* Order type + persistence.
 *
 * Where orders are kept: MySQL (table `orders`) whenever the database is configured — each new order is a
 * single INSERT, so two customers ordering at the same moment can never overwrite each other. Without a
 * database (a developer machine), the old behaviour: one JSON collection via lib/storage.ts.
 *
 * There's no payment gateway wired up (that needs a real merchant account with Razorpay/Stripe/etc.),
 * so every order is Pay at Store / Cash on Delivery: the customer submits their details and what they
 * want, the shop calls to confirm, payment happens in person. Nothing here pretends to process a card
 * or charge anyone.
 */
import type { RowDataPacket } from "mysql2";
import { db, mysqlConfigured } from "@/lib/db";
import { newId, readCollection, writeCollection } from "@/lib/storage";

const COLLECTION = "orders";

export type OrderItem = {
  slug: string;
  /** options the customer picked, when the cycle comes in several */
  color?: string;
  size?: string;
  type?: string;
  brand: string;
  model: string;
  price: number | null;
  qty: number;
};

export type OrderStatus = "new" | "contacted" | "fulfilled" | "cancelled";

export type Order = {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    note?: string;
  };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  /** the signed-in customer's account key, when they were signed in — lets them see it under My orders */
  customerKey?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------------- MySQL ---------------- */

type Row = RowDataPacket & {
  id: string;
  customer_key: string | null;
  name: string;
  phone: string;
  address: string;
  note: string | null;
  items: string;
  total: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
};

const toOrder = (r: Row): Order => ({
  id: r.id,
  customer: { name: r.name, phone: r.phone, address: r.address, ...(r.note ? { note: r.note } : {}) },
  items: JSON.parse(r.items) as OrderItem[],
  total: Number(r.total),
  status: r.status,
  ...(r.customer_key ? { customerKey: r.customer_key } : {}),
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
});

/** Insert an order exactly as given (used for new orders and by the file → MySQL migration). */
export async function insertOrderRow(o: Order): Promise<void> {
  const pool = await db();
  await pool.query(
    `INSERT IGNORE INTO orders (id, customer_key, name, phone, address, note, items, total, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      o.id,
      o.customerKey ?? null,
      o.customer.name,
      o.customer.phone,
      o.customer.address,
      o.customer.note ?? null,
      JSON.stringify(o.items),
      o.total,
      o.status,
      new Date(o.createdAt),
      new Date(o.updatedAt),
    ]
  );
}

/* ---------------- files (no database configured) ---------------- */

const readAll = () => readCollection<Order[]>(COLLECTION, []);
const writeAll = (orders: Order[]) => writeCollection(COLLECTION, orders);

/* ---------------- public API ---------------- */

export async function getOrders(): Promise<Order[]> {
  if (mysqlConfigured()) {
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM orders ORDER BY created_at DESC, id DESC");
    return rows.map(toOrder);
  }
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** One customer's own orders, newest first. */
export async function getOrdersForCustomer(customerKey: string): Promise<Order[]> {
  if (mysqlConfigured()) {
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM orders WHERE customer_key = ? ORDER BY created_at DESC, id DESC", [customerKey]);
    return rows.map(toOrder);
  }
  return (await getOrders()).filter((o) => o.customerKey === customerKey);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (mysqlConfigured()) {
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? toOrder(rows[0]) : undefined;
  }
  const orders = await readAll();
  return orders.find((o) => o.id === id);
}

export async function createOrder(input: {
  customer: Order["customer"];
  items: OrderItem[];
  customerKey?: string;
}): Promise<Order> {
  const now = new Date().toISOString();
  const total = input.items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
  const order: Order = {
    id: newId("CW"),
    customer: input.customer,
    items: input.items,
    total,
    status: "new",
    ...(input.customerKey ? { customerKey: input.customerKey } : {}),
    createdAt: now,
    updatedAt: now,
  };
  if (mysqlConfigured()) {
    await insertOrderRow(order);
    return order;
  }
  const orders = await readAll();
  orders.push(order);
  await writeAll(orders);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  if (mysqlConfigured()) {
    const pool = await db();
    await pool.query("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", [status, new Date(), id]);
    return (await getOrderById(id)) ?? null;
  }
  const orders = await readAll();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
  await writeAll(orders);
  return orders[index];
}
