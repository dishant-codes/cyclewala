"use client";

/* Sign in / create account window. Rendered into <body> so the stacked sections can never paint over it. */

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { AuthMode, PublicCustomer } from "@/lib/customer";
import { SHOP } from "@/lib/site";
import styles from "./AuthModal.module.css";

const MIN_PASSWORD = 8;

export default function AuthModal({
  initialMode,
  reason,
  onClose,
  onAuthed,
}: {
  initialMode: AuthMode;
  reason?: string;
  onClose: () => void;
  onAuthed: (customer: PublicCustomer) => void;
}) {
  const uid = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const signup = mode === "signup";

  // lock the page behind the window, close on Escape, and start in the first field
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;
      // keep Tab inside the window
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button, input, a[href]")].filter((el) => !el.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    firstField.current?.focus();
  }, [mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (signup && name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Please enter a valid email address.");
    if (signup && password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
    if (!signup && !password) return setError("Enter your password.");

    setBusy(true);
    try {
      const res = await fetch(signup ? "/api/customer/signup" : "/api/customer/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup ? { name, email, password } : { email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.customer) {
        setError(data.error ?? "Something went wrong — please try again.");
        return;
      }
      onAuthed(data.customer as PublicCustomer);
    } catch {
      setError("We couldn't reach the shop. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
  };

  return createPortal(
    <>
      <button type="button" className={styles.scrim} aria-label="Close" onClick={onClose} tabIndex={-1} />
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className={styles.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={!signup} className={!signup ? styles.tabOn : styles.tab} onClick={() => switchMode("signin")}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={signup} className={signup ? styles.tabOn : styles.tab} onClick={() => switchMode("signup")}>
            Create account
          </button>
        </div>

        <h2 id={`${uid}-title`} className={styles.title}>
          {signup ? "Create your account" : "Welcome back"}
        </h2>
        <p className={styles.sub}>
          {reason ?? (signup ? "Save your favourite cycles to a wishlist and find them again any time." : "Sign in to see your saved cycles.")}
        </p>

        <form className={styles.form} onSubmit={submit} noValidate>
          {signup && (
            <label className={styles.field}>
              Your name
              <input
                ref={firstField}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                placeholder="e.g. Aditya Pagare"
              />
            </label>
          )}
          <label className={styles.field}>
            Email
            <input
              ref={signup ? undefined : firstField}
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete={signup ? "email" : "username"}
              maxLength={254}
              placeholder="you@example.com"
            />
          </label>
          <label className={styles.field}>
            Password
            <span className={styles.passwordWrap}>
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={signup ? "new-password" : "current-password"}
                maxLength={128}
                placeholder={signup ? `At least ${MIN_PASSWORD} characters` : "Your password"}
              />
              <button type="button" className={styles.showBtn} onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </button>
        </form>

        {signup ? (
          <p className={styles.fine}>
            By creating an account you agree to how we handle your details in our{" "}
            <Link href="/privacy" onClick={onClose}>
              Privacy Policy
            </Link>
            .
          </p>
        ) : (
          <p className={styles.fine}>
            Forgot your password? Call us on <a href={SHOP.phoneHref}>{SHOP.phone}</a> and we&apos;ll help you get back in.
          </p>
        )}
        <p className={styles.switch}>
          {signup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" onClick={() => switchMode(signup ? "signin" : "signup")}>
            {signup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </>,
    document.body
  );
}
