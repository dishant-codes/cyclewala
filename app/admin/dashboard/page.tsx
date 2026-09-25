"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { adminFetch, adminLogout, hasAdminSession } from "@/lib/admin-client";
import ProductForm from "@/components/admin/ProductForm";
import OrdersPanel from "@/components/admin/OrdersPanel";
import BookingsPanel from "@/components/admin/BookingsPanel";
import styles from "./dashboard.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  kids: "Kids' Cycles",
  mtb: "Mountain Cycles",
  hybrid: "City & Hybrid",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"cycles" | "orders" | "bookings">("cycles");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const res = await adminFetch("/api/admin/products");
      setProducts(await res.json());
    } catch {
      /* adminFetch already redirects on 401 */
    }
  };

  useEffect(() => {
    hasAdminSession().then((ok) => {
      if (!ok) router.replace("/admin/login");
      else load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this cycle? This can't be undone.")) return;
    setError("");
    try {
      const res = await adminFetch(`/api/admin/products/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      load();
    } catch {
      setError("Couldn't delete that cycle — try again.");
    }
  };

  const logout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  const q = search.trim().toLowerCase();
  const filteredProducts =
    !q || !products
      ? products
      : products.filter((p) =>
          [p.brand, p.model, p.slug, CATEGORY_LABEL[p.category], p.sizes]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );

  if (editing) {
    return (
      <main className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.formHead}>
            <button type="button" className={styles.backLink} onClick={() => setEditing(null)}>
              ← Back to cycles
            </button>
            <h1 className={styles.h1}>{editing === "new" ? "Add a Cycle" : `Edit ${editing.model}`}</h1>
            <p className={styles.formSub}>
              {editing === "new"
                ? "Fill in the details below — brand, model, sizes and a photo are required."
                : `Update ${editing.brand} ${editing.model}'s details, price or photo.`}
            </p>
          </div>
          <div className={styles.formCard}>
            <ProductForm
              initial={editing === "new" ? undefined : editing}
              onCancel={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                load();
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/cyclewala-logo-remove-back.png" alt="Cycle Wala" className={styles.headerLogo} />
            <div>
              <p className={styles.kicker}>Admin</p>
              <h1 className={styles.h1}>Manage the Shop</h1>
            </div>
          </div>
          <div className={styles.headActions}>
            {tab === "cycles" && (
              <button className={styles.add} onClick={() => setEditing("new")}>
                + Add Cycle
              </button>
            )}
            <Link href="/" className={styles.viewSite}>
              View site ↗
            </Link>
            <button className={styles.logout} onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          <button className={tab === "cycles" ? styles.tabOn : styles.tab} onClick={() => setTab("cycles")}>
            Cycles
          </button>
          <button className={tab === "orders" ? styles.tabOn : styles.tab} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button className={tab === "bookings" ? styles.tabOn : styles.tab} onClick={() => setTab("bookings")}>
            Bookings
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {tab === "cycles" && products !== null && products.length > 0 && (
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search by brand, model or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cycles"
            />
          </div>
        )}

        {tab === "orders" ? (
          <OrdersPanel />
        ) : tab === "bookings" ? (
          <BookingsPanel />
        ) : products === null ? (
          <p className={styles.hint}>Loading…</p>
        ) : products.length === 0 ? (
          <p className={styles.hint}>No cycles yet — add the first one.</p>
        ) : filteredProducts && filteredProducts.length === 0 ? (
          <p className={styles.hint}>No cycles match &quot;{search}&quot;.</p>
        ) : (
          <div className={styles.table}>
            {(filteredProducts ?? products).map((p) => (
              <div className={styles.row} key={p.slug}>
                <div className={styles.rowPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" />
                </div>
                <div className={styles.rowInfo}>
                  <p className={styles.rowBrand}>{p.brand}</p>
                  <p className={styles.rowModel}>{p.model}</p>
                  <p className={styles.rowMeta}>
                    {CATEGORY_LABEL[p.category]} · {p.sizes}
                  </p>
                </div>
                <div className={styles.rowPrice}>
                  {p.price != null ? `₹${p.price.toLocaleString("en-IN")}` : "Add: price"}
                </div>
                <div className={p.inStock ? styles.stockOk : styles.stockOut}>
                  {p.inStock ? "In stock" : "Out of stock"}
                </div>
                <div className={styles.rowActions}>
                  <button onClick={() => setEditing(p)}>Edit</button>
                  <button className={styles.delete} onClick={() => handleDelete(p.slug)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
