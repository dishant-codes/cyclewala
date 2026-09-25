/* Shared "database" for products, orders and bookings, plus admin photo
 * uploads. Two backends, chosen automatically:
 *
 *   - Netlify Blobs, when running as a deployed Netlify Function. Netlify
 *     Functions have a read-only filesystem outside of /tmp — plain `fs`
 *     writes there fail silently at runtime (this is exactly what broke
 *     "Place Order" once this site was hosted on Netlify: reads worked,
 *     writes didn't). Blobs is Netlify's own persistent key-value store —
 *     no separate account or service to set up. `SITE_ID` is a read-only
 *     env var Netlify only sets inside deployed Functions, never locally,
 *     which makes it a reliable switch:
 *     https://docs.netlify.com/build/functions/environment-variables/
 *   - The local filesystem otherwise (a VPS, Render, Railway, or your own
 *     machine in development) — unchanged from before, governed by
 *     DATA_DIR.
 *
 * Either way, callers (lib/products.ts, lib/orders.ts, lib/bookings.ts, the
 * upload routes) just await readCollection/writeCollection/readUpload/
 * writeUpload and never need to know which backend is actually active.
 */
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { getStore } from "@netlify/blobs";
import { get, put } from "@vercel/blob";

const ON_NETLIFY = !!process.env.SITE_ID;
const ON_VERCEL = !ON_NETLIFY && process.env.VERCEL === "1";
const ON_VERCEL_BLOB = ON_VERCEL && !!process.env.BLOB_READ_WRITE_TOKEN;

function requireVercelBlob() {
  if (ON_VERCEL && !ON_VERCEL_BLOB) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for Vercel persistence");
  }
}

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

/** Readable, collision-safe id: CW-MU56EPDY-3F9A */
export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

/* ---------- JSON collections: products / orders / bookings ---------- */

export async function readCollection<T>(name: string, fallback: T): Promise<T> {
  if (ON_NETLIFY) {
    const value = await getStore("cyclewala-data").get(name, { type: "json" });
    return value === null ? fallback : (value as T);
  }
  if (ON_VERCEL_BLOB) {
    const blob = await get(`collections/${name}.json`, { access: "private", useCache: false });
    if (!blob || blob.statusCode !== 200) return fallback;
    return (await new Response(blob.stream).json()) as T;
  }
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf-8"));
  } catch {
    return fallback;
  }
}

export async function writeCollection(name: string, data: unknown): Promise<void> {
  if (ON_NETLIFY) {
    await getStore("cyclewala-data").setJSON(name, data);
    return;
  }
  requireVercelBlob();
  if (ON_VERCEL_BLOB) {
    await put(`collections/${name}.json`, JSON.stringify(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // temp file + rename: a crash or power cut mid-write can never leave a
  // half-written (corrupt) JSON file behind
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

/* ---------- admin photo uploads ---------- */

export async function writeUpload(filename: string, bytes: Buffer, contentType: string): Promise<void> {
  if (ON_NETLIFY) {
    // Blobs wants a real standalone ArrayBuffer, not a Buffer/Uint8Array view
    // (Buffer.buffer can be a larger pooled allocation, hence the slice)
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    await getStore("cyclewala-uploads").set(filename, arrayBuffer, { metadata: { contentType } });
    return;
  }
  requireVercelBlob();
  if (ON_VERCEL_BLOB) {
    await put(`uploads/${filename}`, bytes, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    });
    return;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), bytes);
}

const EXT_TYPE: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function readUpload(filename: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (ON_NETLIFY) {
    const result = await getStore("cyclewala-uploads").getWithMetadata(filename, { type: "arrayBuffer" });
    if (!result) return null;
    const contentType = (result.metadata?.contentType as string) || "application/octet-stream";
    return { bytes: Buffer.from(result.data), contentType };
  }
  if (ON_VERCEL_BLOB) {
    const blob = await get(`uploads/${filename}`, { access: "private", useCache: false });
    if (!blob || blob.statusCode !== 200) return null;
    return {
      bytes: Buffer.from(await new Response(blob.stream).arrayBuffer()),
      contentType: blob.blob.contentType || "application/octet-stream",
    };
  }
  try {
    const bytes = fs.readFileSync(path.join(UPLOAD_DIR, filename));
    const ext = filename.split(".").pop() ?? "";
    return { bytes, contentType: EXT_TYPE[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
