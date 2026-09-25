"use client";

import { useState } from "react";
import { SERVICES, type Service, type ServiceId } from "@/data/services";
import BookingModal from "@/components/services/BookingModal";
import styles from "./Services.module.css";
import { useLang } from "@/lib/i18n";

const svg = (children: React.ReactNode, size = 22) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS: Record<ServiceId, React.ReactNode> = {
  "non-gear": svg(<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />),
  gear: svg(
    <>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M5.5 17.5 11 8h4l3.5 9.5" />
      <path d="M11 8 9 12.5 5.5 17.5" />
      <path d="M9 12.5h5.5" />
      <path d="M11 8l1.3-2h2.2" />
    </>
  ),
  home: svg(
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
};

const CHECK = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.3l2.4 2.4 4.6-5" />
  </>,
  17
);

export default function Services() {
  const { t } = useLang();
  const [booking, setBooking] = useState<Service | null>(null);

  return (
    <section className={styles.services}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t("services.eyebrow")}</p>
          <h2 className={styles.h2}>{t("services.h2")}</h2>
          <p className={styles.lede}>{t("services.lede")}</p>
        </div>

        <div className={styles.grid}>
          {SERVICES.map((s) => (
            <article className={styles.card} key={s.id}>
              <div className={styles.cardHead}>
                <span className={styles.iconCircle}>{ICONS[s.id]}</span>
                <h3>{s.title}</h3>
                <p className={styles.sub}>{s.subtitle}</p>
                <p className={styles.price}>₹{s.price.toLocaleString("en-IN")}</p>
              </div>

              <div className={styles.cardBody}>
                <ul className={styles.list}>
                  {s.items.map((i) => (
                    <li key={i}>
                      <span className={styles.check}>{CHECK}</span>
                      {i}
                    </li>
                  ))}
                </ul>
                <button className={styles.book} onClick={() => setBooking(s)}>
                  Book This Service
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {booking && <BookingModal service={booking} onClose={() => setBooking(null)} />}
    </section>
  );
}
