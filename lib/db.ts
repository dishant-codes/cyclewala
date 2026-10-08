/* MongoDB connection for the whole shop: customer accounts, orders, service bookings, the product
 * catalogue, admin photo uploads and a small key-value collection.
 *
 * Configure with these environment variables (see .env.example):
 *   MONGODB_URI   the connection string, e.g. mongodb+srv://user:password@cluster0.abcde.mongodb.net/
 *   MONGODB_DB    the database name (default "cyclewala")
 *
 * MongoDB Atlas (free M0 cluster) works from Vercel, Hostinger or your own machine — the only host-side
 * setting is Atlas -> Network Access, which must allow the host's address (0.0.0.0/0 on Vercel, whose
 * addresses change).
 *
 * One client is shared by the whole server process (and survives dev hot-reloads). Collections and indexes
 * are created on first use, so there is nothing to set up by hand.
 *
 * Without MONGODB_URI the shop keeps using its general storage exactly as before — Vercel Blob on Vercel,
 * Netlify Blobs on Netlify, plain files elsewhere. Set USE_DATABASE=false to switch MongoDB off while
 * leaving the URI in place.
 */
import { MongoClient, type Db } from "mongodb";

export function dbConfigured(): boolean {
  return process.env.USE_DATABASE !== "false" && !!process.env.MONGODB_URI;
}

const RETRY_AFTER_MS = 10_000;

type Shared = { ready?: Promise<Db>; uri?: string; failed?: { at: number; err: unknown } };
const g = globalThis as unknown as { __cwMongo?: Shared };
const shared: Shared = (g.__cwMongo ??= {});

/** The database, with the collections' indexes guaranteed to exist. */
export function db(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return Promise.reject(new Error("MONGODB_URI is not set"));
  if (shared.ready && shared.uri === uri) return shared.ready;
  // after a failed connection, answer straight away for a few seconds instead of making every request wait
  // out the connection timeout again
  if (shared.failed && Date.now() - shared.failed.at < RETRY_AFTER_MS) return Promise.reject(shared.failed.err);
  shared.uri = uri;
  const client = new MongoClient(uri, {
    // serverless functions and shared hosts only need a handful of connections
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 10_000,
  });
  shared.ready = (async () => {
    const database = client.db(process.env.MONGODB_DB || "cyclewala");
    await Promise.all([
      database.collection("customers").createIndexes([
        { key: { email: 1 }, unique: true, name: "uq_customers_email" },
        { key: { publicId: 1 }, unique: true, name: "uq_customers_public_id" },
      ]),
      database.collection("orders").createIndexes([
        { key: { customerKey: 1 }, name: "idx_orders_customer" },
        { key: { createdAt: -1 }, name: "idx_orders_created" },
      ]),
      database.collection("bookings").createIndexes([
        { key: { customerKey: 1 }, name: "idx_bookings_customer" },
        { key: { createdAt: -1 }, name: "idx_bookings_created" },
      ]),
      database.collection("products").createIndexes([{ key: { seq: 1 }, name: "idx_products_seq" }]),
    ]);
    shared.failed = undefined;
    return database;
  })().catch((err) => {
    // let a later request try again instead of caching the failure forever
    shared.ready = undefined;
    shared.failed = { at: Date.now(), err };
    void client.close().catch(() => {});
    throw err;
  });
  return shared.ready;
}
