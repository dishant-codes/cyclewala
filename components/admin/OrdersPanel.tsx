"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders";
import { adminFetch } from "@/lib/admin-client";
import styles from "./OrdersPanel.module.css";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
  }, []);

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

  if (orders === null) return <p className={styles.hint}>Loading…</p>;
  if (orders.length === 0) return <p className={styles.hint}>No orders yet.</p>;

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? orders
    : orders.filter((o) =>
        [o.id, o.customer.name, o.customer.phone, o.customer.address, o.customer.note, ...o.items.map((i) => `${i.brand} ${i.model}`)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );

  return (
    <div className={styles.list}>
      <div className={styles.toolbar}>
        <p className={styles.count}>{orders.length} order{orders.length === 1 ? "" : "s"}</p>
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
      {filtered.length === 0 && <p className={styles.hint}>No orders match &quot;{search}&quot;.</p>}
      {filtered.map((o) => (
        <div className={styles.card} key={o.id}>
          <div className={styles.top}>
            <div>
              <p className={styles.id}>{o.id}</p>
              <p className={styles.date}>{new Date(o.createdAt).toLocaleString("en-IN")}</p>
            </div>
            <select
              className={styles[`status_${o.status}`] ?? styles.status}
              value={o.status}
              onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.customer}>
            <p className={styles.customerName}>{o.customer.name}</p>
            <a className={styles.customerPhone} href={`tel:${o.customer.phone}`}>
              {o.customer.phone}
            </a>
            <p className={styles.customerAddress}>{o.customer.address}</p>
            {o.customer.note && <p className={styles.customerNote}>Note: {o.customer.note}</p>}
          </div>

          <ul className={styles.items}>
            {o.items.map((i) => (
              <li key={i.slug}>
                <span>
                  {i.brand} {i.model} × {i.qty}
                </span>
                <span>{i.price === null ? "Add: price" : `₹${(i.price * i.qty).toLocaleString("en-IN")}`}</span>
              </li>
            ))}
          </ul>

          <div className={styles.total}>
            <span>Total</span>
            <span>₹{o.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
