"use client";

/* The privacy page's motion, kept out of the server-rendered page so the text itself is plain HTML:
   - a thin reading-progress bar,
   - sections that fade up as you reach them (only hidden once this has run — never without JS),
   - the contents list highlighting the section you are in.
   No per-frame layout reads: the page height is cached and the scroll handler only reads scrollY. */

import { useEffect, useState } from "react";
import styles from "./privacy.module.css";

export default function PrivacyEffects() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- reading progress ---- */
    let max = 1;
    let raf = 0;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const update = () => {
      raf = 0;
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    /* ---- reveal + contents highlight ---- */
    const sections = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-toc]")];
    const setActive = (id: string) => links.forEach((a) => a.setAttribute("aria-current", String(a.dataset.toc === id)));

    let revealIo: IntersectionObserver | null = null;
    if (!reduce && typeof IntersectionObserver !== "undefined") {
      // anything already on screen is simply shown; the rest waits to be reached
      sections.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.setAttribute("data-on", "true");
      });
      document.querySelector("[data-reveal-root]")?.setAttribute("data-armed", "true");
      revealIo = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.setAttribute("data-on", "true");
              revealIo?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      sections.filter((el) => el.getAttribute("data-on") !== "true").forEach((el) => revealIo?.observe(el));
    } else {
      sections.forEach((el) => el.setAttribute("data-on", "true"));
    }

    // the section nearest the top third of the screen is "current"
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62% 0px" }
    );
    sections.forEach((el) => spy.observe(el));
    if (sections[0]) setActive(sections[0].id);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      revealIo?.disconnect();
      spy.disconnect();
    };
  }, []);

  return (
    <div className={styles.progress} aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
