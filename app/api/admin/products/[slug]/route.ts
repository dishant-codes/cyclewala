import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";
import { deleteProduct, getProductBySlug, parseProductFields, updateProduct } from "@/lib/products";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  try {
    const body = await request.json();
    // slug and rating are not editable here
    const editable: Record<string, unknown> = { ...(body ?? {}) };
    delete editable.slug;
    delete editable.rating;
    const parsed = parseProductFields(editable, true);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const updates = parsed.value;
    const product = await updateProduct(slug, updates);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const deleted = await deleteProduct(slug);
  if (!deleted) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ message: "Product deleted" });
}
