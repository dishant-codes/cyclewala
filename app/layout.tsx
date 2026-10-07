import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Caveat, Baloo_2 } from "next/font/google";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import { LanguageProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { CustomerProvider } from "@/lib/customer";
import { SITE_URL, SHOP, SAME_AS, ADDRESS_PARTS, SEO_KEYWORDS, SEO_TITLE, SEO_DESCRIPTION } from "@/lib/site";
import { SERVICES } from "@/data/services";
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

const DESCRIPTION = SEO_DESCRIPTION;

/* Preview image for link shares (WhatsApp, Facebook, Google) — the shop's own photo */
const SHARE_IMAGE = { url: "/images/hero-cycle.jpg", alt: `${SHOP.name} — bicycle shop` };

export const viewport: Viewport = {
  themeColor: "#4CAF2E",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s",
  },
  description: DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: SHOP.name,
  authors: [{ name: SHOP.name, url: SITE_URL }],
  category: "shopping",
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: true, address: true, email: false },
  openGraph: {
    title: SEO_TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SHOP.name,
    type: "website",
    locale: "en_IN",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "21:00",
    },
  ],
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash",
  areaServed: { "@type": "City", name: ADDRESS_PARTS.addressLocality },
  keywords: SEO_KEYWORDS.join(", "),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Cycle servicing",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      priceCurrency: "INR",
      price: s.price,
      itemOffered: { "@type": "Service", name: s.title, description: s.subtitle },
    })),
  },
  url: SITE_URL,
  image: `${SITE_URL}${SHARE_IMAGE.url}`,
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SHOP.name,
  url: SITE_URL,
  inLanguage: "en-IN",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${caveat.variable} ${baloo.variable}`}
    >
      <body>
        <LanguageProvider>
          <CustomerProvider>
            <CartProvider>
              <SmoothScroll>{children}</SmoothScroll>
              <CartDrawer />
            </CartProvider>
          </CustomerProvider>
        </LanguageProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
