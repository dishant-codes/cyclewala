/* Service bookings — same pattern as lib/orders.ts (MySQL table `bookings` when the database is
 * configured, one JSON collection otherwise). A booking is a request: the shop calls to confirm a
 * time. No payment is taken online. */
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, mysqlConfigured } from "@/lib/db";
import type { OrderStatus } from "@/lib/orders";
import { newId, readCollection, writeCollection } from "@/lib/storage";

const COLLECTION = "bookings";

export type Booking = {
  id: string;
  service: { id: string; title: string; price: number };
  customer: {
    name: string;
    phone: string;
    address?: string;
    cycle?: string;
    date?: string;
    note?: string;
  };
  status: OrderStatus;
  /** the signed-in customer's account key, when they were signed in */
  customerKey?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------------- MySQL ---------------- */

type Row = RowDataPacket & {
  id: string;
  customer_key: string | null;
  service_id: string;
  service_title: string;
  service_price: number;
  name: string;
  phone: string;
  address: string | null;
  cycle: string | null;
  preferred_date: string | null;
  note: string | null;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
};

const toBooking = (r: Row): Booking => ({
  id: r.id,
  service: { id: r.service_id, title: r.service_title, price: Number(r.service_price) },
  customer: {
    name: r.name,
    phone: r.phone,
    ...(r.address ? { address: r.address } : {}),
    ...(r.cycle ? { cycle: r.cycle } : {}),
    ...(r.preferred_date ? { date: r.preferred_date } : {}),
    ...(r.note ? { note: r.note } : {}),
  },
  status: r.status,
  ...(r.customer_key ? { customerKey: r.customer_key } : {}),
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
});

/** Insert a booking exactly as given (used for new bookings and by the file → MySQL migration). */
export async function insertBookingRow(b: Booking): Promise<void> {
  const pool = await db();
  await pool.query(
    `INSERT IGNORE INTO bookings
       (id, customer_key, service_id, service_title, service_price, name, phone, address, cycle, preferred_date, note, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.id,
      b.customerKey ?? null,
      b.service.id,
      b.service.title,
      b.service.price,
      b.customer.name,
      b.customer.phone,
      b.customer.address ?? null,
      b.customer.cycle ?? null,
      b.customer.date ?? null,
      b.customer.note ?? null,
      b.status,
      new Date(b.createdAt),
      new Date(b.updatedAt),
    ]
  );
}

/* ---------------- files (no database configured) ---------------- */

const readAll = () => readCollection<Booking[]>(COLLECTION, []);
const writeAll = (bookings: Booking[]) => writeCollection(COLLECTION, bookings);

/* ---------------- public API ---------------- */

export async function getBookings(): Promise<Booking[]> {
  if (mysqlConfigured()) {
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM bookings ORDER BY created_at DESC, id DESC");
    return rows.map(toBooking);
  }
  const bookings = await readAll();
  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** One customer's own service requests, newest first. */
export async function getBookingsForCustomer(customerKey: string): Promise<Booking[]> {
  if (mysqlConfigured()) {
    const pool = await db();
    const [rows] = await pool.query<Row[]>("SELECT * FROM bookings WHERE customer_key = ? ORDER BY created_at DESC, id DESC", [customerKey]);
    return rows.map(toBooking);
  }
  return (await getBookings()).filter((b) => b.customerKey === customerKey);
}

export async function createBooking(input: Pick<Booking, "service" | "customer"> & { customerKey?: string }): Promise<Booking> {
  const now = new Date().toISOString();
  const booking: Booking = {
    id: newId("SV"),
    service: input.service,
    customer: input.customer,
    status: "new",
    ...(input.customerKey ? { customerKey: input.customerKey } : {}),
    createdAt: now,
    updatedAt: now,
  };
  if (mysqlConfigured()) {
    await insertBookingRow(booking);
    return booking;
  }
  const bookings = await readAll();
  bookings.push(booking);
  await writeAll(bookings);
  return booking;
}

export async function updateBookingStatus(id: string, status: OrderStatus): Promise<Booking | null> {
  if (mysqlConfigured()) {
    const pool = await db();
    await pool.query<ResultSetHeader>("UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?", [status, new Date(), id]);
    const [rows] = await pool.query<Row[]>("SELECT * FROM bookings WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? toBooking(rows[0]) : null;
  }
  const bookings = await readAll();
  const i = bookings.findIndex((b) => b.id === id);
  if (i === -1) return null;
  bookings[i] = { ...bookings[i], status, updatedAt: new Date().toISOString() };
  await writeAll(bookings);
  return bookings[i];
}
