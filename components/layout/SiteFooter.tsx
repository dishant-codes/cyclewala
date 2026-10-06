/* eslint-disable @next/next/no-html-link-for-pages -- the brand / category links are plain anchors on
   purpose: a full page load makes the shop read ?brand= / ?cat= once, on arrival. */
/* The site footer: a trust strip, then brands / categories / pages / visit-us columns, then the
   legal line. Used on the home page and the privacy page, so every link is written to work from
   either ("/#shop", "/?brand=Kross#shop", "/privacy"). Static content — no client code needed. */
import { SHOP } from "@/lib/site";
import styles from "./SiteFooter.module.css";

const svg = (children: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/* Only things this shop really does (see the About and checkout copy) — no shipping, warranty or
   payment-gateway claims, because there are none. */
const TRUST = [
  {
    title: "Genuine cycles",
    body: "New cycles from trusted brands — Oyekid, Neufman, Hero, Hercules and more.",
    icon: svg(
      <>
        <circle cx="5.5" cy="17" r="3.5" />
        <circle cx="18.5" cy="17" r="3.5" />
        <path d="M5.5 17 9 8h5l4.5 9M9 8 7.5 5H5M14 8l1.5-3H18M8 13h8" />
      </>
    ),
  },
  {
    title: "Expert workshop",
    body: "Trained mechanics, honest pricing and a fast turnaround on every service.",
    icon: svg(<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />),
  },
  {
    title: "Genuine parts",
    body: "Manufacturer parts for every repair — no substitutes.",
    icon: svg(
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Pay at store or on delivery",
    body: "No card or UPI details online. We call to confirm, you pay in person.",
    icon: svg(
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M16 15h2" />
      </>
    ),
  },
  {
    title: "Local & friendly",
    body: "Serving riders in Chhatrapati Sambhajinagar since 2020.",
    icon: svg(
      <>
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>
    ),
  },
];

/* the shop's brand tabs, in the same order */
const BRANDS = ["Oyekid", "Neufman", "Schnell", "Hero", "Keysto", "Hercules", "Radiant", "BSA", "Kross"];

const CATEGORIES = [
  { label: "Kids' Cycles", key: "kids" },
  { label: "Mountain Cycles", key: "mtb" },
  { label: "City & Hybrid", key: "hybrid" },
  { label: "E-Bikes", key: "ebike" },
];

const PAGES = [
  { label: "Home", href: "/#home" },
  { label: "Shop", href: "/#shop" },
  { label: "About Us", href: "/#about" },
  { label: "Meet the Owner", href: "/owner" },
  { label: "Services", href: "/#services" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SHOP.name}, ${SHOP.address}`)}`;

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.trustBand}>
        <ul className={styles.trust}>
          {TRUST.map((t) => (
            <li key={t.title}>
              <span className={styles.trustIcon}>{t.icon}</span>
              <span>
                <b>{t.title}</b>
                <small>{t.body}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.about}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/cyclewala-logo.png" alt={SHOP.name} className={styles.logo} loading="lazy" decoding="async" />
            <p>{SHOP.description}</p>
            <div className={styles.cta}>
              <a href={SHOP.phoneHref} className={styles.callBtn}>
                Call {SHOP.phone}
              </a>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.dirBtn}>
                Get directions
              </a>
            </div>
            {SHOP.instagram && (
              <a href={SHOP.instagram} className={styles.social} target="_blank" rel="noopener noreferrer" aria-label="Cycle Wala on Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
                </svg>
                <span>Follow on Instagram</span>
              </a>
            )}
          </div>

          <nav className={`${styles.col} ${styles.brandsCol}`} aria-label="Shop by brand">
            <h5>Shop by brand</h5>
            {BRANDS.map((b) => (
              <a key={b} href={`/?brand=${encodeURIComponent(b)}#shop`}>
                {b}
              </a>
            ))}
          </nav>

          <nav className={styles.col} aria-label="Shop by category">
            <h5>Categories</h5>
            {CATEGORIES.map((c) => (
              <a key={c.key} href={`/?cat=${c.key}#shop`}>
                {c.label}
              </a>
            ))}
            <h5 className={styles.second}>Cycle care</h5>
            <a href="/#services">Book a service</a>
            <a href="/#services">Free pickup &amp; drop</a>
          </nav>

          <nav className={styles.col} aria-label="Pages">
            <h5>Quick links</h5>
            {PAGES.map((p) => (
              <a key={p.label} href={p.href}>
                {p.label}
              </a>
            ))}
            <h5 className={styles.second}>Information</h5>
            <a href="/privacy">Privacy Policy</a>
          </nav>

          <div className={styles.col}>
            <h5>Visit us</h5>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.addr}>
              {SHOP.address}
            </a>
            <h5 className={styles.second}>Open</h5>
            <p>{SHOP.hours}</p>
            <h5 className={styles.second}>Call us</h5>
            <a href={SHOP.phoneHref}>{SHOP.phone}</a>
            {SHOP.email && <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>}
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} {SHOP.name}. All rights reserved.
          </span>
          <span className={styles.legal}>
            <a href="/privacy">Privacy Policy</a>
            <a href="#top">Back to top ↑</a>
          </span>
          <span>
            Developed by{" "}
            <a href="https://adipagare-portfolio.netlify.app/" target="_blank" rel="noreferrer" className={styles.dev}>
              Aditya Pagare
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
