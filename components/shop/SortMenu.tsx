"use client";

/* A styled replacement for the browser's plain <select> on the shop page. Same behaviour — pick
   one option — but a rounded panel with icons and a tick on the current choice, and fully
   keyboard-accessible (arrows, Home/End, Enter/Space, Esc, Tab) as a listbox. */

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./SortMenu.module.css";

export type SortOption<T extends string> = { id: T; label: string; hint?: string; icon: ReactNode };

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const SORT_ICONS = {
  featured: svg(<path d="M12 3l2.4 5.4 5.6.5-4.2 3.8 1.3 5.6L12 15.4 6.9 18.3l1.3-5.6L4 8.9l5.6-.5L12 3z" />),
  asc: svg(
    <>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  desc: svg(
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  rating: svg(<path d="M12 3.5l2.2 4.7 5.1.6-3.8 3.5 1 5.1L12 14.8 7.5 17.4l1-5.1L4.7 8.8l5.1-.6L12 3.5z" />),
};

export default function SortMenu<T extends string>({
  value,
  options,
  onChange,
  label = "Sort",
}: {
  value: T;
  options: SortOption<T>[];
  onChange: (v: T) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = options.find((o) => o.id === value) ?? options[0];

  // close on an outside click / tap
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((o) => o.id === value)));
    setOpen(true);
  };
  const choose = (i: number) => {
    onChange(options[i].id);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef} onKeyDown={onKeyDown}>
      <button
        ref={btnRef}
        type="button"
        className={open ? styles.btnOpen : styles.btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className={styles.btnIcon}>{current.icon}</span>
        <span className={styles.btnText}>
          <small>{label}</small>
          {current.label}
        </span>
        <svg className={styles.chev} viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul className={styles.panel} id={listId} role="listbox" aria-label={label} tabIndex={-1}>
          {options.map((o, i) => (
            <li
              key={o.id}
              role="option"
              aria-selected={o.id === value}
              className={`${styles.option} ${i === active ? styles.active : ""} ${o.id === value ? styles.selected : ""}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <span className={styles.optIcon}>{o.icon}</span>
              <span className={styles.optText}>
                {o.label}
                {o.hint && <small>{o.hint}</small>}
              </span>
              {o.id === value && (
                <svg className={styles.tick} viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
