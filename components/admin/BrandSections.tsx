"use client";

/* The admin's cycle list, split into one section per brand. A bar of brand chips on top jumps to
   a brand; each section can be opened or closed and has its own "+ Add" button, so with hundreds
   of cycles you go brand → cycle instead of scrolling one endless list. A brand section appears
   as soon as a cycle exists for it, so adding a cycle under a new brand name creates that
   brand's section by itself. */

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import styles from "./BrandSections.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  kids: "Kids' Cycles",
  mtb: "Mountain Cycles",
  hybrid: "City & Hybrid",
  ebike: "E-Bikes",
};

const LOGOS: Record<string, string> = {
  neufman: "/images/logo/NeufmanLogo.png",
  denvok: "/images/logo/denvoklogo.png",
  schnell: "/images/logo/schnelllogo.png",
  keysto: "/images/logo/keystologo.png",
  oyekid: "/images/logo/oyekidlogo.png",
  hero: "/images/logo/herologo.svg",
  hercules: "/images/logo/herculeslogo.svg",
  radiant: "/images/logo/radiantlogo.png",
  bsa: "/images/logo/bsalogo.png",
  kross: "/images/logo/krosslogo.png",
  allwyn: "/images/logo/allwynlogo.png",
  firefox: "/images/logo/firefoxlogo.png",
  corrado: "/images/logo/corradologo.png",
  gang: "/images/logo/ganglogo.png",
  avon: "/images/logo/avonlogo.png",
};

/* same order as the shop's brand tabs; anything else follows alphabetically */
const ORDER = ["oyekid", "neufman", "schnell", "hero", "keysto", "hercules", "radiant", "bsa", "kross", "allwyn", "firefox", "corrado", "gang", "avon", "denvok"];

const keyOf = (brand: string) => brand.trim().toLowerCase();
const anchorId = (key: string) => `brand-${key.replace(/[^a-z0-9]+/g, "-")}`;

type Group = { key: string; name: string; items: Product[] };

export default function BrandSections({
  products,
  searching,
  onEdit,
  onDelete,
  onAdd,
}: {
  products: Product[];
  /** a search is active: matching brands open by themselves */
  searching: boolean;
  onEdit: (p: Product) => void;
  onDelete: (slug: string) => void;
  /** open the add form; the brand is pre-filled ("" = a brand-new one) */
  onAdd: (brand: string) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();
    for (const p of products) {
      const key = keyOf(p.brand);
      const g = map.get(key) ?? { key, name: p.brand.trim(), items: [] };
      g.items.push(p);
      map.set(key, g);
    }
    return [...map.values()].sort((a, b) => {
      const ia = ORDER.indexOf(a.key);
      const ib = ORDER.indexOf(b.key);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  const isOpen = (key: string) => searching || open.has(key);
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const jump = (key: string) => {
    setOpen((prev) => new Set(prev).add(key));
    // wait a tick so the section has opened before scrolling to it
    setTimeout(() => document.getElementById(anchorId(key))?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  return (
    <div>
      <div className={styles.bar}>
        <div className={styles.chips} role="navigation" aria-label="Brands">
          {groups.map((g) => (
            <button type="button" key={g.key} className={isOpen(g.key) ? styles.chipOn : styles.chip} onClick={() => jump(g.key)}>
              <Logo name={g.name} keyName={g.key} size={22} />
              <span>{g.name}</span>
              <b>{g.items.length}</b>
            </button>
          ))}
          <button type="button" className={styles.chipNew} onClick={() => onAdd("")}>
            + New brand
          </button>
        </div>
        {!searching && (
          <div className={styles.bulk}>
            <button type="button" onClick={() => setOpen(new Set(groups.map((g) => g.key)))}>
              Expand all
            </button>
            <button type="button" onClick={() => setOpen(new Set())}>
              Collapse all
            </button>
          </div>
        )}
      </div>

      <div className={styles.sections}>
        {groups.map((g) => {
          const expanded = isOpen(g.key);
          const options = g.items.reduce((n, p) => n + (p.variants?.length ?? 0), 0);
          return (
            <section className={styles.section} key={g.key} id={anchorId(g.key)}>
              <div className={expanded ? styles.headOn : styles.head}>
                <button
                  type="button"
                  className={styles.headMain}
                  aria-expanded={expanded}
                  onClick={() => toggle(g.key)}
                >
                  <Logo name={g.name} keyName={g.key} size={40} />
                  <span className={styles.headText}>
                    <strong>{g.name}</strong>
                    <small>
                      {g.items.length} cycle{g.items.length === 1 ? "" : "s"}
                      {options > 0 ? ` · ${options} colour/size options` : ""}
                    </small>
                  </span>
                  <span className={styles.chev} aria-hidden="true">
                    {expanded ? "▴" : "▾"}
                  </span>
                </button>
                <button type="button" className={styles.addBtn} onClick={() => onAdd(g.name)}>
                  + Add {g.name} cycle
                </button>
              </div>

              {expanded && (
                <div className={styles.list}>
                  {g.items.map((p) => (
                    <div className={styles.row} key={p.slug}>
                      <div className={styles.rowPhoto}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" loading="lazy" />
                      </div>
                      <div className={styles.rowInfo}>
                        <p className={styles.rowModel}>{p.model}</p>
                        <p className={styles.rowMeta}>
                          {CATEGORY_LABEL[p.category]} · {p.sizes}
                          {p.variants?.length ? ` · ${p.variants.length} options` : ""}
                        </p>
                      </div>
                      <div className={styles.rowPrice}>
                        {p.price != null ? `${p.variants && p.variants.length > 1 ? "from " : ""}₹${p.price.toLocaleString("en-IN")}` : "Add: price"}
                      </div>
                      <div className={p.inStock ? styles.stockOk : styles.stockOut}>{p.inStock ? "In stock" : "Out of stock"}</div>
                      <div className={styles.rowActions}>
                        <button type="button" onClick={() => onEdit(p)}>
                          Edit
                        </button>
                        <button type="button" className={styles.delete} onClick={() => onDelete(p.slug)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Logo({ name, keyName, size }: { name: string; keyName: string; size: number }) {
  const src = LOGOS[keyName];
  return (
    <span className={styles.logo} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : (
        <i>{name.slice(0, 1).toUpperCase()}</i>
      )}
    </span>
  );
}
