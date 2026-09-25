"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Connect.module.css";
import { useLang } from "@/lib/i18n";
import { SHOP } from "@/lib/site";

/* Official brand marks, inlined so they inherit size and need no requests. */
const MARKS: Record<string, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94z" />
    </svg>
  ),
};

/* Only Instagram/Facebook are optional "social" links — Phone is always the
   shop's own number, never hidden, so it's rendered separately as a proper
   info chip rather than lumped in with socials that may not exist. */
const SOCIALS: { name: string; href: string; mark: keyof typeof MARKS }[] = [
  ...(SHOP.instagram ? [{ name: "Instagram", mark: "instagram" as const, href: SHOP.instagram }] : []),
  ...(SHOP.facebook ? [{ name: "Facebook", mark: "facebook" as const, href: SHOP.facebook }] : []),
];

const svg = (children: ReactNode, size = 20) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  pin: svg(
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  phone: svg(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />),
  clock: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

export default function Connect() {
  const { t } = useLang();
  const panelRef = useRef<HTMLDivElement>(null);

  /* The panel starts small and grows to full size the first time it scrolls
     into view — a one-shot reveal via IntersectionObserver (this page's
     custom sticky-stacking layout throws off GSAP ScrollTrigger's start-
     position math, so a plain observer is the reliable option here).
     Fail-safe, not fail-hidden: the panel's default CSS state is full size,
     and only gets shrunk by JS right after mount — reduced motion, no
     IntersectionObserver, or the panel already being on screen (a short
     viewport, or landing straight on #contact) all just leave it full size. */
  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add(styles.panelSmall);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove(styles.panelSmall);
        io.disconnect();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.connect} id="contact">
      <div className={styles.wrap}>
        <div className={styles.panel} ref={panelRef}>
          <div className={styles.glow} aria-hidden="true" />

          <p className={styles.eyebrow}>
            <span>04</span> {t("connect.eyebrow")}
          </p>
          <h2 className={styles.h2}>
            {t("connect.h2a")} <em className={styles.serif}>{t("connect.h2Em")}</em>
          </h2>
          <p className={styles.lede}>{t("connect.lede")}</p>

          <div className={styles.actions}>
            <a className={styles.primaryBtn} href={SHOP.phoneHref}>
              {ICONS.phone}
              {t("connect.cta")}
            </a>
            <a
              className={styles.secondaryBtn}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SHOP.name}, ${SHOP.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ICONS.pin}
              {t("support.directions")}
            </a>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>{ICONS.pin}</span>
              <span className={styles.infoText}>
                <span className={styles.infoLabel}>{t("connect.visitLabel")}</span>
                <span className={styles.infoValue}>{SHOP.address}</span>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>{ICONS.phone}</span>
              <span className={styles.infoText}>
                <span className={styles.infoLabel}>{t("connect.callLabel")}</span>
                <a className={styles.infoValue} href={SHOP.phoneHref}>
                  {SHOP.phone}
                </a>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>{ICONS.clock}</span>
              <span className={styles.infoText}>
                <span className={styles.infoLabel}>{t("connect.hoursLabel")}</span>
                <span className={styles.infoValue}>{SHOP.hours}</span>
              </span>
            </div>
          </div>

          {SOCIALS.length > 0 && (
            <div className={styles.panelSocials}>
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} className={styles.panelSocial} target="_blank" rel="noreferrer" aria-label={s.name}>
                  {MARKS[s.mark]}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- footer — plain, as it was before ---------- */}
      <footer className={styles.footer}>
        <div className={styles.footGrid}>
          <div className={styles.footCol}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/cyclewala-logo.png" alt={SHOP.name} className={styles.footLogo} />
            <p>{SHOP.description}</p>
            {SOCIALS.length > 0 && (
              <div className={styles.footSocials}>
                {SOCIALS.map((s) => (
                  <a key={s.name} href={s.href} className={styles.footSocial} target="_blank" rel="noreferrer" aria-label={s.name}>
                    {MARKS[s.mark]}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footCol}>
            <h5>{t("connect.navHeading")}</h5>
            <a href="#home">{t("nav.home")}</a>
            <a href="#about">{t("nav.about")}</a>
            <a href="#shop">{t("nav.shop")}</a>
            <a href="#services">{t("nav.services")}</a>
            <a href="#gallery">{t("nav.gallery")}</a>
          </div>

          <div className={styles.footCol}>
            <h5>{t("connect.categoriesHeading")}</h5>
            <a href="#shop">Kids&apos; Cycles</a>
            <a href="#shop">Mountain Cycles</a>
            <a href="#shop">City & Hybrid</a>
          </div>

          <div className={styles.footCol}>
            <h5>{t("connect.contactHeading")}</h5>
            <p>{SHOP.address}</p>
            <a href={SHOP.phoneHref}>{SHOP.phone}</a>
            <p>{SHOP.hours}</p>
          </div>
        </div>

        <div className={styles.footBottom}>
          <span>
            {t("connect.credit")} <b>{SHOP.name}</b>
          </span>
          <a href="#home" className={styles.top}>
            {t("connect.top")}
          </a>
          <span>
            © 2026 {SHOP.name} · Developed by{" "}
            <a href="https://adipagare-portfolio.netlify.app/" target="_blank" rel="noreferrer" className={styles.dev}>
              Aditya Pagare
            </a>
          </span>
        </div>
      </footer>
    </section>
  );
}
