"use client";

/* Motion for the owner page, kept out of the server-rendered page so all the words are plain HTML:
   - a reading-progress line,
   - the hero photo tilting toward the pointer, and the glow following it,
   - blocks that rise as you reach them (hidden only once this has run — never without JS),
   - numbers that count up the first time they appear.
   Everything is skipped for visitors who ask for reduced motion, and nothing reads layout per frame. */

import { useEffect, useRef } from "react";
import styles from "./owner.module.css";

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function OwnerEffects() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    /* ---- reading progress (writes straight to the element: no re-render per scroll) ---- */
    let max = 1;
    let raf = 0;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const paint = () => {
      raf = 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    measure();
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    cleanups.push(() => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    });

    /* ---- reveal + count-up ---- */
    const reveals = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const counters = [...document.querySelectorAll<HTMLElement>("[data-count]")];

    const runCount = (el: HTMLElement) => {
      const to = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? "";
      const start = performance.now();
      const dur = 1500;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = `${Math.round(to * ease(p))}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!reduce && typeof IntersectionObserver !== "undefined") {
      document.querySelector("[data-reveal-root]")?.setAttribute("data-armed", "true");
      counters.forEach((el) => {
        el.textContent = `0${el.dataset.suffix ?? ""}`;
      });
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            el.setAttribute("data-on", "true");
            if (el.dataset.count) runCount(el);
            io.unobserve(el);
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
      counters.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      reveals.forEach((el) => el.setAttribute("data-on", "true"));
    }

    /* ---- hero: the photo tilts toward the pointer, the glow drifts after it ---- */
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const tilt = document.querySelector<HTMLElement>("[data-tilt]");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hero && !reduce && canHover) {
      let pr = 0;
      let px = 0;
      let py = 0;
      const apply = () => {
        pr = 0;
        hero.style.setProperty("--mx", px.toFixed(3));
        hero.style.setProperty("--my", py.toFixed(3));
        if (tilt) {
          tilt.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
          tilt.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
        }
      };
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width - 0.5) * 2;
        py = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!pr) pr = requestAnimationFrame(apply);
      };
      const onLeave = () => {
        px = 0;
        py = 0;
        if (!pr) pr = requestAnimationFrame(apply);
      };
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        if (pr) cancelAnimationFrame(pr);
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div className={styles.progress} aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}
