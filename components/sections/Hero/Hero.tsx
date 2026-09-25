"use client";

import styles from "./Hero.module.css";
import { useLang } from "@/lib/i18n";
import { SHOP } from "@/lib/site";

/* HERO — full-width background photo under a dark green wash, headline and
   CTAs on the left, real shop details in a strip along the bottom. Static:
   no scroll effects, no canvas. */
const [street, , gate, , market] = SHOP.address.split(", ");

const INFO = [
  {
    label: "Find us",
    value: `${street}, ${gate}, ${market}`,
    icon: (
      <>
        <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>
    ),
  },
  {
    label: "Open",
    value: SHOP.hours,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    label: "Call",
    value: SHOP.phone,
    href: SHOP.phoneHref,
    icon: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
  },
];

export default function Hero() {
  const { t } = useLang();

  return (
    <section className={styles.hero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.bg}
        src="/images/hero-cycle.jpg"
        alt=""
        width={1280}
        height={720}
        fetchPriority="high"
      />
      <div className={styles.wash} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.head}>
          <p className={styles.kicker}>
            <span className={styles.dot} aria-hidden="true" />
            {t("hero.kicker")}
          </p>
          <h1 className={styles.h1}>
            {t("hero.h1a")} <em className={styles.serif}>{t("hero.h1aEm")}</em>
            <br />
            {t("hero.h1b")} <em className={styles.serif}>{t("hero.h1bEm")}</em>
          </h1>
          <p className={styles.sub}>{t("hero.sub")}</p>

          <div className={styles.ctas}>
            <a className={styles.btnPrimary} href="#shop">
              {t("hero.cta1")} <span aria-hidden="true">→</span>
            </a>
            <a className={styles.btnGhost} href={SHOP.phoneHref}>
              {t("hero.cta2")}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.infoBar}>
        {INFO.map((i) => {
          const body = (
            <>
              <span className={styles.infoIcon}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {i.icon}
                </svg>
              </span>
              <span className={styles.infoText}>
                <span className={styles.infoLabel}>{i.label}</span>
                <span className={styles.infoValue}>{i.value}</span>
              </span>
            </>
          );
          return i.href ? (
            <a className={styles.infoItem} href={i.href} key={i.label}>
              {body}
            </a>
          ) : (
            <div className={styles.infoItem} key={i.label}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
