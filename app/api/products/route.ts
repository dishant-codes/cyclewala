import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

/* Public read-only endpoint — the Shop page fetches from here so that
   admin edits show up on the live site immediately. No auth: this is the
   same data anyone browsing the shop already sees. */
export async function GET() {
  return NextResponse.json(await getProducts());
}
