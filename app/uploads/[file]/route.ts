import { readUpload } from "@/lib/storage";

/* Serves admin-uploaded product photos, via lib/storage.ts (a local file, or
   Netlify Blobs when deployed there). Only the exact filenames the upload
   route creates are accepted — no path segments, nothing else is reachable. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-z0-9-]{1,80}-\d{10,15}\.(jpg|png|webp)$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const result = await readUpload(file);
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(result.bytes), {
    headers: {
      "Content-Type": result.contentType,
      // the filename carries a timestamp, so a given URL never changes
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
