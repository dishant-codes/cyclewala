"use client";

/*
 * STACKED SECTION — the "next section slides up over this one" effect, for
 * sections of any height.
 *
 * Scene (used by the Gallery) freezes a section to one screen and clips the
 * rest, which would cut off tall sections like the shop grid. This does it
 * with plain CSS sticky instead: the section scrolls normally until its
 * BOTTOM edge reaches the bottom of the screen, then stays pinned there while
 * the next section (higher z-index, opaque background) rises over it. A
 * section shorter than the screen simply pins at the top.
 *
 * The pin position is pure CSS — `top: min(0px, 100svh - sectionHeight)` —
 * so the only measured value is the section's own HEIGHT. It is deliberately
 * not derived from window.innerHeight: on a phone that value changes every
 * time the browser's address bar slides away, which used to re-pin the
 * section in the middle of a swipe (the "stuck / jumping" feel).
 *
 * The section's `id` goes on a zero-height marker in normal flow just above
 * it, not on the section itself — a pinned element reports its pinned
 * position, so anchor links must target something that never moves.
 *
 * enter="right" swaps the rise for a sideways entrance: the moment the
 * previous section is pinned, this one is held at the top of the screen and
 * slides in from the right, driven by the same scroll distance the rise would
 * have used. It is done with a transform on the section itself (translateY
 * cancels the rise, translateX brings it in), so page layout never changes.
 *
 * Smoothness (matters most on phones):
 *  - the marker's document position is measured only when the layout changes,
 *    never per scroll event, so the scroll handler reads `scrollY` and writes
 *    one transform — no forced layout, no per-frame style churn;
 *  - the viewport height used for the slide is frozen except on real size
 *    changes (width / rotation), so the address bar can't jerk the animation;
 *  - the edge shadow is a static class toggled once, not repainted per frame;
 *  - touch scrolling stays native (see SmoothScroll.tsx).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./StackSection.module.css";

/* The slide finishes this far before the marker reaches the top of the
   screen, so a nav click (which lands the marker one --nav-offset, 96px,
   below the top) always shows the section fully in place. */
const SETTLE = 130;

export default function StackSection({
  children,
  order,
  id,
  enter = "up",
}: {
  children: ReactNode;
  /** paint order — later sections must cover earlier ones */
  order: number;
  id?: string;
  /** "up" (default) rises from below; "right" slides in sideways */
  enter?: "up" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  /* undefined until measured, so nothing pins (and nothing flashes) before
     the first measurement */
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = Math.round(el.offsetHeight);
      setHeight((prev) => (prev === h ? prev : h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (enter !== "right") return;
    const el = ref.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    // the stack is plain scrolling for people who ask for less motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let vh = window.innerHeight;
    let width = window.innerWidth;
    let anchorTop = 0; // marker's position in the document
    let lastKey = "";

    const measure = () => {
      // only a real size change (width / rotation / big jump) re-reads the
      // viewport height; the address bar sliding away is ignored
      if (window.innerWidth !== width || Math.abs(window.innerHeight - vh) > 160) {
        width = window.innerWidth;
        vh = window.innerHeight;
      }
      anchorTop = anchor.getBoundingClientRect().top + window.scrollY;
    };

    const update = () => {
      raf = 0;
      /* how far the section's natural top sits below the screen top: vh while
         the previous section is only just pinned, 0 once this one has arrived */
      const c = Math.min(Math.max(anchorTop - window.scrollY, 0), vh);
      const p = Math.min(1, (vh - c) / Math.max(vh - SETTLE, vh * 0.5));
      const eased = 1 - (1 - p) * (1 - p);

      const transform = c === 0 ? "" : `translate3d(${((1 - eased) * 100).toFixed(2)}%, ${-c.toFixed(1)}px, 0)`;
      const sliding = c !== 0 && p < 1;
      const hidden = p <= 0;
      // write only what changed
      const key = `${transform}|${sliding}|${hidden}`;
      if (key === lastKey) return;
      lastKey = key;

      el.style.transform = transform;
      el.classList.toggle(styles.sliding, sliding);
      // off-screen to the right: keep its buttons out of the tab order
      el.style.visibility = hidden ? "hidden" : "";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      lastKey = "";
      schedule();
    };

    remeasure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    // anything above this section growing or shrinking (images loading,
    // filters changing the shop) moves the marker
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
      el.style.transform = "";
      el.style.visibility = "";
      el.classList.remove(styles.sliding);
    };
  }, [enter]);

  return (
    <>
      <span ref={anchorRef} id={id} className={styles.anchor} aria-hidden="true" />
      <div
        ref={ref}
        className={enter === "right" ? `${styles.stack} ${styles.fromRight}` : styles.stack}
        style={{
          zIndex: order,
          top: height === undefined ? undefined : `min(0px, calc(100svh - ${height}px))`,
        }}
      >
        {children}
      </div>
    </>
  );
}
