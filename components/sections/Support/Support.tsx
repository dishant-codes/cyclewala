"use client";

import styles from "./Support.module.css";
import { useLang } from "@/lib/i18n";
import { SHOP } from "@/lib/site";

const svg = (children: React.ReactNode, size = 20) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  phone: svg(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />),
  clock: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  pin: svg(
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  shield: svg(
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
};

/* WE CARE — after-sales support: real contact details only. */
export default function Support() {
  const { t } = useLang();

  const cards = [
    { icon: ICONS.phone, label: t("support.helpLabel"), value: SHOP.phone, href: SHOP.phoneHref },
    { icon: ICONS.clock, label: t("support.hoursLabel"), value: SHOP.hours },
    { icon: ICONS.pin, label: t("support.visitLabel"), value: t("support.visitValue") },
    { icon: ICONS.shield, label: t("support.fitLabel"), value: t("support.fitValue") },
  ];

  return (
    <section className={styles.support}>
      <div className={styles.wrap}>
        <div className={styles.photoCol}>
          <div className={styles.frame} aria-hidden="true" />
          <div className={styles.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/gallery/shop-2.png" alt="Inside the Cycle Wala shop" loading="lazy" />
          </div>
          <p className={styles.chip}>
            {ICONS.pin}
            {t("support.visitValue")}
          </p>
        </div>

        <div className={styles.body}>
          <p className={styles.eyebrow}>{t("support.eyebrow")}</p>
          <h2 className={styles.h2}>{t("support.h2")}</h2>
          <p className={styles.lede}>{t("support.lede")}</p>

          <div className={styles.cards}>
            {cards.map((c) => {
              const inner = (
                <>
                  <span className={styles.icon}>{c.icon}</span>
                  <span className={styles.cardText}>
                    <span className={styles.cardLabel}>{c.label}</span>
                    <span className={styles.cardValue}>{c.value}</span>
                  </span>
                </>
              );
              return c.href ? (
                <a className={styles.card} href={c.href} key={c.label}>
                  {inner}
                </a>
              ) : (
                <div className={styles.card} key={c.label}>
                  {inner}
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <a className={styles.primary} href={SHOP.phoneHref}>
              {ICONS.phone}
              {t("hero.cta2")}
            </a>
            <a
              className={styles.secondary}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SHOP.name}, ${SHOP.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("support.directions")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
