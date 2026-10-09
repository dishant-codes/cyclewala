"use client";

/* Full-screen photo viewer — opens when a cycle's photo is clicked.
 *
 * A white screen with a close button, the photo as large as it fits, a thumbnail strip along the bottom and
 * the cycle's other colour photos one swipe away. Pinch (or double-tap / double-click, or the mouse wheel) to
 * zoom, drag to look around while zoomed. Esc, the X or the arrow keys work from the keyboard.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ImageViewer.module.css";

export type ViewerImage = { src: string; label?: string };

const MAX_ZOOM = 4;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function ImageViewer({
  title,
  images,
  start = 0,
  onClose,
}: {
  title: string;
  images: ViewerImage[];
  start?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(clamp(start, 0, Math.max(0, images.length - 1)));
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);
  const [dir, setDir] = useState<1 | -1 | 0>(0);
  const stage = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ sx: 0, sy: 0, vx: 0, vy: 0, vs: 1, dist: 0, moved: false, t: 0, lastTap: 0 });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const [touching, setTouching] = useState(false);
  const many = images.length > 1;

  const go = useCallback(
    (to: number, d: 1 | -1 | 0) => {
      setIndex((i) => {
        const next = (to + images.length) % images.length;
        return next === i ? i : next;
      });
      setDir(d);
      setView({ s: 1, x: 0, y: 0 });
    },
    [images.length]
  );
  const step = useCallback((d: 1 | -1) => go(index + d, d), [go, index]);

  // lock the page behind, move focus into the viewer, put it back on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && many) step(1);
      else if (e.key === "ArrowLeft" && many) step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [many, onClose, step]);

  // keep the chosen thumbnail in view
  useEffect(() => {
    const strip = thumbs.current;
    const on = strip?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!strip || !on) return;
    const x = on.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
    strip.scrollTo({ left: x - (strip.clientWidth - on.offsetWidth) / 2, behavior: "smooth" });
  }, [index]);

  /** keep the zoomed photo from being dragged off the screen */
  const bound = (s: number, x: number, y: number) => {
    const el = stage.current;
    const w = el?.clientWidth ?? 0;
    const h = el?.clientHeight ?? 0;
    const mx = ((s - 1) * w) / 2;
    const my = ((s - 1) * h) / 2;
    return { s, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  };

  // mouse wheel zooms (a native listener, because React's wheel handler can't cancel the page scroll)
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = viewRef.current;
      const s = clamp(v.s * (e.deltaY < 0 ? 1.18 : 1 / 1.18), 1, MAX_ZOOM);
      setView(s === 1 ? { s: 1, x: 0, y: 0 } : bound(s, v.x, v.y));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // the arrow buttons keep their own clicks
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setTouching(true);
    const g = gesture.current;
    const v = viewRef.current;
    g.sx = e.clientX;
    g.sy = e.clientY;
    g.vx = v.x;
    g.vy = v.y;
    g.vs = v.s;
    g.moved = false;
    g.t = Date.now();
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const s = clamp(g.vs * (d / g.dist), 1, MAX_ZOOM);
      g.moved = true;
      setView(s === 1 ? { s: 1, x: 0, y: 0 } : bound(s, viewRef.current.x, viewRef.current.y));
      return;
    }
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
    if (viewRef.current.s > 1) setView(bound(viewRef.current.s, g.vx + dx, g.vy + dy));
    else if (many) setDragX(dx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const had = pointers.current.delete(e.pointerId);
    if (!had) return;
    if (pointers.current.size === 0) setTouching(false);
    const g = gesture.current;
    if (pointers.current.size > 0) {
      // one finger of a pinch lifted: carry on panning from where the other one is
      const [p] = [...pointers.current.values()];
      g.sx = p.x;
      g.sy = p.y;
      g.vx = viewRef.current.x;
      g.vy = viewRef.current.y;
      g.vs = viewRef.current.s;
      return;
    }
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    const wasDrag = dragX !== 0;
    setDragX(0);
    if (viewRef.current.s === 1 && many && wasDrag && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
      return;
    }
    // a tap: two in quick succession zoom in on that spot, or back out
    if (!g.moved && Date.now() - g.t < 300) {
      const now = Date.now();
      if (now - g.lastTap < 320) {
        g.lastTap = 0;
        const el = stage.current;
        if (viewRef.current.s > 1) setView({ s: 1, x: 0, y: 0 });
        else if (el) {
          const r = el.getBoundingClientRect();
          const s = 2.5;
          setView(bound(s, (r.left + r.width / 2 - e.clientX) * (s - 1), (r.top + r.height / 2 - e.clientY) * (s - 1)));
        }
      } else g.lastTap = now;
    }
  };

  const current = images[index];
  if (!current) return null;

  return createPortal(
    <div className={styles.viewer} role="dialog" aria-modal="true" aria-label={`${title} photos`} data-lenis-prevent>
      <div className={styles.bar}>
        <div className={styles.barText}>
          <strong>{title}</strong>
          {many && (
            <span>
              {index + 1} / {images.length}
            </span>
          )}
        </div>
        <button ref={closeBtn} type="button" className={styles.close} onClick={onClose} aria-label="Close photo">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div
        ref={stage}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          key={index}
          className={dir === 0 ? styles.slide : dir > 0 ? styles.slideNext : styles.slidePrev}
          style={{
            transform: `translate3d(${view.x + dragX}px, ${view.y}px, 0) scale(${view.s})`,
            transition: touching ? "none" : "transform 0.2s ease-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.label ? `${title} – ${current.label}` : title} draggable={false} className={styles.photo} />
        </div>

        {many && (
          <>
            <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => step(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => step(1)} aria-label="Next photo">
              ›
            </button>
          </>
        )}
      </div>

      {current.label && <p className={styles.caption}>{current.label}</p>}

      {many && (
        <div ref={thumbs} className={styles.thumbs} role="tablist" aria-label="Photos">
          {images.map((im, i) => (
            <button
              key={im.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-current={i === index}
              aria-label={im.label ? `Show ${im.label}` : `Show photo ${i + 1}`}
              className={i === index ? styles.thumbOn : styles.thumb}
              onClick={() => go(i, i > index ? 1 : -1)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt="" loading="lazy" decoding="async" draggable={false} />
            </button>
          ))}
        </div>
      )}
      {!many && <div className={styles.thumbsGap} />}
    </div>,
    document.body
  );
}
