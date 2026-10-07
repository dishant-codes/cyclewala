import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import AccountView from "./AccountView";
import { SHOP } from "@/lib/site";
import styles from "./account.module.css";

/* A personal page — kept out of search results. */
export const metadata: Metadata = {
  title: `My account — ${SHOP.name}`,
  robots: { index: false, follow: false },
};

export default function AccountPage() {
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
        <AccountView />
      </main>

      <SiteFooter />
    </div>
  );
}
