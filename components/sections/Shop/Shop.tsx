"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_META } from "@/data/products-seed";
import type { Product, ProductCategory } from "@/lib/products";
import { useCart } from "@/lib/cart";
import StarRating from "@/components/ui/StarRating";
import ProductModal from "@/components/shop/ProductModal";
import ColorSwatches from "@/components/shop/ColorSwatches";
import { discountPct, needsOptions, selectOption, shownFor, type Selection, type Shown } from "@/lib/variants";
import styles from "./Shop.module.css";
import { useLang } from "@/lib/i18n";

/* The 5 brands behind the models above — real, from the shop's own supplier
   catalogues (content/catalogues/). */
const BRANDS = [
  { name: "Neufman", note: "Mountain cycles — TIG-welded frames, disc brakes.", logo: "/images/logo/NeufmanLogo.png" },
  { name: "Denvok", note: "City, hybrid and kids' cycles for everyday riding.", logo: "/images/logo/denvoklogo.png" },
  { name: "Schnell", note: "MTB, hybrid and road cycles for serious riders.", logo: "/images/logo/schnelllogo.png" },
  { name: "Keysto", note: "MTB, women's and kids' cycles, wide range.", logo: "/images/logo/keystologo.png" },
  // confirmed against Oyekid's own 2026 product catalogue cover
  // (content/catalogues/Catalog 2026.pdf) — this circular mark is genuinely theirs
  { name: "Oyekid", note: "Dedicated kids' cycles, sized to grow with your child.", logo: "/images/logo/oyekidlogo.png" },
  // wordmark from herocycles.com (white on black tile)
  { name: "Hero", note: "Everyday, kids' and sports cycles from a household name.", logo: "/images/logo/herologo.svg" },
  // logo from hercules.in (white wordmark on a dark tile)
  { name: "Hercules", note: "Hercules & Roadeo MTBs, geared and single-speed, plus e-bikes.", logo: "/images/logo/herculeslogo.svg" },
  // logo from radiantcpl.com
  { name: "Radiant", note: "Kids' and teens' cycles, plus first tricycles for toddlers.", logo: "/images/logo/radiantlogo.png" },
  // crest from bsa.in
  { name: "BSA", note: "Kids' cycles, Ladybird bikes for girls, and e-bikes.", logo: "/images/logo/bsalogo.png" },
];

/* Oyekid's own shop-by-age menu (oyekidbikes.com) — `group` on each Oyekid
   product is the wheel size / balance-bike key on the left. */
const OYEKID_GROUPS = [
  { id: "Balance Bike", label: "Balance Bike" },
  { id: "12T", label: "2-3 Years (12T)" },
  { id: "14T", label: "3-5 Years (14T)" },
  { id: "16T", label: "5-7 Years (16T)" },
  { id: "20T", label: "7-9 Years (20T)" },
  { id: "24T", label: "10-15 Years (24T)" },
  { id: "26T", label: "15+ Years (26T)" },
];

/* Neufman's own range types (neufman.com categories) — `group` on each
   Neufman product. */
const NEUFMAN_GROUPS = [
  { id: "E-Bikes", label: "E-Bikes" },
  { id: "Mountain", label: "Mountain" },
  { id: "Women's", label: "Women's" },
  { id: "Kids", label: "Kids" },
];
/* Schnell's range types (trinitycyclesindia.com categories). Ids are prefixed so
   they can never collide with another brand's groups. */
