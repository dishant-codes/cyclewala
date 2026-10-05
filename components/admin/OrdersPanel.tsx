"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order, OrderItem, OrderStatus } from "@/lib/orders";
import type { Product, ProductVariant } from "@/lib/products";
import { adminFetch } from "@/lib/admin-client";
import styles from "./OrdersPanel.module.css";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

/* what the one-tap button on an order does next */
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  new: { to: "contacted", label: "Mark contacted" },
  contacted: { to: "fulfilled", label: "Mark fulfilled" },
};

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days} day${days === 1 ? "" : "s"} ago` : new Date(iso).toLocaleDateString("en-IN");
}

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** the variant a line was ordered as — gives the photo and swatch in the right colour */
function variantOf(product: Product | undefined, i: OrderItem): ProductVariant | undefined {
  const same = (a: string | undefined, b: string | undefined) => (a ?? "").toLowerCase() === (b ?? "").toLowerCase();
  return product?.variants?.find((v) => same(v.color, i.color) && same(v.size, i.size) && same(v.type, i.type));
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const load = async () => {
    try {
      const res = await adminFetch("/api/admin/orders");
      setOrders(await res.json());
    } catch {
      /* adminFetch redirects on 401 */
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount; state is set after the request resolves
    load();
    // photos for the ordered cycles — purely cosmetic, the panel works without them
    adminFetch("/api/admin/products")
      .then((r) => r.json())
      .then((p: Product[]) => setProducts(Array.isArray(p) ? p : []))
      .catch(() => {});
  }, []);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  const setStatus = async (id: string, status: OrderStatus) => {
    setError("");
    try {
      const res = await adminFetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      load();
    } catch {
      setError("Couldn't update that order — try again.");
    }
  };

  const downloadExcel = async () => {
    setError("");
    try {
      const res = await adminFetch("/api/admin/orders/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cyclewala-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't download the Excel file — try again.");
    }
  };

  const stats = useMemo(() => {
    const list = orders ?? [];
    const today = new Date().toDateString();
    const count = (s: OrderStatus) => list.filter((o) => o.status === s).length;
    return {
      all: list.length,
      new: count("new"),
      contacted: count("contacted"),
      fulfilled: count("fulfilled"),
      cancelled: count("cancelled"),
      today: list.filter((o) => new Date(o.createdAt).toDateString() === today).length,
      value: list.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0),
    };
  }, [orders]);

  if (orders === null) return <p className={styles.hint}>Loading…</p>;
  if (orders.length === 0)
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📦</span>
        <p>No orders yet</p>
        <small>Orders placed on the website will appear here, newest first.</small>
      </div>
    );

  const q = search.trim().toLowerCase();
  const filtered = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter(
      (o) =>
        !q ||
        [o.id, o.customer.name, o.customer.phone, o.customer.address, o.customer.note, ...o.items.map((i) => `${i.brand} ${i.model} ${i.color ?? ""} ${i.size ?? ""} ${i.type ?? ""}`)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
    );

  const tabs: { id: OrderStatus | "all"; label: string; n: number }[] = [
    { id: "all", label: "All", n: stats.all },
    { id: "new", label: "New", n: stats.new },
    { id: "contacted", label: "Contacted", n: stats.contacted },
    { id: "fulfilled", label: "Fulfilled", n: stats.fulfilled },
    { id: "cancelled", label: "Cancelled", n: stats.cancelled },
  ];

  return (
    <div className={styles.list}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statIcon} data-tone="blue">🧾</span>
          <div>
            <b>{stats.all}</b>
            <small>Total orders</small>
          </div>
        </div>
        <div className={`${styles.stat} ${stats.new > 0 ? styles.statAlert : ""}`}>
          <span className={styles.statIcon} data-tone="amber">🔔</span>
          <div>
            <b>{stats.new}</b>
            <small>New — need a call</small>
          </div>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon} data-tone="green">₹</span>
          <div>
            <b>{money(stats.value)}</b>
            <small>Order value</small>
          </div>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon} data-tone="violet">📅</span>
          <div>
            <b>{stats.today}</b>
            <small>Today</small>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Filter orders by status">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={filter === t.id}
              className={filter === t.id ? styles.tabOn : styles.tab}
              onClick={() => setFilter(t.id)}
            >
              {t.label}
              <span>{t.n}</span>
            </button>
          ))}
        </div>
        <button className={styles.download} onClick={downloadExcel}>
          ⬇ Download Excel
        </button>
      </div>

      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by order ID, name, phone or cycle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {filtered.length === 0 && (
        <p className={styles.hint}>
          No {filter === "all" ? "" : `${STATUS_LABEL[filter].toLowerCase()} `}orders{q ? <> match &quot;{search}&quot;</> : ""}.
        </p>
      )}

      {filtered.map((o) => {
        const digits = o.customer.phone.replace(/\D/g, "").slice(-10);
        const wa = `https://wa.me/91${digits}?text=${encodeURIComponent(`Hi ${o.customer.name}, this is Cycle Wala about your order ${o.id}.`)}`;
        const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customer.address)}`;
        const next = NEXT[o.status];
        const units = o.items.reduce((n, i) => n + i.qty, 0);
        return (
          <article className={`${styles.card} ${styles[`tone_${o.status}`] ?? ""}`} key={o.id}>
            <header className={styles.top}>
              <span className={styles.avatar}>{initials(o.customer.name)}</span>
              <div className={styles.topText}>
                <p className={styles.id}>{o.id}</p>
                <p className={styles.date}>
                  {timeAgo(o.createdAt)} · {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <select
                className={styles[`status_${o.status}`] ?? styles.status}
                value={o.status}
                aria-label={`Status of order ${o.id}`}
                onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </header>

            <div className={styles.body}>
              <section className={styles.customer}>
                <h4>Customer</h4>
                <p className={styles.customerName}>{o.customer.name}</p>
                <p className={styles.customerPhone}>{o.customer.phone}</p>
                <div className={styles.contactBtns}>
                  <a className={styles.callBtn} href={`tel:${o.customer.phone}`}>
                    📞 Call
                  </a>
                  <a className={styles.waBtn} href={wa} target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp
                  </a>
                </div>
                <p className={styles.customerAddress}>
                  <span>📍</span>
                  <a href={maps} target="_blank" rel="noopener noreferrer">
                    {o.customer.address}
                  </a>
                </p>
                {o.customer.note && <p className={styles.customerNote}>“{o.customer.note}”</p>}
              </section>

              <section className={styles.itemsWrap}>
                <h4>
                  Ordered <small>{units} item{units === 1 ? "" : "s"}</small>
                </h4>
                <ul className={styles.items}>
                  {o.items.map((i) => {
                    const product = bySlug.get(i.slug);
                    const v = variantOf(product, i);
                    const photo = v?.image ?? product?.image;
                    const options = [i.size, i.type].filter(Boolean).join(" · ");
                    return (
                      <li key={`${i.slug}|${i.color ?? ""}|${i.size ?? ""}|${i.type ?? ""}`}>
                        <span className={styles.thumb}>
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt="" loading="lazy" />
                          ) : (
                            "🚲"
                          )}
                        </span>
                        <span className={styles.itemText}>
                          <b>
                            {i.brand} {i.model}
                          </b>
                          <small>
                            {v && <i className={styles.swatch} style={{ background: v.swatch }} />}
                            {[i.color, options].filter(Boolean).join(" · ") || "Standard"}
                          </small>
                        </span>
                        <span className={styles.qty}>× {i.qty}</span>
                        <span className={styles.linePrice}>{i.price === null ? "Add: price" : money(i.price * i.qty)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            <footer className={styles.foot}>
              <div className={styles.total}>
                <span>Total · pay at store / on delivery</span>
                <b>{money(o.total)}</b>
              </div>
              {next && (
                <button type="button" className={styles.nextBtn} onClick={() => setStatus(o.id, next.to)}>
                  {next.label} →
                </button>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
