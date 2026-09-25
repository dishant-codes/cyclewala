/* Order type + persistence — same pattern as lib/products.ts (storage itself
 * lives in lib/storage.ts, a local file or Netlify Blobs depending on host).
 *
 * There's no payment gateway wired up (that needs a real merchant account
 * with Razorpay/Stripe/etc., which nobody has set up), so every order is
 * Pay at Store / Cash on Delivery: the customer submits their details and
 * what they want, the shop calls to confirm, payment happens in person.
 * Nothing here pretends to process a card or charge anyone.
 */
import { newId, readCollection, writeCollection } from "@/lib/storage";

const COLLECTION = "orders";

export type OrderItem = {
  slug: string;
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
  createdAt: string;
  updatedAt: string;
};

const readAll = () => readCollection<Order[]>(COLLECTION, []);
const writeAll = (orders: Order[]) => writeCollection(COLLECTION, orders);

export async function getOrders(): Promise<Order[]> {
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await readAll();
  return orders.find((o) => o.id === id);
}

export async function createOrder(input: { customer: Order["customer"]; items: OrderItem[] }): Promise<Order> {
  const orders = await readAll();
  const now = new Date().toISOString();
  const total = input.items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
  const order: Order = {
    id: newId("CW"),
    customer: input.customer,
    items: input.items,
    total,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  orders.push(order);
  await writeAll(orders);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const orders = await readAll();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
  await writeAll(orders);
  return orders[index];
}