const SCHNELL_GROUPS = [
  { id: "Schnell MTB", label: "MTB" },
  { id: "Schnell Hybrid", label: "Hybrid" },
  { id: "Schnell Road", label: "Road" },
  { id: "Schnell Kids", label: "Kids" },
  { id: "Schnell E-Bike", label: "E-Bike" },
];
/* Hero's range types (herocycles.com). Ids are prefixed so they can never collide. */
const HERO_GROUPS = [
  { id: "Hero Kids", label: "Kids" },
  { id: "Hero Junior", label: "Junior" },
  { id: "Hero MTB", label: "MTB" },
];
/* Keysto's range types (trinitycyclesindia.com categories). */
const KEYSTO_GROUPS = [
  { id: "Keysto MTB", label: "MTB" },
  { id: "Keysto ATB", label: "ATB" },
  { id: "Keysto Women", label: "Women" },
  { id: "Keysto Hybrid", label: "Hybrid" },
  { id: "Keysto Kids", label: "Kids" },
];
/* Hercules' ranges (hercules.in). */
const HERCULES_GROUPS = [
  { id: "Hercules MTB", label: "MTB" },
  { id: "Hercules Roadeo", label: "Roadeo" },
  { id: "Hercules E-Bike", label: "E-Bike" },
];
/* Radiant's ranges (radiantcpl.com). */
const RADIANT_GROUPS = [
  { id: "Radiant Kids", label: "Kids" },
  { id: "Radiant Teen", label: "Teens" },
  { id: "Radiant Adult", label: "Adults" },
];
/* BSA's ranges (bsa.in). */
const BSA_GROUPS = [
  { id: "BSA Kids", label: "Kids" },
  { id: "BSA Ladybird", label: "Ladybird" },
  { id: "BSA E-Bike", label: "E-Bike" },
];
const ALL_GROUPS = [
  ...OYEKID_GROUPS,
  ...NEUFMAN_GROUPS,
  ...SCHNELL_GROUPS,
  ...HERO_GROUPS,
  ...KEYSTO_GROUPS,
  ...HERCULES_GROUPS,
  ...RADIANT_GROUPS,
  ...BSA_GROUPS,
];
const GROUPS_BY_TAB = {
  oyekid: OYEKID_GROUPS,
  neufman: NEUFMAN_GROUPS,
  schnell: SCHNELL_GROUPS,
  hero: HERO_GROUPS,
  keysto: KEYSTO_GROUPS,
  hercules: HERCULES_GROUPS,
  radiant: RADIANT_GROUPS,
  bsa: BSA_GROUPS,
} as const;

const BROWSE_TABS = [
  { id: "oyekid", name: "Oyekid", hint: "Shop by age", logo: "/images/logo/oyekidlogo.png" },
  { id: "neufman", name: "Neufman", hint: "Shop by type", logo: "/images/logo/NeufmanLogo.png" },
  { id: "schnell", name: "Schnell", hint: "Shop by type", logo: "/images/logo/schnelllogo.png" },
  { id: "hero", name: "Hero", hint: "Shop by type", logo: "/images/logo/herologo.svg" },
  { id: "keysto", name: "Keysto", hint: "Shop by type", logo: "/images/logo/keystologo.png" },
  { id: "hercules", name: "Hercules", hint: "Shop by type", logo: "/images/logo/herculeslogo.svg" },
  { id: "radiant", name: "Radiant", hint: "Shop by type", logo: "/images/logo/radiantlogo.png" },
  { id: "bsa", name: "BSA", hint: "Shop by type", logo: "/images/logo/bsalogo.png" },
] as const;

/* "Featured" order: the first screen of the shop is what draws people in, so it leads with
   a hand-picked spread of Oyekid cycles (clean studio photos, real colour options, visible
   discounts) across the age groups, then the rest of Oyekid, then the other brands that
   have full catalogue photos, then everything else. */
const FEATURED_SLUGS = [
  "oyekid-wildhop-12t",
  "oyekid-mermaid-14t",
  "oyekid-shark-tank-14t-ibc",
  "oyekid-slayer-16t",
  "oyekid-emma-16t",
  "oyekid-yuvaa-20t-ibc-suspension",
  "oyekid-vangers-20t-ibc",
  "oyekid-balance-bike-magwheel",
];
const featuredRank = (p: Product) => {
  const i = FEATURED_SLUGS.indexOf(p.slug);
  if (i >= 0) return i;
  if (p.brand === "Oyekid") return 100;
  if (p.variants?.length) return 200;
  return 300;
};

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

/* the home page shows a preview so a big catalogue doesn't turn into an
   endless scroll — "See All Cycles" reveals the rest in place */
const PAGE_SIZE = 8;

const CIRCLES: { id: "all" | ProductCategory; label: string; image: string }[] = [
  { id: "all", label: "All Cycles", image: "/images/hero-cycle.jpg" },
  ...CATEGORY_META.map((c) => ({ id: c.id as ProductCategory, label: c.label, image: c.circleImage })),
];

function BikeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M5.5 17.5 11 8h4l3.5 9.5" />
        <path d="M11 8 9 12.5 5.5 17.5" />
        <path d="M9 12.5h5.5" />
        <path d="M11 8l1.3-2h2.2" />
      </g>
    </svg>
  );
}

/* Loader icon — a colourful cartoon bicycle whose wheels actually spin
   (each wheel is its own group so it can carry its own CSS rotation; the
   frame stays still, same as a wheel spinning under a parked cycle). */
function SpinningBikeGlyph() {
  const wheel = (cx: number, hub: string) => (
    <g className={styles.wheel} style={{ transformOrigin: `${cx}px 50px` }}>
      <ellipse cx={cx} cy="74" rx="20" ry="4" fill="#000" opacity="0.12" />
      <circle cx={cx} cy="50" r="22" fill="#FFD41F" stroke="#1F3350" strokeWidth="2.5" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1={cx - 18 * Math.cos((deg * Math.PI) / 180)}
          y1={50 - 18 * Math.sin((deg * Math.PI) / 180)}
          x2={cx + 18 * Math.cos((deg * Math.PI) / 180)}
          y2={50 + 18 * Math.sin((deg * Math.PI) / 180)}
          stroke="#1F3350"
          strokeWidth="2"
        />
      ))}
      <circle cx={cx} cy="50" r="4.5" fill={hub} />
    </g>
  );

  return (
    <svg viewBox="0 0 120 80" width="64" height="46" aria-hidden="true">
      {wheel(24, "#4FC3E8")}
      {wheel(96, "#E8344F")}
      {/* static frame, seat, handlebar, pedal crank and flag — sits above
          the wheels so it reads as "attached" while they spin beneath it */}
      <g fill="none" stroke="#1F3350" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 50 L58 18 L96 50" />
        <path d="M58 18 L60 50" />
        <path d="M60 50 L96 50" />
        <path d="M80 22 L96 50" />
        <path d="M74 22 L86 22" />
      </g>
      <rect x="50" y="12" width="16" height="6" rx="3" fill="#101820" />
      <path d="M62 16 L72 8 L67 14 Z" fill="#FF4D7D" />
      <circle cx="60" cy="50" r="5" fill="#1F3350" />
    </svg>
  );
}

/* tiny inline icon set for the filter sidebar — no external icon library */
const Icon = {
  sliders: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h10M18 6h2M4 12h2M8 12h12M4 18h14M20 18h0" />
      <circle cx="16" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  bike: <BikeGlyph />,
  target: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
      <path d="M10 1.5l2.47 5.5 5.98.55-4.53 4.02 1.37 5.93L10 14.77l-5.29 2.73 1.37-5.93L1.55 7.55l5.98-.55z" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M3 8l9-5 9 5-9 5-9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
};

function FilterSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.section}>
      <button type="button" className={styles.sectionHead} onClick={() => setOpen((o) => !o)}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.chevron}>{open ? "▴" : "▾"}</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

