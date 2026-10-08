/* One-time copy of the shop's existing data into MongoDB:
 *
 *   orders, bookings
 *   products (your catalogue, including every admin edit) + which built-in entries were already imported
 *   customer accounts + wishlists
 *   photos uploaded in the admin
 *
 * Where it reads from:
 *   npm run db:migrate                         the ./data folder (or DATA_DIR) on this machine
 *   npm run db:migrate -- --from ./backup      another folder
 *   npm run db:migrate -- --blob               your live Vercel Blob store (needs BLOB_READ_WRITE_TOKEN)
 *
 * Needs MONGODB_URI (and optionally MONGODB_DB) in .env / .env.local. It only READS the source — nothing is
 * deleted or changed there — and it is safe to run again: orders, bookings, customers and photos already in
 * MongoDB are skipped. Products already in MongoDB are left alone unless you add --force.
 *
 * Customer accounts get new ids in MongoDB; the customer link on their orders / bookings is rewritten to match,
 * so "My orders" keeps working.
 */
import fs from "node:fs";
import path from "node:path";
import { Binary, MongoClient, ObjectId } from "mongodb";

const args = process.argv.slice(2);
const force = args.includes("--force");
const fromBlob = args.includes("--blob");
const fromIdx = args.indexOf("--from");
const dir = path.resolve(fromIdx >= 0 ? args[fromIdx + 1] : process.env.DATA_DIR || "data");

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI. Put it in .env or .env.local first.");
  process.exit(1);
}
if (fromBlob && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("--blob needs BLOB_READ_WRITE_TOKEN (Vercel -> Storage -> your Blob store -> .env.local tab).");
  process.exit(1);
}

/* ---------- source ---------- */
let blob = null;
if (fromBlob) blob = await import("@vercel/blob");

