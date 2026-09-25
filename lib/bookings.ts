/* Service bookings — same pattern as lib/orders.ts. A booking is a request:
 * the shop calls to confirm a time. No payment is taken online. */
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
  createdAt: string;
  updatedAt: string;
};

const readAll = () => readCollection<Booking[]>(COLLECTION, []);
const writeAll = (bookings: Booking[]) => writeCollection(COLLECTION, bookings);

export async function getBookings(): Promise<Booking[]> {
  const bookings = await readAll();
  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createBooking(input: Pick<Booking, "service" | "customer">): Promise<Booking> {
  const bookings = await readAll();
  const now = new Date().toISOString();
  const booking: Booking = {
    id: newId("SV"),
    service: input.service,
    customer: input.customer,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  bookings.push(booking);
  await writeAll(bookings);
  return booking;
}

export async function updateBookingStatus(id: string, status: OrderStatus): Promise<Booking | null> {
  const bookings = await readAll();
  const i = bookings.findIndex((b) => b.id === id);
  if (i === -1) return null;
  bookings[i] = { ...bookings[i], status, updatedAt: new Date().toISOString() };
  await writeAll(bookings);
  return bookings[i];
}