export default function Shop() {
  const { t } = useLang();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [browseTab, setBrowseTab] = useState<"oyekid" | "neufman" | "schnell" | "hero" | "keysto" | "hercules" | "radiant" | "bsa">("oyekid");
  /* phones: the filter panel is tucked behind a button instead of pushing the
     cycles ~1500px down the page */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [picked, setPicked] = useState<Record<string, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAll, setShowAll] = useState(false);
  const circlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- brief "curating" loader whenever the category changes
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(id);
  }, [selectedCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new filter/search/sort result starts back at the compact preview
    setShowAll(false);
  }, [selectedCategories, selectedGroups, minPrice, maxPrice, minRating, inStockOnly, query, sort]);

  const scrollCircles = (dir: 1 | -1) => circlesRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });

  const showBrand = (name: string) => {
    setSelectedCategories((prev) => (prev.length ? [] : prev));
    setSelectedGroups([]);
    setQuery(name);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCategory = (c: ProductCategory) => {
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  /** open the popup with the card's current colour / size / setup preselected */
  const openWithOptions = (item: Product, shown: Shown) => {
    setPicked((prev) => ({ ...prev, [item.slug]: { color: shown.color, size: shown.size, type: shown.type } }));
    setSelectedProduct(item);
  };

  const toggleGroup = (g: string) => {
    setSelectedGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products;
    if (selectedCategories.length) list = list.filter((p) => selectedCategories.includes(p.category));
    if (selectedGroups.length) list = list.filter((p) => p.group !== undefined && selectedGroups.includes(p.group));
    if (minPrice) list = list.filter((p) => p.price !== null && p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price !== null && p.price <= Number(maxPrice));
    if (minRating) list = list.filter((p) => p.rating >= minRating);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.model.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sizes.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sort === "price-desc") sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else sorted.sort((a, b) => featuredRank(a) - featuredRank(b)); // "featured" — stable, so ties keep catalogue order
    return sorted;
  }, [products, selectedCategories, selectedGroups, minPrice, maxPrice, minRating, inStockOnly, query, sort]);

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
  const remaining = filtered.length - visible.length;

  const activeFilterCount =
    selectedCategories.length + selectedGroups.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (minRating ? 1 : 0) + (inStockOnly ? 1 : 0) + (query ? 1 : 0);
  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedGroups([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setInStockOnly(false);
    setQuery("");
  };

  return (
    <section className={styles.shop}>
      <div className={styles.wrap}>
        {/* ---------- circular category selector ---------- */}
        <div className={styles.circlesRow}>
          <button type="button" className={styles.circleNav} aria-label="Scroll categories left" onClick={() => scrollCircles(-1)}>
            ‹
          </button>
          <div className={styles.circles} ref={circlesRef} role="tablist" aria-label="Categories">
            {CIRCLES.map((c) => {
              const on = c.id === "all" ? selectedCategories.length === 0 : selectedCategories.length === 1 && selectedCategories[0] === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={styles.circleItem}
                  onClick={() => setSelectedCategories(c.id === "all" ? [] : [c.id])}
                >
                  <span className={`${styles.circlePhoto} ${on ? styles.circleOn : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" loading="lazy" />
                  </span>
                  <span className={on ? styles.circleLabelOn : styles.circleLabel}>{c.label}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className={styles.circleNav} aria-label="Scroll categories right" onClick={() => scrollCircles(1)}>
            ›
          </button>
        </div>

        {loading || !products ? (
          <div className={styles.loader}>
            <span className={styles.loaderIcon}>
              <SpinningBikeGlyph />
            </span>
            <p>{t("shop.loading")}</p>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* ---------- sidebar filters ---------- */}
            <button
              type="button"
              className={styles.filterToggle}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <span className={styles.sidebarHeadIcon}>{Icon.sliders}</span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              <span className={styles.filterToggleChevron}>{filtersOpen ? "▴" : "▾"}</span>
            </button>
            <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ""}`}>
              <div className={styles.sidebarHead}>
                <h2>
                  <span className={styles.sidebarHeadIcon}>{Icon.sliders}</span> Filters
                </h2>
                <button onClick={clearAll} className={styles.clearAll}>
                  Clear all
                </button>
              </div>

              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>⌕</span>
                <input
                  className={styles.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search filters…"
                />
              </div>

              <FilterSection icon={Icon.bike} title="Categories">
                <ul className={styles.checkList}>
                  {CATEGORY_META.map((c) => (
                    <li key={c.id}>
                      <label className={styles.checkRow}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(c.id)}
                          onChange={() => toggleCategory(c.id)}
                        />
                        {c.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Oyekid · Shop by Age">
                <ul className={styles.checkList}>
                  {OYEKID_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Neufman · Shop by Type">
                <ul className={styles.checkList}>
                  {NEUFMAN_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Schnell · Shop by Type">
                <ul className={styles.checkList}>
                  {SCHNELL_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Hero · Shop by Type">
                <ul className={styles.checkList}>
                  {HERO_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Keysto · Shop by Type">
                <ul className={styles.checkList}>
                  {KEYSTO_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Hercules · Shop by Type">
                <ul className={styles.checkList}>
                  {HERCULES_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="Radiant · Shop by Type">
                <ul className={styles.checkList}>
                  {RADIANT_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.bike} title="BSA · Shop by Type">
                <ul className={styles.checkList}>
                  {BSA_GROUPS.map((g) => {
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <li key={g.id}>
                        <label className={styles.checkRow}>
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                          {g.label} <span className={styles.andUp}>({n})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.target} title="Price Range">
                <div className={styles.priceRow}>
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <span>–</span>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>
              </FilterSection>

              <FilterSection icon={Icon.star} title="Rating">
                <ul className={styles.ratingList}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <li key={n}>
                      <label className={styles.checkRow}>
                        <input type="radio" name="minRating" checked={minRating === n} onChange={() => setMinRating(n)} />
                        <StarRating value={n} /> <span className={styles.andUp}>&amp; up</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </FilterSection>

              <FilterSection icon={Icon.box} title="Availability">
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  In Stock Only
                </label>
              </FilterSection>
            </aside>

            {/* ---------- results ---------- */}
            <div className={styles.results}>
              <div className={styles.browse}>
                <div className={styles.browseTabs} role="tablist" aria-label="Browse by brand">
                  {BROWSE_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={browseTab === t.id}
                      className={browseTab === t.id ? styles.browseTabOn : styles.browseTab}
                      onClick={() => setBrowseTab(t.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.logo} alt="" className={styles.browseTabLogo} />
                      <span>
                        <span className={styles.browseTabName}>{t.name}</span>
                        <span className={styles.browseTabHint}>{t.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className={styles.browsePills} role="group" aria-label={browseTab === "oyekid" ? "Oyekid by age" : `${BROWSE_TABS.find((t) => t.id === browseTab)?.name ?? ""} by type`}>
                  <button
                    type="button"
                    aria-pressed={selectedGroups.length === 0}
                    className={selectedGroups.length === 0 ? styles.pillOn : styles.pill}
                    onClick={() => setSelectedGroups([])}
                  >
                    All cycles
                  </button>
                  {GROUPS_BY_TAB[browseTab].map((g) => {
                    const on = selectedGroups.length === 1 && selectedGroups[0] === g.id;
                    const n = products.filter((p) => p.group === g.id).length;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        aria-pressed={on}
                        className={on ? styles.pillOn : styles.pill}
                        onClick={() => setSelectedGroups(on ? [] : [g.id])}
                      >
                        {g.label}
                        <span className={styles.pillCount}>{n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.resultsBar}>
                <p className={styles.count}>{filtered.length} cycles</p>
                <div className={styles.resultsActions}>
                  <select className={styles.sort} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                  <div className={styles.viewToggle}>
                    <button
                      className={view === "grid" ? styles.viewOn : styles.viewOff}
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                    >
                      ▦
                    </button>
                    <button
                      className={view === "list" ? styles.viewOn : styles.viewOff}
                      onClick={() => setView("list")}
                      aria-label="List view"
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className={styles.chips}>
                  {selectedCategories.map((c) => (
                    <span className={styles.chip} key={c}>
                      {CATEGORY_META.find((m) => m.id === c)?.label}{" "}
                      <button onClick={() => toggleCategory(c)}>×</button>
                    </span>
                  ))}
                  {selectedGroups.map((g) => (
                    <span className={styles.chip} key={g}>
                      {ALL_GROUPS.find((m) => m.id === g)?.label ?? g} <button onClick={() => toggleGroup(g)}>×</button>
                    </span>
                  ))}
                  {query && (
                    <span className={styles.chip}>
                      &quot;{query}&quot; <button onClick={() => setQuery("")}>×</button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className={styles.chip}>
                      ₹{minPrice || 0} – ₹{maxPrice || "∞"}{" "}
                      <button
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {minRating > 0 && (
                    <span className={styles.chip}>
                      {minRating}★ &amp; up <button onClick={() => setMinRating(0)}>×</button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className={styles.chip}>
                      In stock <button onClick={() => setInStockOnly(false)}>×</button>
                    </span>
                  )}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyTitle}>No cycles match these filters</p>
                  <p className={styles.emptySub}>Try clearing a filter or widening the price range.</p>
                  <button className={styles.emptyClear} onClick={clearAll}>
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className={view === "grid" ? styles.grid : styles.list}>
                  {visible.map((item) => {
                    const shown = shownFor(item, picked[item.slug]);
                    const off = discountPct(shown.price, shown.regularPrice);
                    const multi = needsOptions(item);
                    return (
                    <article className={view === "grid" ? styles.card : styles.cardList} key={item.slug}>
                      <div className={styles.cardPhoto}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shown.image} alt={`${item.brand} ${item.model}${shown.color ? ` – ${shown.color}` : ""}`} loading="lazy" />
                        <span className={shown.inStock ? styles.stockBadge : styles.stockBadgeOut}>
                          {shown.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <div className={styles.cardBody}>
                        <p className={styles.brand}>
                          {item.brand} · {item.sizes}
                        </p>
                        <h4 className={styles.model}>{item.model}</h4>
                        {item.rating > 0 && (
                          <div className={styles.rating}>
                            <StarRating value={item.rating} />
                          </div>
                        )}
                        {item.variants && item.variants.length > 0 && (
                          <div className={styles.cardColors}>
                            <ColorSwatches
                              size="sm"
                              variants={[...new Map(item.variants.map((v) => [v.color, v])).values()]}
                              selected={shown.color}
                              onSelect={(c) =>
                                setPicked((prev) => ({
                                  ...prev,
                                  [item.slug]: selectOption(
                                    item,
                                    { color: shown.color, size: shown.size, type: shown.type },
                                    "color",
                                    c
                                  ),
                                }))
                              }
                            />
                            <span className={styles.colorName}>{shown.color}</span>
                          </div>
                        )}
                        {shown.photoOf && <p className={styles.photoNote}>Photo shown: {shown.photoOf}</p>}
                        {multi && (
                          <p className={styles.optionLine}>{[shown.size, shown.type].filter(Boolean).join(" · ")}</p>
                        )}
                        <div className={styles.foot}>
                          <span className={shown.price === null ? styles.priceTbc : styles.price}>
                            {shown.price === null ? (
                              t("shop.addPrice")
                            ) : (
                              <>
                                ₹{shown.price.toLocaleString("en-IN")}
                                {off > 0 && shown.regularPrice !== null && (
                                  <>
                                    <s className={styles.mrp}>₹{shown.regularPrice.toLocaleString("en-IN")}</s>
                                    <span className={styles.off}>{off}% off</span>
                                  </>
                                )}
                              </>
                            )}
                          </span>
                          <div className={multi ? styles.cardCtasMulti : styles.cardCtas}>
                            <button
                              className={styles.addBtnSmall}
                              disabled={!shown.inStock}
                              onClick={() =>
                                addToCart({
                                  slug: item.slug,
                                  color: shown.color,
                                  size: shown.size,
                                  type: shown.type,
                                  brand: item.brand,
                                  model: item.model,
                                  image: shown.image,
                                  price: shown.price,
                                })
                              }
                            >
                              Add to Cart
                            </button>
                            <button className={styles.viewBtn} onClick={() => openWithOptions(item, shown)}>
                              {multi ? "Select options" : "View"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}

              {remaining > 0 && (
                <div className={styles.seeAllWrap}>
                  <p className={styles.seeAllHint}>
                    {remaining} more cycle{remaining === 1 ? "" : "s"} waiting to be discovered
                  </p>
                  <button className={styles.seeAllBtn} onClick={() => setShowAll(true)}>
                    <span>Explore Full Collection</span>
                    <span className={styles.seeAllArrow} aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- brands we carry ---------- */}
        <div className={styles.brands}>
          <div className={styles.brandsHead}>
            <span className={styles.brandsPill}>Our Brands</span>
            <h3 className={styles.brandsTitle}>
              Brands We <em className={styles.brandsEm}>Carry</em>
            </h3>
            <p className={styles.brandsLede}>The makers behind every cycle in the shop.</p>
          </div>

          <div className={styles.brandsGrid}>
            {BRANDS.map((b) => {
              const n = products ? products.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length : null;
              return (
                <button type="button" className={styles.brandCard} key={b.name} onClick={() => showBrand(b.name)}>
                  <span className={styles.brandMark}>
                    {b.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.logo} alt="" className={styles.brandMarkImg} />
                    ) : (
                      b.name[0]
                    )}
                  </span>
                  <span className={styles.brandName}>{b.name}</span>
                  <span className={styles.brandNote}>{b.note}</span>
                  <span className={styles.brandFoot}>
                    <span className={styles.brandCount}>
                      {n === null ? " " : n === 0 ? "Coming soon" : `${n} model${n === 1 ? "" : "s"} in shop`}
                    </span>
                    <span className={styles.brandGo} aria-hidden="true">
                      View →
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} initialSelection={picked[selectedProduct.slug]} onClose={() => setSelectedProduct(null)} />}
    </section>
  );
}
