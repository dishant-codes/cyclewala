import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import PrivacyEffects from "./PrivacyEffects";
import { SHOP, SITE_URL } from "@/lib/site";
import styles from "./privacy.module.css";

const UPDATED = "5 October 2026";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SHOP.name}`,
  description: `How ${SHOP.name} collects, uses and protects your personal information when you browse the shop, place an order or book a service.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode; variant?: "contact" }[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <p>
        {SHOP.name} is a neighbourhood bicycle shop at {SHOP.address}. This website lets you look at our cycles, put them in a
        list, send us an order, and request a service. This policy explains what happens to the personal information you give us
        while you do that.
      </p>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p>We only collect what we need to serve you:</p>
        <ul>
          <li>
            <b>When you place an order:</b> your name, mobile number and delivery or pickup address, an optional note, and the cycles
            you chose (brand, model, colour, wheel size and setup).
          </li>
          <li>
            <b>When you book a service:</b> your name, mobile number, address (for pickup & drop), the cycle that needs work, a
            preferred date and an optional note.
          </li>
          <li>
            <b>Your cart:</b> the list you build is saved only in your own browser (local storage) so it is still there if you come
            back. We do not receive it until you press Place Order.
          </li>
          <li>
            <b>If you create an account:</b> your name, email address and a password (we keep only a scrambled, salted version of it — never the password
            itself), plus the cycles you save to your wishlist.
          </li>
          <li>
            <b>Technical information:</b> like most websites, our hosting provider records standard server logs (such as your IP
            address and browser type), and our order form notes your IP address briefly to stop spam and abuse.
          </li>
        </ul>
        <p>
          You do not need an account to browse or order, and we do not ask for card, UPI or bank details — see <a href="#payments">Payments</a>.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <ul>
        <li>To call or message you to confirm your order or service request, and to arrange pickup or delivery.</li>
        <li>To prepare your cycle, keep a record of what you bought or had repaired, and help you if something needs attention later.</li>
        <li>To keep the website secure and working.</li>
      </ul>
    ),
  },
  {
    id: "not",
    title: "What we do not do",
    body: (
      <ul>
        <li>We do not sell your information or share it with advertisers.</li>
        <li>We do not use advertising or analytics trackers on this website.</li>
        <li>We do not send marketing messages unless you ask us to.</li>
      </ul>
    ),
  },
  {
    id: "payments",
    title: "Payments",
    body: (
      <p>
        Orders placed on this site are <b>pay at store / cash on delivery</b>. Nothing is charged online, and we never see or store
        any card, UPI or bank details through this website. Payment happens in person when you collect or receive your cycle.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Who can see your information",
    body: (
      <>
        <p>Your details are seen by the shop team who handle orders and service. We also rely on a few service providers:</p>
        <ul>
          <li>our website hosting and data-storage provider, who store the information on our behalf;</li>
          <li>a delivery person or courier, only if your order is being delivered and only the details needed to deliver it;</li>
          <li>authorities, only where the law requires us to share information.</li>
        </ul>
        <p>
          Links to other sites (Instagram, Google Maps, WhatsApp) take you away from our website; those services have their own
          privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <p>
        Visitors do not get tracking cookies. The website saves your cart and a few display preferences in your browser&apos;s local
        storage so they are remembered on your device. One sign-in cookie is used if you choose to sign in to your customer account (it keeps you signed in and is removed when you sign out), and another only by shop staff in the admin area. You can clear
        local storage and cookies at any time from your browser settings.
      </p>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: (
      <p>
        We keep order and service records for as long as we need them to look after your purchase, answer questions and keep our
        own business records. After that they are deleted or made anonymous. You can ask us to delete your details sooner (see
        below).
      </p>
    ),
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: (
      <p>
        We use reasonable technical and practical measures to protect your information, including limiting who can open the admin
        area and checking every order on our server. No website or storage system is completely risk-free, so please do not send us
        anything sensitive in the order note.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices",
    body: (
      <>
        <p>You can ask us at any time to:</p>
        <ul>
          <li>tell you what details we hold about you;</li>
          <li>correct anything that is wrong;</li>
          <li>delete your details, unless we need to keep something to meet a legal or accounting duty.</li>
        </ul>
        <p>Call or visit us (details below) and we will take care of it.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        We sell cycles for children, but orders and service requests should be placed by a parent or guardian. We do not knowingly
        collect personal information from children.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>If we change how we handle your information we will update this page and the date at the top.</p>,
  },
  {
    id: "contact",
    variant: "contact",
    title: "Contact us",
    body: (
      <>
        <p>Questions about this policy or your information? Get in touch:</p>
        <ul>
          <li>
            <b>Phone:</b> <a href={SHOP.phoneHref}>{SHOP.phone}</a>
          </li>
          {SHOP.email && (
            <li>
              <b>Email:</b> <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
            </li>
          )}
          <li>
            <b>Visit:</b> {SHOP.address}
          </li>
          <li>
            <b>Hours:</b> {SHOP.hours}
          </li>
        </ul>
      </>
    ),
  },
];

const PROMISES = [
  {
    title: "Pay in person",
    body: "No card or UPI details are ever asked for online.",
    icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M16 15h2" /></svg>,
  },
  {
    title: "Never sold",
    body: "Your details are not sold or shared with advertisers.",
    icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>,
  },
  {
    title: "No ad trackers",
    body: "No advertising or analytics trackers on this website.",
    icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" /></svg>,
  },
  {
    title: "Yours to delete",
    body: "Ask us and we will remove your details.",
    icon: <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <header className={styles.bar}>
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/cyclewala-logo.png" alt={SHOP.name} />
        </Link>
        <Link href="/#shop" className={styles.back}>
          ← Back to the shop
        </Link>
      </header>

      <PrivacyEffects />
      <main className={styles.page} id="top">
        <div className={styles.hero}>
          <span className={styles.blob1} aria-hidden="true" />
          <span className={styles.blob2} aria-hidden="true" />
          <span className={styles.shield} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <p className={styles.eyebrow}>Legal</p>
          <h1>
            Privacy <em>Policy</em>
          </h1>
          <p className={styles.updated}>Last updated {UPDATED}</p>
          <p className={styles.lede}>
            Plain-English summary: we only ask for what we need to deliver your cycle or service, we don&apos;t sell your details,
            and you pay in person — never online.
          </p>
        </div>

        <ul className={styles.promises}>
          {PROMISES.map((p) => (
            <li key={p.title}>
              <span className={styles.promiseIcon}>{p.icon}</span>
              <b>{p.title}</b>
              <small>{p.body}</small>
            </li>
          ))}
        </ul>

        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="On this page">
            <b>On this page</b>
            {SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} data-toc={s.id}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            ))}
          </nav>

          <article className={styles.article} data-reveal-root>
            {SECTIONS.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                data-reveal
                className={s.variant === "contact" ? `${styles.section} ${styles.contact}` : styles.section}
              >
                <h2>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                {s.body}
                {s.variant === "contact" && (
                  <div className={styles.contactCta}>
                    <a href={SHOP.phoneHref}>📞 Call {SHOP.phone}</a>
                    <Link href="/#shop">Back to the shop →</Link>
                  </div>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
