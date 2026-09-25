"use client";

import styles from "./About.module.css";
import { useLang } from "@/lib/i18n";

/* Real milestones — 2020 founding, 2022 storefront, 2023 accessories wall,
   Chhatrapati Sambhajinagar. Plain static timeline, no scroll-driven tunnel. */
const svg = (children: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  wrench: svg(<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />),
  store: svg(
    <>
      <path d="M4 9l1.5-5h13L20 9" />
      <path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
      <path d="M5 12v8h14v-8" />
      <path d="M10 20v-4h4v4" />
    </>
  ),
  bag: svg(
    <>
      <path d="M6 8h12l1 12H5z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  users: svg(
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.2c2.6.3 4.5 2.5 4.5 5.3" />
    </>
  ),
  shield: svg(
    <>
      <path d="M12 3l7 3v5.5c0 4.4-2.9 8-7 9.5-4.1-1.5-7-5.1-7-9.5V6z" />
      <path d="M8.8 12l2.3 2.3 4.1-4.4" />
    </>
  ),
  pin: svg(
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  heart: svg(<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />),
};

const MILESTONES: { year: string; title: string; story: string; icon: keyof typeof ICONS }[] = [
  {
    year: "2020",
    title: "One repair bench",
    story:
      "Cycle Wala started as a single repair bench and a simple idea: treat every cycle like it matters, because to its rider, it does.",
    icon: "wrench",
  },
  {
    year: "2022",
    title: "Opening the doors",
    story:
      "The first storefront opened — cycles for sale alongside the service counter, so riders could buy, fix and upgrade in one place.",
    icon: "store",
  },
  {
    year: "2023",
    title: "Beyond the cycle",
    story:
      "Helmets, lights, locks, bags — the accessories wall grew alongside the cycles, because a ride is only as good as what you bring with you.",
    icon: "bag",
  },
  {
    year: "Today",
    title: "The shop riders trust",
    story:
      "Store, accessories and service, under one roof — new riders finding their first cycle, regulars keeping theirs running for years.",
    icon: "users",
  },
];

/* Real, defensible numbers only — no fabricated customer/repair counts. */
const STATS = [
  { value: "2020", label: "Founded in" },
  { value: "5", label: "Brands stocked" },
  { value: "3", label: "Cycle categories" },
];

/* Honest, generic highlights consistent with the shop's own real story
   above — no fabricated certifications or e-commerce features. */
const HIGHLIGHTS: { title: string; body: string; icon: keyof typeof ICONS }[] = [
  { title: "Expert Service", body: "Trained mechanics, honest pricing, fast turnaround.", icon: "wrench" },
  { title: "Genuine Parts", body: "Manufacturer parts for every repair — no substitutes.", icon: "shield" },
  { title: "Local Focus", body: "Serving riders in Chhatrapati Sambhajinagar since 2020.", icon: "pin" },
  { title: "Customer First", body: "Walk in, ask, and ride away knowing your cycle's sorted.", icon: "heart" },
];

export default function About() {
  const { t } = useLang();

  return (
    <section className={styles.about}>
      <div className={styles.wrap}>
        <div className={styles.top}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{t("about.eyebrow")}</p>
            <h2 className={styles.h2}>
              {t("about.h2a")} <em className={styles.serif}>{t("about.h2Em")}</em>
            </h2>
            <p className={styles.lede}>{t("about.lede")}</p>

            <div className={styles.highlights}>
              {HIGHLIGHTS.map((h) => (
                <div className={styles.highlight} key={h.title}>
                  <span className={styles.hlIcon}>{ICONS[h.icon]}</span>
                  <h4>{h.title}</h4>
                  <p>{h.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.photoWrap}>
            <div className={styles.photoCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/gallery/shop-1.png" alt="Inside the Cycle Wala shop" loading="lazy" />
            </div>
            <div className={styles.sinceBadge}>
              <span className={styles.sinceIcon}>{ICONS.pin}</span>
              <span>
                <b>Since 2020</b>
                <i>Chhatrapati Sambhajinagar</i>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          {STATS.map((s) => (
            <div className={styles.stat} key={s.label}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.journey}>
          <span className={styles.pill}>
            <span className={styles.pillIcon}>{ICONS.wrench}</span>
            {t("about.journey")}
          </span>
          <h3 className={styles.jTitle}>
            From One Bench to the <em className={styles.serif}>Shop Riders Trust</em>
          </h3>
          <p className={styles.jLede}>
            Cycle Wala began as a single repair bench in Chhatrapati Sambhajinagar and grew, one rider at a time, into
            a store, an accessories wall and a service counter.
          </p>

          <ol className={styles.zig}>
            {MILESTONES.map((m, i) => (
              <li className={`${styles.zigItem} ${i % 2 === 0 ? styles.left : styles.right}`} key={m.year}>
                <div className={styles.zigCard}>
                  <div className={styles.zigHead}>
                    <span className={styles.zigBadge}>{ICONS[m.icon]}</span>
                    <span className={styles.zigYear}>{m.year}</span>
                  </div>
                  <h4>{m.title}</h4>
                  <p>{m.story}</p>
                </div>
                <span className={styles.node}>{ICONS[m.icon]}</span>
              </li>
            ))}
          </ol>

          <div className={styles.cta}>
            <h3>Ready to Join Our Journey?</h3>
            <p>Come by the shop, meet the team, and find the cycle that fits you.</p>
            <a href="#shop" className={styles.ctaBtn}>
              Explore Cycle Wala →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
