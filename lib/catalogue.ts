/* One shared request for the product list. The Shop and the About stats both need it; sharing the
   promise means the ~700 KB JSON is downloaded once per visit instead of twice. A failed request is
   not remembered, so the next caller retries. */
import type { Product } from "@/lib/products";

let pending: Promise<Product[]> | null = null;

export function loadProducts(): Promise<Product[]> {
  if (!pending) {
    // wait for an idle moment (or 2.5 s) so the 700 KB list never competes with the first paint
    const idle = new Promise<void>((resolve) => {
      if (typeof requestIdleCallback === "function") requestIdleCallback(() => resolve(), { timeout: 2500 });
      else setTimeout(resolve, 1200);
    });
    pending = idle
      .then(() => fetch("/api/products"))
      .then((r) => {
        if (!r.ok) throw new Error(`products ${r.status}`);
        return r.json() as Promise<Product[]>;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