async function blobBytes(pathname) {
  const r = await blob.get(pathname, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return { bytes: Buffer.from(await new Response(r.stream).arrayBuffer()), contentType: r.blob.contentType };
}

async function blobList(prefix) {
  const out = [];
  let cursor;
  do {
    const page = await blob.list({ prefix, cursor, limit: 1000 });
    out.push(...page.blobs.map((b) => b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function readJson(name, fallback) {
  try {
    if (fromBlob) {
      const f = await blobBytes(`collections/${name}.json`);
      return f ? JSON.parse(f.bytes.toString("utf8")) : fallback;
    }
    return JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), "utf8"));
  } catch {
    return fallback;
  }
}

async function readCustomers() {
  const docs = [];
  if (fromBlob) {
    for (const p of await blobList("collections/customers/")) {
      const f = await blobBytes(p);
      if (f) docs.push(JSON.parse(f.bytes.toString("utf8")));
    }
  } else {
    const d = path.join(dir, "customers");
    if (fs.existsSync(d)) {
      for (const f of fs.readdirSync(d)) {
        if (f.endsWith(".json")) docs.push(JSON.parse(fs.readFileSync(path.join(d, f), "utf8")));
      }
    }
  }
  return docs.filter((c) => c && !c.deleted && c.email && c.passwordHash);
}

const PHOTO_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const extOf = (name) => (name.split(".").pop() || "").toLowerCase();

async function readPhotos() {
  const out = [];
  if (fromBlob) {
    for (const p of await blobList("uploads/")) {
      const f = await blobBytes(p);
      if (f) out.push({ name: p.slice("uploads/".length), bytes: f.bytes, type: f.contentType || PHOTO_TYPES[extOf(p)] || "application/octet-stream" });
    }
  } else {
    const d = path.join(dir, "uploads");
    if (fs.existsSync(d)) {
      for (const f of fs.readdirSync(d)) {
        const t = PHOTO_TYPES[extOf(f)];
        if (t) out.push({ name: f, bytes: fs.readFileSync(path.join(d, f)), type: t });
      }
    }
  }
  return out;
}

/* ---------- target ---------- */
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
await client.connect();
const database = client.db(process.env.MONGODB_DB || "cyclewala");
console.log(`Copying from ${fromBlob ? "Vercel Blob" : dir}\n        into MongoDB database "${database.databaseName}"\n`);

await database.collection("customers").createIndexes([
  { key: { email: 1 }, unique: true, name: "uq_customers_email" },
  { key: { publicId: 1 }, unique: true, name: "uq_customers_public_id" },
]);
await database.collection("orders").createIndexes([
  { key: { customerKey: 1 }, name: "idx_orders_customer" },
  { key: { createdAt: -1 }, name: "idx_orders_created" },
]);
await database.collection("bookings").createIndexes([
  { key: { customerKey: 1 }, name: "idx_bookings_customer" },
  { key: { createdAt: -1 }, name: "idx_bookings_created" },
]);
await database.collection("products").createIndexes([{ key: { seq: 1 }, name: "idx_products_seq" }]);

/** insert the documents whose _id is not there yet; returns how many were new */
async function addNew(col, docs) {
  if (!docs.length) return 0;
  const res = await database.collection(col).bulkWrite(
    docs.map((d) => ({ updateOne: { filter: { _id: d._id }, update: { $setOnInsert: d }, upsert: true } })),
    { ordered: false }
  );
  return res.upsertedCount;
}

// customers first, so their orders can be re-linked
const keyMap = new Map(); // old customer key -> new key
const customers = await readCustomers();
let customersAdded = 0;
for (const c of customers) {
  const email = String(c.email).toLowerCase();
  const existing = await database.collection("customers").findOne({ email });
  if (existing) {
    keyMap.set(c.key, existing._id.toHexString());
    continue;
  }
  const _id = new ObjectId();
  await database.collection("customers").insertOne({
    _id,
    publicId: c.id,
    email,
    name: c.name,
    passwordHash: c.passwordHash,
    wishlist: Array.isArray(c.wishlist) ? c.wishlist : [],
    failed: c.failed ?? 0,
    lockedUntil: c.lockedUntil ?? 0,
    createdAt: new Date(c.createdAt || Date.now()),
    updatedAt: new Date(c.updatedAt || Date.now()),
  });
  keyMap.set(c.key, _id.toHexString());
  customersAdded++;
}
console.log(`customers   ${customersAdded} added, ${customers.length - customersAdded} already there   (${customers.length} found)`);

const relink = (o) => (o.customerKey && keyMap.has(o.customerKey) ? { ...o, customerKey: keyMap.get(o.customerKey) } : o);

// orders + bookings
const orders = await readJson("orders", []);
const ordersAdded = await addNew("orders", orders.map((x) => ({ _id: x.id, ...relink(x) })));
console.log(`orders      ${ordersAdded} added, ${orders.length - ordersAdded} already there   (${orders.length} found)`);

const bookings = await readJson("bookings", []);
const bookingsAdded = await addNew("bookings", bookings.map((x) => ({ _id: x.id, ...relink(x) })));
console.log(`bookings    ${bookingsAdded} added, ${bookings.length - bookingsAdded} already there   (${bookings.length} found)`);

// products
const products = await readJson("products", null);
if (!products) {
  console.log("products    none found — skipped (the site will build the catalogue from its built-in lists)");
} else {
  const col = database.collection("products");
  const existing = await col.countDocuments();
  if (existing > 0 && !force) {
    console.log(`products    skipped — MongoDB already has ${existing}. Use --force to replace them with the ${products.length} found.`);
  } else {
    if (force) await col.deleteMany({});
    for (let i = 0; i < products.length; i += 200) {
      await col.bulkWrite(
        products.slice(i, i + 200).map((p, j) => ({
          replaceOne: { filter: { _id: p.slug }, replacement: { seq: i + j, data: p }, upsert: true },
        }))
      );
    }
    console.log(`products    ${products.length} copied`);
  }
}

// which built-in catalogue entries were already imported (so deleted ones are not brought back)
const imports = await readJson("catalog-imports", null);
if (imports) {
  const col = database.collection("collections");
  if (force || !(await col.findOne({ _id: "catalog-imports" }))) {
    await col.updateOne({ _id: "catalog-imports" }, { $set: { value: JSON.stringify(imports), updatedAt: new Date() } }, { upsert: true });
    console.log(`imports     ${imports.length} catalogue entries marked as imported`);
  } else {
    console.log("imports     already recorded — skipped");
  }
}

// uploaded photos
const photos = await readPhotos();
let photosAdded = 0;
for (const p of photos) {
  const res = await database
    .collection("uploads")
    .updateOne({ _id: p.name }, { $setOnInsert: { contentType: p.type, bytes: new Binary(p.bytes), createdAt: new Date() } }, { upsert: true });
  photosAdded += res.upsertedCount;
}
console.log(`uploads     ${photosAdded} added, ${photos.length - photosAdded} already there   (${photos.length} found)`);

console.log("\nDone. The source was not touched.");
await client.close();
