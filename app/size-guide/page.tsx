import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import SizeGuide from "./SizeGuide";
import { SHOP, SITE_URL } from "@/lib/site";
import styles from "./size-guide.module.css";

export const metadata: Metadata = {
  title: `Kids' Cycle Size Guide — Age & Height Chart | ${SHOP.name}`,
  description: `Find the right cycle size for your child: wheel size (12T to 26T) by age and height, a quick "find my size" tool and fitting tips from ${SHOP.name}, Chhatrapati Sambhajinagar.`,
  alternates: { canonical: `${SITE_URL}/size-guide` },
};

export default function SizeGuidePage() {
  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/cyclewala-logo.png" alt={SHOP.name} />
        </Link>
        <Link href="/#shop" className={styles.back}>
          ← Back to the shop
        </Link>
      </header>

      <main className={styles.main}>
        <SizeGuide phone={SHOP.phone} phoneHref={SHOP.phoneHref} />
      </main>

      <SiteFooter />
    </div>
  );
}
