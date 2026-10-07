"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { customerApi, useCustomer, type PublicCustomer } from "@/lib/customer";
import { loadProducts } from "@/lib/catalogue";
import type { Product } from "@/lib/products";
import WishlistButton from "@/components/account/WishlistButton";
import styles from "./account.module.css";

type Tab = "wishlist" | "orders" | "settings";

type MyOrder = {
  id: string;
  status: "new" | "contacted" | "fulfilled" | "cancelled";
  createdAt: string;
  total: number;
  items: { brand: string; model: string; color?: string; size?: string; type?: string; price: number | null; qty: number }[];
};
type MyService = {
  id: string;
  status: "new" | "contacted" | "fulfilled" | "cancelled";
  createdAt: string;
  service: { title: string; price: number };
  date?: string;
};

/* the shop's internal statuses, in the customer's words */
const STATUS_TEXT: Record<MyOrder["status"], string> = {
  new: "Received",
  contacted: "Confirmed by phone",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const priceText = (p: Product) =>
  p.price === null ? "Ask for price" : `${p.variants && p.variants.length > 1 ? "from " : ""}₹${p.price.toLocaleString("en-IN")}`;

export default function AccountView() {
  const { ready, customer, openAuth, signOut, setCustomer, wishlist } = useCustomer();
  const [tab, setTab] = useState<Tab>("wishlist");
  const [products, setProducts] = useState<Product[] | null>(null);

  // open on the Settings tab when the link says so (#settings)
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash;
      setTab(h === "#settings" ? "settings" : h === "#orders" ? "orders" : "wishlist");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    loadProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  // orders and service requests placed while signed in
  const [mine, setMine] = useState<{ orders: MyOrder[]; services: MyService[] } | null>(null);
  const [mineFailed, setMineFailed] = useState(false);
  const signedIn = !!customer;
  useEffect(() => {
    if (!signedIn || tab !== "orders") return;
    let alive = true;
    customerApi<{ orders?: MyOrder[]; services?: MyService[] }>("/api/customer/orders")
      .then((r) => {
        if (!alive) return;
        if (r.ok) setMine({ orders: r.data.orders ?? [], services: r.data.services ?? [] });
        else setMineFailed(true);
      })
      .catch(() => alive && setMineFailed(true));
    return () => {
      alive = false;
    };
  }, [signedIn, tab]);

  // saved cycles, newest first; a cycle the shop has since removed is simply left out
  const saved = useMemo(() => {
    if (!customer || !products) return null;
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return customer.wishlist.map((slug) => bySlug.get(slug)).filter((p): p is Product => !!p);
  }, [customer, products]);

  if (!ready) return <div className={styles.skeleton} aria-busy="true" aria-label="Loading your account" />;

  if (!customer) {
    return (
      <section className={styles.gate}>
        <span className={styles.gateIcon} aria-hidden="true">
          ♥
        </span>
        <h1>Your wishlist lives here</h1>
        <p>Sign in or create a free account to save the cycles you love and find them again on any device.</p>
        <div className={styles.gateBtns}>
          <button type="button" className={styles.primary} onClick={() => openAuth({ mode: "signin" })}>
            Sign in
          </button>
          <button type="button" className={styles.ghost} onClick={() => openAuth({ mode: "signup" })}>
            Create account
          </button>
        </div>
      </section>
    );
  }

  const first = customer.name.split(" ")[0];

  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>My account</p>
          <h1>Hi, {first}</h1>
          <p className={styles.email}>{customer.email}</p>
        </div>
        <button type="button" className={styles.ghost} onClick={() => void signOut()}>
          Sign out
        </button>
      </section>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "wishlist"}
          className={tab === "wishlist" ? styles.tabOn : styles.tab}
          onClick={() => {
            setTab("wishlist");
            history.replaceState(null, "", "/account");
          }}
        >
          Wishlist <span>{saved ? saved.length : wishlist.size}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "orders"}
          className={tab === "orders" ? styles.tabOn : styles.tab}
          onClick={() => {
            setTab("orders");
            history.replaceState(null, "", "/account#orders");
          }}
        >
          My orders {mine && mine.orders.length + mine.services.length > 0 && <span>{mine.orders.length + mine.services.length}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "settings"}
          className={tab === "settings" ? styles.tabOn : styles.tab}
          onClick={() => {
            setTab("settings");
            history.replaceState(null, "", "/account#settings");
          }}
        >
          Settings
        </button>
      </div>

      {tab === "orders" ? (
        <OrdersList mine={mine} failed={mineFailed} />
      ) : tab === "wishlist" ? (
        <section aria-label="Your wishlist" id="wishlist">
          {!saved ? (
            <div className={styles.skeleton} aria-busy="true" />
          ) : saved.length === 0 ? (
            <div className={styles.empty}>
              <span aria-hidden="true">♡</span>
              <h2>Nothing saved yet</h2>
              <p>Tap the heart on any cycle in the shop and it will show up here.</p>
              <Link href="/#shop" className={styles.primary}>
                Browse cycles
              </Link>
            </div>
          ) : (
            <ul className={styles.grid}>
              {saved.map((p) => (
                <li key={p.slug} className={styles.card}>
                  <div className={styles.photo}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={`${p.brand} ${p.model}`} loading="lazy" decoding="async" />
                    <WishlistButton slug={p.slug} name={`${p.brand} ${p.model}`} />
                    {!p.inStock && <span className={styles.out}>Out of stock</span>}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.brand}>
                      {p.brand}
                      {p.sizes ? ` · ${p.sizes}` : ""}
                    </p>
                    <h3>{p.model}</h3>
                    <p className={styles.price}>{priceText(p)}</p>
                    <Link href={`/?product=${encodeURIComponent(p.slug)}#shop`} className={styles.view}>
                      View &amp; add to cart
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <Settings customer={customer} onRenamed={setCustomer} onDeleted={() => setCustomer(null)} />
      )}
    </>
  );
}

/* ---------------- settings: name, password, delete ---------------- */

type Notice = { kind: "ok" | "error"; text: string } | null;

function Settings({
  customer,
  onRenamed,
  onDeleted,
}: {
  customer: PublicCustomer;
  onRenamed: (c: PublicCustomer) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(customer.name);
  const [nameNote, setNameNote] = useState<Notice>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwNote, setPwNote] = useState<Notice>(null);
  const [delPw, setDelPw] = useState("");
  const [delNote, setDelNote] = useState<Notice>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState("");

  const post = useCallback(
    async <T,>(url: string, method: string, body: unknown) =>
      customerApi<T & { error?: string }>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => null),
    []
  );

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("name");
    setNameNote(null);
    const r = await post<{ customer?: PublicCustomer }>("/api/customer/profile", "PATCH", { name });
    setBusy("");
    if (r?.ok && r.data.customer) {
      onRenamed(r.data.customer);
      setNameNote({ kind: "ok", text: "Name updated." });
    } else setNameNote({ kind: "error", text: r?.data.error ?? "We couldn't save that. Please try again." });
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("pw");
    setPwNote(null);
    const r = await post<object>("/api/customer/password", "POST", { current, next });
    setBusy("");
    if (r?.ok) {
      setCurrent("");
      setNext("");
      setPwNote({ kind: "ok", text: "Password changed. Other devices have been signed out." });
    } else setPwNote({ kind: "error", text: r?.data.error ?? "We couldn't change your password. Please try again." });
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("del");
    setDelNote(null);
    const r = await post<object>("/api/customer/profile", "DELETE", { password: delPw });
    setBusy("");
    if (r?.ok) onDeleted();
    else setDelNote({ kind: "error", text: r?.data.error ?? "We couldn't delete your account. Please try again." });
  };

  return (
    <section className={styles.settings} aria-label="Account settings" id="settings">
      <form className={styles.panel} onSubmit={saveName}>
        <h2>Your details</h2>
        <label className={styles.field}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
        </label>
        <label className={styles.field}>
          Email
          <input value={customer.email} disabled readOnly />
        </label>
        {nameNote && <p className={nameNote.kind === "ok" ? styles.ok : styles.err} role="status">{nameNote.text}</p>}
        <button className={styles.primary} disabled={busy === "name" || name.trim().length < 2 || name.trim() === customer.name}>
          {busy === "name" ? "Saving…" : "Save name"}
        </button>
      </form>

      <form className={styles.panel} onSubmit={savePassword}>
        <h2>Change password</h2>
        <label className={styles.field}>
          Current password
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" maxLength={128} />
        </label>
        <label className={styles.field}>
          New password
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" maxLength={128} placeholder="At least 8 characters" />
        </label>
        {pwNote && <p className={pwNote.kind === "ok" ? styles.ok : styles.err} role="status">{pwNote.text}</p>}
        <button className={styles.primary} disabled={busy === "pw" || !current || next.length < 8}>
          {busy === "pw" ? "Saving…" : "Change password"}
        </button>
      </form>

      <form className={`${styles.panel} ${styles.danger}`} onSubmit={deleteAccount}>
        <h2>Delete account</h2>
        <p className={styles.muted}>
          This permanently removes your account and wishlist. Orders you have already placed with the shop are not affected.
        </p>
        {!confirmDelete ? (
          <button type="button" className={styles.dangerBtn} onClick={() => setConfirmDelete(true)}>
            Delete my account…
          </button>
        ) : (
          <>
            <label className={styles.field}>
              Enter your password to confirm
              <input type="password" value={delPw} onChange={(e) => setDelPw(e.target.value)} autoComplete="current-password" maxLength={128} />
            </label>
            {delNote && <p className={styles.err} role="alert">{delNote.text}</p>}
            <div className={styles.row}>
              <button className={styles.dangerBtn} disabled={busy === "del" || !delPw}>
                {busy === "del" ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button type="button" className={styles.ghost} onClick={() => { setConfirmDelete(false); setDelPw(""); setDelNote(null); }}>
                Keep my account
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}

/* ---------------- my orders ---------------- */

function OrdersList({ mine, failed }: { mine: { orders: MyOrder[]; services: MyService[] } | null; failed: boolean }) {
  if (failed) {
    return (
      <div className={styles.empty}>
        <h2>We couldn&apos;t load your orders</h2>
        <p>Please refresh the page and try again.</p>
      </div>
    );
  }
  if (!mine) return <div className={styles.skeleton} aria-busy="true" />;
  if (mine.orders.length === 0 && mine.services.length === 0) {
    return (
      <div className={styles.empty}>
        <span aria-hidden="true">🛒</span>
        <h2>No orders yet</h2>
        <p>Orders and service requests you place while signed in will appear here, with their latest status.</p>
        <Link href="/#shop" className={styles.primary}>
          Browse cycles
        </Link>
      </div>
    );
  }

  return (
    <section aria-label="Your orders" id="orders" className={styles.orders}>
      {mine.orders.map((o) => (
        <article key={o.id} className={styles.order}>
          <header>
            <div>
              <b>Order {o.id}</b>
              <small>{when(o.createdAt)}</small>
            </div>
            <span className={`${styles.status} ${styles[`s_${o.status}`]}`}>{STATUS_TEXT[o.status]}</span>
          </header>
          <ul>
            {o.items.map((i, n) => {
              const opts = [i.color, i.size, i.type].filter(Boolean).join(" · ");
              return (
                <li key={n}>
                  <span>
                    {i.brand} {i.model}
                    {opts ? <small> {opts}</small> : null} <em>× {i.qty}</em>
                  </span>
                  <span>{i.price === null ? "—" : `₹${(i.price * i.qty).toLocaleString("en-IN")}`}</span>
                </li>
              );
            })}
          </ul>
          <footer>
            <span>Total (pay in person)</span>
            <b>₹{o.total.toLocaleString("en-IN")}</b>
          </footer>
        </article>
      ))}

      {mine.services.length > 0 && <h2 className={styles.subhead}>Service requests</h2>}
      {mine.services.map((s) => (
        <article key={s.id} className={styles.order}>
          <header>
            <div>
              <b>{s.service.title}</b>
              <small>
                {s.id} · {when(s.createdAt)}
                {s.date ? ` · preferred ${s.date}` : ""}
              </small>
            </div>
            <span className={`${styles.status} ${styles[`s_${s.status}`]}`}>{STATUS_TEXT[s.status]}</span>
          </header>
          <footer>
            <span>Service price</span>
            <b>₹{s.service.price.toLocaleString("en-IN")}</b>
          </footer>
        </article>
      ))}
    </section>
  );
}
