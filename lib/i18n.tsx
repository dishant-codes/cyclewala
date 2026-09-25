"use client";

/*
 * Centralised store for every user-facing string on the site.
 *
 * English only — the reference this was ported from supported an EN/FR
 * toggle; Cycle Wala is a single-language local shop site, so `fr` is kept
 * as an optional field (unused) rather than removing the lookup machinery
 * every section still calls into.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fr";

type Entry = { en: string; fr?: string };

export const DICT: Record<string, Entry> = {
  /* ---------------- nav ---------------- */
  "nav.home": { en: "Home" },
  "nav.about": { en: "About Us" },
  "nav.shop": { en: "Shop" },
  "nav.categories": { en: "Categories" },
  "nav.browseCategories": { en: "Browse categories" },
  "nav.viewAllCategories": { en: "View All Categories" },
  "nav.services": { en: "Services" },
  "nav.gallery": { en: "Gallery" },
  "nav.contact": { en: "Contact" },
  "nav.call": { en: "Call Now" },
  "nav.menu": { en: "Open menu" },
  "nav.close": { en: "Close menu" },

  /* ---------------- hero ---------------- */
  "hero.kicker": { en: "Store · Accessories · Services" },
  "hero.h1a": { en: "Rides that feel" },
  "hero.h1aEm": { en: "alive." },
  "hero.h1b": { en: "Service you can" },
  "hero.h1bEm": { en: "trust." },
  "hero.sub": {
    en: "Your neighbourhood bicycle shop — new cycles, genuine accessories and expert servicing, for every kind of rider.",
  },
  "hero.cta1": { en: "Browse the Shop" },
  "hero.cta2": { en: "Call the Shop" },

  /* ---------------- about ---------------- */
  "about.eyebrow": { en: "About Us" },
  "about.h2a": { en: "Welcome to" },
  "about.h2Em": { en: "Cycle Wala" },
  "about.lede": {
    en: "Your neighbourhood bicycle shop — we're more than just a cycle shop, we're a local team dedicated to honest service, genuine parts and cycles that fit the rider.",
  },
  "about.journey": { en: "Our Journey" },

  /* ---------------- shop ---------------- */
  "shop.eyebrow": { en: "The Shop" },
  "shop.h2a": { en: "Cycles, sized and" },
  "shop.h2Em": { en: "ready." },
  "shop.lede": {
    en: "A curated look at what's in the shop — real models, real specs, straight from our supplier catalogues.",
  },
  "shop.addPrice": { en: "Add: price" },
  "shop.ask": { en: "Ask about this →" },
  "shop.all": { en: "All Cycles" },
  "shop.loading": { en: "Curating cycles…" },

  /* ---------------- support (was: "we care") ---------------- */
  "support.eyebrow": { en: "After-Sales Support" },
  "support.h2": { en: "We Care" },
  "support.lede": {
    en: "Real support after you buy — genuine parts, honest advice, and a shop that picks up the phone.",
  },
  "support.helpLabel": { en: "Need Help?" },
  "support.hoursLabel": { en: "Open" },
  "support.visitLabel": { en: "Visit Us" },
  "support.visitValue": { en: "Kranti Chowk, Paithan Gate, Nirala Bazar" },
  "support.directions": { en: "Get Directions" },
  "support.fitLabel": { en: "Every Cycle" },
  "support.fitValue": { en: "Sized & checked before it leaves the shop" },

  /* ---------------- services ---------------- */
  "services.eyebrow": { en: "Services" },
  "services.h2": { en: "Professional Cycle Services" },
  "services.lede": {
    en: "Straightforward tune-ups and repairs, done by hand — pick a service and send us a request.",
  },

  /* ---------------- gallery ---------------- */
  "gallery.eyebrow": { en: "The Shop Floor" },
  "gallery.h2a": { en: "A look inside" },
  "gallery.h2Em": { en: "the shop" },
  "gallery.lede": {
    en: "Riders picking up their new cycles, right from the shop floor.",
  },
  "gallery.alt": { en: "A photo from inside Cycle Wala" },
  "gallery.frames": { en: "Photos" },
  "gallery.hint": { en: "Scroll to browse" },

  /* ---------------- connect ---------------- */
  "connect.eyebrow": { en: "Visit Us" },
  "connect.h2a": { en: "Ready for your" },
  "connect.h2Em": { en: "next ride?" },
  "connect.lede": {
    en: "Come by the store, book a service, or ask us anything — new riders and regulars are always welcome.",
  },
  "connect.cta": { en: "Call the Shop" },
  "connect.visitLabel": { en: "Visit Us" },
  "connect.callLabel": { en: "Call Us" },
  "connect.hoursLabel": { en: "Open Hours" },
  "connect.navHeading": { en: "Quick Navigation" },
  "connect.categoriesHeading": { en: "Categories" },
  "connect.contactHeading": { en: "Contact Us" },
  "connect.credit": { en: "A shop by" },
  "connect.top": { en: "Back to top ↑" },

  /* ---------------- 404 ---------------- */
  "nf.label": { en: "404 — NOT FOUND" },
  "nf.h1": { en: "This page rolled" },
  "nf.h1Em": { en: "off the road." },
  "nf.cta": { en: "Back to the shop →" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => DICT[k]?.en ?? k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "fr") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount (avoids an SSR mismatch)
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("lang", l);
    } catch {
      /* private mode — the choice simply won't persist */
    }
    document.documentElement.lang = l;
  };

  const t = (k: string) => DICT[k]?.[lang] ?? DICT[k]?.en ?? k;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

/** Pick a translated field off a content record: `L(lang, item, "summary")`
 *  returns `item.fr.summary` when available, else the English original. */
export function L<T extends { fr?: Record<string, unknown> }>(
  lang: Lang,
  item: T,
  field: keyof T & string
): string {
  if (lang === "fr" && item.fr && typeof item.fr[field] === "string") {
    return item.fr[field] as string;
  }
  return item[field] as unknown as string;
}
