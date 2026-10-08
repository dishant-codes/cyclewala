/* Service bookings — same pattern as lib/orders.ts (MongoDB collection `bookings` when the database
 * is configured, one JSON collection otherwise). A booking is a request: the shop calls to confirm a
 * time. No payment is taken online. */
import { db, dbConfigured } from "@/lib/db";
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

/* ---------------- MongoDB ---------------- */

type Doc = Booking & { _id: string };

const bookingsCol = async () => (await db()).collection<Doc>("bookings");

const toBooking = ({ _id, ...b }: Doc): Booking => {
  void _id;
  return b;
};

/** Insert a booking exactly as given (used for new bookings and by the file -> MongoDB migration). */
export async function insertBookingRow(b: Booking): Promise<void> {
  await (await bookingsCol()).updateOne({ _id: b.id }, { $setOnInsert: b }, { upsert: true });
}

/* ---------------- files (no database configured) ---------------- */

const readAll = () => readCollection<Booking[]>(COLLECTION, []);
const writeAll = (bookings: Booking[]) => writeCollection(COLLECTION, bookings);

/* ---------------- public API ---------------- */

export async function getBookings(): Promise<Booking[]> {
  if (dbConfigured()) {
    return (await (await bookingsCol()).find().sort({ createdAt: -1, _id: -1 }).toArray()).map(toBooking);
  }
  const bookings = await readAll();
  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** One customer's own service requests, newest first. */
export async function getBookingsForCustomer(customerKey: string): Promise<Booking[]> {
  if (dbConfigured()) {
    return (await (await bookingsCol()).find({ customerKey }).sort({ createdAt: -1, _id: -1 }).toArray()).map(toBooking);
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
  if (dbConfigured()) {
    await insertBookingRow(booking);
    return booking;
  }
  const bookings = await readAll();
  bookings.push(booking);
  await writeAll(bookings);
  return booking;
}

export async function updateBookingStatus(id: string, status: OrderStatus): Promise<Booking | null> {
  if (dbConfigured()) {
    const d = await (await bookingsCol()).findOneAndUpdate(
      { _id: id },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );
    return d ? toBooking(d) : null;
  }
  const bookings = await readAll();
  const i = bookings.findIndex((b) => b.id === id);
  if (i === -1) return null;
  bookings[i] = { ...bookings[i], status, updatedAt: new Date().toISOString() };
  await writeAll(bookings);
  return bookings[i];
}
