"use client";

import { useEffect, useState } from "react";
import type { Booking } from "@/lib/bookings";
import type { OrderStatus } from "@/lib/orders";
import { adminFetch } from "@/lib/admin-client";
import styles from "./OrdersPanel.module.css";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  fulfilled: "Done",
  cancelled: "Cancelled",
};

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const res = await adminFetch("/api/admin/bookings");
      setBookings(await res.json());
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
      const res = await adminFetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      load();
    } catch {
      setError("Couldn't update that booking — try again.");
    }
  };

  if (bookings === null) return <p className={styles.hint}>Loading…</p>;
  if (bookings.length === 0) return <p className={styles.hint}>No service bookings yet.</p>;

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? bookings
    : bookings.filter((b) =>
        [b.id, b.customer.name, b.customer.phone, b.customer.cycle, b.customer.note, b.service.title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );

  return (
    <div className={styles.list}>
      <div className={styles.toolbar}>
        <p className={styles.count}>
          {bookings.length} booking{bookings.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by booking ID, name, phone or service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search bookings"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {filtered.length === 0 && <p className={styles.hint}>No bookings match &quot;{search}&quot;.</p>}
      {filtered.map((b) => (
        <div className={styles.card} key={b.id}>
          <div className={styles.top}>
            <div>
              <p className={styles.id}>{b.id}</p>
              <p className={styles.date}>{new Date(b.createdAt).toLocaleString("en-IN")}</p>
            </div>
            <select
              className={styles[`status_${b.status}`] ?? styles.status}
              value={b.status}
              onChange={(e) => setStatus(b.id, e.target.value as OrderStatus)}
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.customer}>
            <p className={styles.customerName}>{b.customer.name}</p>
            <a className={styles.customerPhone} href={`tel:${b.customer.phone}`}>
              {b.customer.phone}
            </a>
            {b.customer.address && <p className={styles.customerAddress}>{b.customer.address}</p>}
            {b.customer.cycle && <p className={styles.customerNote}>Cycle: {b.customer.cycle}</p>}
            {b.customer.date && <p className={styles.customerNote}>Preferred date: {b.customer.date}</p>}
            {b.customer.note && <p className={styles.customerNote}>Note: {b.customer.note}</p>}
          </div>

          <div className={styles.total}>
            <span>{b.service.title}</span>
            <span>₹{b.service.price.toLocaleString("en-IN")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
