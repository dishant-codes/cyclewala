import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Caveat, Baloo_2 } from "next/font/google";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import { LanguageProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { SITE_URL, SHOP, SAME_AS, ADDRESS_PARTS } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-script",
});

/* Rounded display font — closer to the Cycle Wala logo's letterforms than
   Inter, used for the brand wordmark treatments (tunnel-intro text). */
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-brand",
});

const DESCRIPTION = SHOP.description;

/* Preview image for link shares (WhatsApp, Facebook, Google) — the shop's own photo */
const SHARE_IMAGE = { url: "/images/hero-cycle.jpg", alt: `${SHOP.name} — bicycle shop` };

export const viewport: Viewport = {
  themeColor: "#4CAF2E",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SHOP.name} — ${SHOP.tagline}`,
    template: "%s",
  },
  description: DESCRIPTION,
  openGraph: {
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SHOP.name,
    type: "website",
    locale: "en_IN",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description: DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
};

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BicycleStore",
  name: SHOP.name,
  description: SHOP.description,
  ...(SHOP.email ? { email: SHOP.email } : {}),
  telephone: SHOP.phone,
  address: { "@type": "PostalAddress", ...ADDRESS_PARTS },
  openingHours: "Tu-Su 11:00-21:00",
  url: SITE_URL,
  image: `${SITE_URL}${SHARE_IMAGE.url}`,
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${caveat.variable} ${baloo.variable}`}
    >
      <body>
        <LanguageProvider>
          <CartProvider>
            <SmoothScroll>{children}</SmoothScroll>
            <CartDrawer />
          </CartProvider>
        </LanguageProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </body>
    </html>
  );
}
