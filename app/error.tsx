"use client";

import Link from "next/link";
import { SHOP } from "@/lib/site";

/* Shown if something on a page throws while rendering — instead of a blank
   screen the visitor gets a way forward. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
        gap: 18,
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", color: "var(--ink-3)" }}>SOMETHING WENT WRONG</p>
      <h1 style={{ fontWeight: 900, fontSize: "clamp(32px, 6vw, 64px)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
        We hit a bump in the road.
      </h1>
      <p style={{ maxWidth: 420, color: "var(--ink-2)" }}>
        Please try again. If it keeps happening, call the shop on {SHOP.phone}.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, padding: "14px 26px", borderRadius: 999 }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{ border: "1.5px solid var(--ink)", fontWeight: 800, padding: "13px 26px", borderRadius: 999 }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
