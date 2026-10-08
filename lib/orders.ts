/* Order type + persistence.
 *
 * Where orders are kept: MongoDB (collection `orders`, one document per order) whenever the database is
 * configured — each new order is a single insert, so two customers ordering at the same moment can never
 * overwrite each other. Without a database, the old behaviour: one JSON collection via lib/storage.ts.
 *
 * There's no payment gateway wired up (that needs a real merchant account with Razorpay/Stripe/etc.),
 * so every order is Pay at Store / Cash on Delivery: the customer submits their details and what they
 * want, the shop calls to confirm, payment happens in person. Nothing here pretends to process a card
 * or charge anyone.
 */
import { db, dbConfigured } from "@/lib/db";
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

/* ---------------- MongoDB ---------------- */

type Doc = Order & { _id: string };

const ordersCol = async () => (await db()).collection<Doc>("orders");

const toOrder = ({ _id, ...o }: Doc): Order => {
  void _id;
  return o;
};

/** Insert an order exactly as given (used for new orders and by the file -> MongoDB migration). */
export async function insertOrderRow(o: Order): Promise<void> {
  await (await ordersCol()).updateOne({ _id: o.id }, { $setOnInsert: o }, { upsert: true });
}

/* ---------------- files (no database configured) ---------------- */

const readAll = () => readCollection<Order[]>(COLLECTION, []);
const writeAll = (orders: Order[]) => writeCollection(COLLECTION, orders);

/* ---------------- public API ---------------- */

export async function getOrders(): Promise<Order[]> {
  if (dbConfigured()) {
    return (await (await ordersCol()).find().sort({ createdAt: -1, _id: -1 }).toArray()).map(toOrder);
  }
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** One customer's own orders, newest first. */
export async function getOrdersForCustomer(customerKey: string): Promise<Order[]> {
  if (dbConfigured()) {
    return (await (await ordersCol()).find({ customerKey }).sort({ createdAt: -1, _id: -1 }).toArray()).map(toOrder);
  }
  return (await getOrders()).filter((o) => o.customerKey === customerKey);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (dbConfigured()) {
    const d = await (await ordersCol()).findOne({ _id: id });
    return d ? toOrder(d) : undefined;
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
  if (dbConfigured()) {
    await insertOrderRow(order);
    return order;
  }
  const orders = await readAll();
  orders.push(order);
  await writeAll(orders);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  if (dbConfigured()) {
    const d = await (await ordersCol()).findOneAndUpdate(
      { _id: id },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );
    return d ? toOrder(d) : null;
  }
  const orders = await readAll();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
  await writeAll(orders);
  return orders[index];
}
