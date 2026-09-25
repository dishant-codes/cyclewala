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
 * `top` is the only measured value: min(0, viewportHeight - sectionHeight),
 * kept current with a ResizeObserver so it stays right when the section's
 * height changes (filters, loader, modal, window resize).
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
 * The marker's position is the only input — it is where the section would
 * naturally be, and it is never transformed.
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
  const [top, setTop] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setTop(Math.min(0, Math.round(window.innerHeight - el.offsetHeight)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (enter !== "right") return;
    const el = ref.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    // the stack is plain scrolling for people who ask for less motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      /* how far the section's natural top sits below the screen top: vh while
         the previous section is only just pinned, 0 once this one has arrived */
      const c = Math.min(Math.max(anchor.getBoundingClientRect().top, 0), vh);
      const p = Math.min(1, (vh - c) / Math.max(vh - SETTLE, vh * 0.5));
      const eased = 1 - (1 - p) * (1 - p);

      if (c === 0) {
        el.style.transform = "";
        el.style.boxShadow = "";
      } else {
        el.style.transform = `translate3d(${(1 - eased) * 100}%, ${-c}px, 0)`;
        // an edge shadow while it travels, so it reads as a layer sliding over
        el.style.boxShadow = p < 1 ? "-28px 0 60px -20px rgba(20, 40, 10, 0.35)" : "";
      }
      // off-screen to the right: keep its buttons out of the tab order
      el.style.visibility = p <= 0 ? "hidden" : "";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      el.style.transform = "";
      el.style.boxShadow = "";
      el.style.visibility = "";
    };
  }, [enter]);

  return (
    <>
      <span ref={anchorRef} id={id} className={styles.anchor} aria-hidden="true" />
      <div
        ref={ref}
        className={enter === "right" ? `${styles.stack} ${styles.fromRight}` : styles.stack}
        style={{ zIndex: order, top }}
      >
        {children}
      </div>
    </>
  );
}
