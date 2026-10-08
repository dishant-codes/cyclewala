"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { adminFetch, adminLogout, hasAdminSession } from "@/lib/admin-client";
import ProductForm from "@/components/admin/ProductForm";
import BrandSections from "@/components/admin/BrandSections";
import OrdersPanel from "@/components/admin/OrdersPanel";
import BookingsPanel from "@/components/admin/BookingsPanel";
import styles from "./dashboard.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  kids: "Kids' Cycles",
  mtb: "Mountain Cycles",
  hybrid: "City & Hybrid",
  ebike: "E-Bikes",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"cycles" | "orders" | "bookings">("cycles");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  /** the brand the "add" form opens with ("" = type a new one) */
  const [newBrand, setNewBrand] = useState("");
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
              defaultBrand={editing === "new" ? newBrand : undefined}
              brands={[...new Set((products ?? []).map((p) => p.brand.trim()).filter(Boolean))].sort()}
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

  const stats = products && [
    { label: "Cycles", value: products.length },
    { label: "Brands", value: new Set(products.map((x) => x.brand.trim().toLowerCase())).size },
    { label: "In stock", value: products.filter((x) => x.inStock).length, tone: "ok" },
    { label: "Out of stock", value: products.filter((x) => !x.inStock).length, tone: "out" },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
        <div className={styles.head}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-wordmark.png" alt="Cycle Wala" className={styles.headerLogo} />
            <div>
              <p className={styles.kicker}>Admin</p>
              <h1 className={styles.h1}>Manage the Shop</h1>
            </div>
          </div>
          <div className={styles.headActions}>
            {tab === "cycles" && (
              <button
                className={styles.add}
                onClick={() => {
                  setNewBrand("");
                  setEditing("new");
                }}
              >
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
        {stats && (
          <div className={styles.stats}>
            {stats.map((s) => (
              <div className={styles.stat} key={s.label} data-tone={s.tone}>
                <strong>{s.value.toLocaleString("en-IN")}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
        </header>

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
              placeholder="Search all brands by model, size or category…"
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
          <BrandSections
            products={filteredProducts ?? products}
            searching={q !== ""}
            onEdit={setEditing}
            onDelete={handleDelete}
            onAdd={(brand) => {
              setNewBrand(brand);
              setEditing("new");
            }}
          />
        )}
      </div>
    </main>
  );
}
