"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis, scrollToHash } from "@/lib/lenis";

/* Single rAF loop: Lenis drives ScrollTrigger — 00 §7.3.
   Also owns in-page anchor scrolling for the whole site, so every link
   (nav, hero CTAs, footer, and anything we add later) lands below the header. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;

    /* Lenis re-implements scrolling in JS; on a phone that fights the browser's
       own momentum scrolling and is the main source of lag, so touch devices
       and small screens keep native scrolling. */
    const nativeOnly = window.matchMedia("(max-width: 1000px), (pointer: coarse)").matches;

    if (!prefersReducedMotion() && !nativeOnly) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    }

    /* delegated: catches every same-page anchor on the site */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      const link = (e.target as Element)?.closest?.<HTMLAnchorElement>("a[href]");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      scrollToHash(href);
    };
    document.addEventListener("click", onClick);

    /* honour a hash present on first load */
    if (window.location.hash) {
      const hash = window.location.hash;
      requestAnimationFrame(() => setTimeout(() => scrollToHash(hash), 60));
    }

    return () => {
      document.removeEventListener("click", onClick);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
