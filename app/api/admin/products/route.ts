import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";
import { createProduct, getProducts, parseProductFields } from "@/lib/products";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getProducts());
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = parseProductFields(body ?? {}, false);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const f = parsed.value;

    const product = await createProduct({
      slug: f.slug!,
      brand: f.brand!,
      model: f.model!,
      category: f.category!,
      sizes: f.sizes!,
      specs: f.specs ?? [],
      price: f.price ?? null,
      rating: f.rating ?? 4.2,
      image: f.image!,
      inStock: f.inStock ?? true,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
