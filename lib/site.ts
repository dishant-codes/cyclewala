/* Single source of truth for site-wide constants.
   Set NEXT_PUBLIC_SITE_URL in Vercel once the domain exists —
   everything (sitemap, robots, OG, JSON-LD) follows automatically. */

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const SITE_URL = configuredSiteUrl || "http://localhost:3000";

if (process.env.NODE_ENV === "production" && !configuredSiteUrl) {
  console.warn(
    "[site] NEXT_PUBLIC_SITE_URL is not set — the sitemap and link previews will point at http://localhost:3000. Set it BEFORE building."
  );
}

export const SHOP = {
  name: "Cycle Wala",
  tagline: "Store · Accessories · Services",
  description:
    "Your neighbourhood bicycle shop — new cycles, genuine accessories and expert servicing.",
  /* Left empty on purpose: nothing is shown or published until the shop
     supplies a real address. Set these and they appear in the Connect
     section and the search-engine listing automatically. */
  email: "",
  phone: "+91 92096 73730",
  phoneHref: "tel:+919209673730",
  address:
    "Kranti Chowk, opp. to Satya Electrical Shop, Paithan Gate, Sanmitra Colony, Nirala Bazar, Chhatrapati Sambhajinagar, Maharashtra 431001",
  hours: "Tue–Sun · 11am–9pm (Closed Mondays)",
  /* the shop's real profile URLs (full https:// links) — empty until confirmed */
  instagram: "https://www.instagram.com/cyclewala___/",
  facebook: "",
};

/* Search-engine copy. SEO_KEYWORDS are the five tags the shop wants to be found for. */
export const SEO_TITLE = `${SHOP.name} — Cycle Shop in Chhatrapati Sambhajinagar | Kids, Geared & MTB Cycles, Service`;
export const SEO_DESCRIPTION =
  "Cycle Wala, Nirala Bazar — buy kids cycles, geared & mountain bikes, e-bikes and accessories from Oyekid, Hero, Hercules, Neufman, BSA, Kross, Allwyn, Firefox, Corrado and more. Expert cycle service with free pickup & drop within 5 km.";
export const SEO_KEYWORDS = [
  "cycle shop in Chhatrapati Sambhajinagar",
  "kids cycles",
  "gear cycles and mountain bikes",
  "cycle repair and service",
  "Cycle Wala",
];

export const SAME_AS = [SHOP.instagram, SHOP.facebook].filter(Boolean);

/* Address broken into the parts search engines want (all from SHOP.address) */
export const ADDRESS_PARTS = {
  streetAddress: "Kranti Chowk, opp. to Satya Electrical Shop, Paithan Gate, Sanmitra Colony, Nirala Bazar",
  addressLocality: "Chhatrapati Sambhajinagar",
  addressRegion: "Maharashtra",
  postalCode: "431001",
  addressCountry: "IN",
};
