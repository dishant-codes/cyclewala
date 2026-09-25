import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin-auth";
import { writeUpload } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024;

/* What the file actually IS, judged by its first bytes — the browser-supplied
   type and filename are never trusted. */
function sniff(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

const EXT_TYPE = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

/* Admin photo upload — saves via lib/storage.ts (a local file, or Netlify
   Blobs when deployed there) and returns the path to store on the product.
   Served back at /uploads/<file>, see app/uploads/[file]/route.ts. The
   filename comes from the product slug, never from the uploaded file's own
   name. */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const slug = form.get("slug");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof slug !== "string" || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Missing or invalid slug" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) {
    return NextResponse.json({ error: "Only JPEG, PNG or WEBP images are allowed" }, { status: 400 });
  }

  const filename = `${slug}-${Date.now()}.${ext}`;
  await writeUpload(filename, bytes, EXT_TYPE[ext]);

  return NextResponse.json({ path: `/uploads/${filename}` });
}
