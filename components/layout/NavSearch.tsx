"use client";

/* Header search. Type a cycle, brand or size and a short list of matches drops down; pick one to open
   it in the shop, or press Enter to filter the whole shop to what you typed. The product list is the
   one the shop already uses (shared request), fetched the first time the box is focused. */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { loadProducts } from "@/lib/catalogue";
import { requestShopSearch } from "@/lib/shop-search";
import type { Product } from "@/lib/products";
import styles from "./Nav.module.css";

const MAX_RESULTS = 6;

function rank(products: Product[], raw: string): Product[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    const model = p.model.toLowerCase();
    const hay = `${p.brand} ${p.model} ${p.sizes} ${p.category}`.toLowerCase();
    if (!tokens.every((t) => hay.includes(t))) continue;
    let score = 0;
    if (model.startsWith(q)) score += 4;
    else if (model.includes(q)) score += 3;
    if (p.brand.toLowerCase().startsWith(tokens[0])) score += 1;
    if (p.inStock) score += 0.5;
    scored.push({ p, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS).map((s) => s.p);
}

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </g>
  </svg>
);

export default function NavSearch({
  variant,
  autoFocus = false,
  onDone,
}: {
  variant: "inline" | "panel";
  autoFocus?: boolean;
  /** called after a search is launched, so the parent can close the mobile panel */
  onDone?: () => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [products, setProducts] = useState<Product[] | null>(null);

  const load = () => {
    if (products) return;
    loadProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // close the list when you tap or click anywhere else
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const results = useMemo(() => (products ? rank(products, value) : []), [products, value]);
  const hasQuery = value.trim().length > 0;
  const showList = open && hasQuery;

  const finish = () => {
    setOpen(false);
    inputRef.current?.blur();
    onDone?.();
  };
  const searchAll = () => {
    const q = value.trim();
    if (!q) return;
    requestShopSearch({ query: q });
    finish();
  };
  const pick = (p: Product) => {
    requestShopSearch({ query: p.model, openSlug: p.slug });
    setValue("");
    finish();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) pick(results[active]);
      else searchAll();
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else onDone?.();
    }
  };

  return (
    <div ref={rootRef} className={variant === "inline" ? styles.searchInline : styles.searchPanelBox} role="search">
      <span className={styles.searchIcon} aria-hidden="true">
        <SearchGlyph />
      </span>
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className={styles.searchInput}
        placeholder="Search cycles, brands…"
        aria-label="Search cycles"
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          load();
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {value && (
        <button
          type="button"
          className={styles.searchClear}
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            setActive(-1);
            inputRef.current?.focus();
          }}
        >
          ×
        </button>
      )}

      {showList && (
        <div className={styles.searchResults} id={`${id}-list`} role="listbox">
          {!products ? (
            <p className={styles.searchEmpty}>Looking…</p>
          ) : results.length === 0 ? (
            <p className={styles.searchEmpty}>No cycles match “{value.trim()}”.</p>
          ) : (
            <>
              {results.map((p, i) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  key={p.slug}
                  className={`${styles.searchItem} ${i === active ? styles.searchItemOn : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(p)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" loading="lazy" decoding="async" />
                  <span className={styles.searchText}>
                    <b>{p.model}</b>
                    <small>
                      {p.brand}
                      {p.sizes ? ` · ${p.sizes}` : ""}
                    </small>
                  </span>
                  <span className={styles.searchPrice}>
                    {p.price === null ? "" : `${p.variants && p.variants.length > 1 ? "from " : ""}₹${p.price.toLocaleString("en-IN")}`}
                  </span>
                </button>
              ))}
              <button type="button" className={styles.searchAll} onClick={searchAll}>
                See all results for “{value.trim()}” →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
