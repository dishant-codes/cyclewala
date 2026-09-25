"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_META } from "@/data/products-seed";
import { useLang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { SHOP } from "@/lib/site";
import styles from "./Nav.module.css";

/* Nav sequence: Home, Categories (dropdown), Shop, About Us, Services,
   Contact — plain header, no scroll-jacking, no GSAP. The only JS here is
   the categories dropdown, the mobile drawer, and a lightweight "scrolled"
   shadow toggle. */
const LINKS = [
  { key: "nav.home", href: "#home" },
  { key: "nav.shop", href: "#shop" },
  { key: "nav.about", href: "#about" },
  { key: "nav.services", href: "#services" },
  { key: "nav.gallery", href: "#gallery" },
  { key: "nav.contact", href: "#contact" },
];

function BikeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

function TagGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 3.5H6a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .29.71l9 9a1 1 0 0 0 1.42 0l6.5-6.5a1 1 0 0 0 0-1.42l-9-9a1 1 0 0 0-.71-.29z" />
        <circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function CartGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useLang();
  const { cartCount, setOpen: setCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const close = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCategoryOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setCategoryOpen(false), 150);
  };

  return (
    <header className={`${styles.wrap} ${scrolled ? styles.scrolled : ""}`} ref={ref}>
      {/* ---------- main bar ---------- */}
      <div className={styles.main}>
        <a href="#home" className={styles.logo} aria-label={t("nav.home")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-wordmark.png" alt="Cycle Wala" className={styles.logoImg} />
        </a>

        <nav className={styles.links} aria-label="Primary">
          <a href="#home">{t("nav.home")}</a>

          <div className={styles.catWrap} onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
            <button
              type="button"
              className={styles.catBtn}
              onClick={() => setCategoryOpen((v) => !v)}
              aria-expanded={categoryOpen}
            >
              {t("nav.categories")} <span className={styles.chev}>{categoryOpen ? "▴" : "▾"}</span>
            </button>
            {categoryOpen && (
              <div className={styles.dropdown}>
                <p className={styles.dropdownKicker}>{t("nav.browseCategories")}</p>
                <ul>
                  {CATEGORY_META.map((c) => (
                    <li key={c.id}>
                      <a href="#shop">
                        <span className={styles.dropdownIcon} aria-hidden="true">
                          <BikeGlyph />
                        </span>
                        <span className={styles.dropdownName}>{c.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a href="#shop" className={styles.dropdownAll}>
                  <span className={styles.dropdownAllIcon} aria-hidden="true">
                    <TagGlyph />
                  </span>
                  {t("nav.viewAllCategories")}
                  <span aria-hidden="true">›</span>
                </a>
              </div>
            )}
          </div>

          <a href="#shop">{t("nav.shop")}</a>
          <a href="#about">{t("nav.about")}</a>
          <a href="#services">{t("nav.services")}</a>
          <a href="#gallery">{t("nav.gallery")}</a>
          <a href="#contact">{t("nav.contact")}</a>
        </nav>

        <div className={styles.right}>
          <button type="button" className={styles.cartBtn} aria-label="Your list" onClick={() => setCartOpen(true)}>
            <CartGlyph />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
          <a className={styles.callBtn} href={SHOP.phoneHref}>
            {t("nav.call")}
          </a>
          <button
            type="button"
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
            aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ---------- mobile drawer ---------- */}
      <div className={`${styles.sheet} ${menuOpen ? styles.sheetOpen : ""}`} id="mobile-nav" hidden={!menuOpen}>
        <nav aria-label="Primary mobile">
          {LINKS.map((l) => (
            <a key={l.key} href={l.href} onClick={() => setMenuOpen(false)}>
              {t(l.key)}
            </a>
          ))}
          <p className={styles.sheetKicker}>{t("nav.categories")}</p>
          {CATEGORY_META.map((c) => (
            <a key={c.id} href="#shop" onClick={() => setMenuOpen(false)} className={styles.sheetCat}>
              {c.label}
            </a>
          ))}
        </nav>
      </div>
      <button
        type="button"
        className={`${styles.scrim} ${menuOpen ? styles.scrimOn : ""}`}
        aria-label={t("nav.close")}
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />
    </header>
  );
}
