import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter";
import OwnerEffects from "./OwnerEffects";
import WorksWheel from "@/components/owner/WorksWheel";
import { SHOP, SITE_URL } from "@/lib/site";
import styles from "./owner.module.css";

const OWNER = "Gaurav Tote";
const PHOTO = "/gaurav/gaurav-tote.webp";

export const metadata: Metadata = {
  title: `Meet the Owner — ${OWNER} | ${SHOP.name}`,
  description: `Meet ${OWNER}, founder and owner of ${SHOP.name} — the neighbourhood cycle shop at Kranti Chowk, Nirala Bazar, Chhatrapati Sambhajinagar.`,
  alternates: { canonical: `${SITE_URL}/owner` },
  openGraph: {
    title: `Meet the Owner — ${OWNER}`,
    description: `The person behind ${SHOP.name}.`,
    url: `${SITE_URL}/owner`,
    images: [{ url: PHOTO, alt: OWNER }],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: OWNER,
  jobTitle: "Founder & Owner",
  image: `${SITE_URL}${PHOTO}`,
  url: `${SITE_URL}/owner`,
  worksFor: { "@type": "BicycleStore", name: SHOP.name, url: SITE_URL },
};

/* Photos of Gaurav (public/gaurav) shown on the turning wheel */
const MOMENTS = [
  { title: "Portrait", image: "/gaurav/gaurav-tote.webp" },
  { title: "Close up", image: "/gaurav/close-up.webp" },
  { title: "Golden hour", image: "/gaurav/golden-hour.webp" },
  { title: "Peacock mirror", image: "/gaurav/peacock-mirror.webp" },
  { title: "On the road", image: "/gaurav/on-the-road.webp" },
  { title: "Window light", image: "/gaurav/window-light.webp" },
  { title: "Yellow wall", image: "/gaurav/yellow-wall.webp" },
];

const MARQUEE = [
  "Kids' cycles",
  "Geared cycles",
  "Mountain bikes",
  "City & hybrid",
  "E-bikes",
  "Genuine parts",
  "Expert servicing",
  "Free pickup & drop",
];

const STATS = [
  { to: 2020, suffix: "", label: "Shop founded", plain: true },
  { to: 10, suffix: "", label: "Brands on the floor" },
  { to: 400, suffix: "+", label: "Cycle models" },
  { to: 5, suffix: " km", label: "Free pickup & drop" },
];

const VALUES = [
  {
    title: "Honest advice",
    body: "Walk in, ask anything, and hear what really suits the rider — not just what is on the top shelf.",
    icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  },
  {
    title: "Genuine parts",
    body: "Manufacturer parts for every repair. No substitutes, no shortcuts, and clear prices up front.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Serviced by hand",
    body: "Every cycle that leaves the workshop is checked, tuned and test-ridden before it goes back to its owner.",
    icon: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />,
  },
  {
    title: "Pay in person",
    body: "No card or UPI details online — we call to confirm, and you pay at the store or on delivery.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M16 15h2" />
      </>
    ),
  },
];

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SHOP.name}, ${SHOP.address}`)}`;

const letters = (word: string, offset = 0) =>
  word.split("").map((c, i) => (
    <span key={i} className={styles.letter} style={{ "--i": i + offset } as React.CSSProperties}>
      {c}
    </span>
  ));

export default function OwnerPage() {
  const [first, last] = OWNER.split(" ");
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

      <OwnerEffects />

      <main data-reveal-root>
        {/* ---------------- hero ---------------- */}
        <section className={styles.hero} data-hero id="top">
          <span className={styles.glowA} aria-hidden="true" />
          <span className={styles.glowB} aria-hidden="true" />
          <span className={styles.grid} aria-hidden="true" />

          <div className={styles.heroText}>
            <p className={styles.chip}>
              <span className={styles.chipDot} aria-hidden="true" />
              Founder &amp; Owner
            </p>
            <h1 className={styles.name} aria-label={OWNER}>
              <span className={styles.line} aria-hidden="true">
                {letters(first)}
              </span>
              <span className={`${styles.line} ${styles.outline}`} aria-hidden="true">
                {letters(last, first.length)}
              </span>
            </h1>
            <p className={styles.lede}>
              The rider behind <b>{SHOP.name}</b> — the neighbourhood cycle shop where every customer gets an honest answer and every cycle gets
              looked after, since 2020.
            </p>
            <div className={styles.cta}>
              <a href={SHOP.phoneHref} className={styles.callBtn}>
                Call the shop
              </a>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.ghostBtn}>
                Visit us
              </a>
            </div>
            <a href="#story" className={styles.scrollHint} aria-label="Read the story">
              <span /> Scroll
            </a>
          </div>

          <div className={styles.heroPhoto}>
            <div className={styles.ring} aria-hidden="true">
              <svg viewBox="0 0 400 400">
                <defs>
                  <path id="circ" d="M200,200 m-170,0 a170,170 0 1,1 340,0 a170,170 0 1,1 -340,0" />
                </defs>
                <text>
                  <textPath href="#circ">CYCLE WALA • SINCE 2020 • NIRALA BAZAR • SAMBHAJINAGAR • </textPath>
                </text>
              </svg>
            </div>

            <div className={styles.tilt} data-tilt>
              <div className={styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTO} alt={`${OWNER}, owner of ${SHOP.name}`} width={900} height={1119} fetchPriority="high" />
                <span className={styles.shine} aria-hidden="true" />
              </div>
              <span className={`${styles.float} ${styles.f1}`}>
                <b>Since</b> 2020
              </span>
              <span className={`${styles.float} ${styles.f2}`}>
                <b>10</b> brands
              </span>
              <span className={`${styles.float} ${styles.f3}`}>
                <b>Free</b> pickup &amp; drop
              </span>
            </div>
          </div>
        </section>

        {/* ---------------- ticker ---------------- */}
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.track}>
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i}>
                {m}
                <i />
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- story ---------------- */}
        <section className={styles.story} id="story">
          <div className={styles.storyHead} data-reveal>
            <p className={styles.kicker}>The story</p>
            <h2>
              The person <em>behind</em> the shop
            </h2>
          </div>
          <div className={styles.storyBody}>
            <p data-reveal style={{ "--d": "0ms" } as React.CSSProperties}>
              {SHOP.name} began in 2020 with a simple idea: a neighbourhood shop where anyone — a parent buying a first cycle, a student, a weekend
              rider — can walk in, ask questions and ride away knowing their cycle is sorted.
            </p>
            <p data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              Today the shop stocks more than 400 models from ten brands — Oyekid, Neufman, Schnell, Hero, Keysto, Hercules, Radiant, BSA, Kross
              and more — alongside genuine accessories and a workshop that services every cycle by hand.
            </p>
            <p data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
              Honest prices, genuine parts and a phone that actually gets picked up: that is the promise {first} keeps at Kranti Chowk, Nirala
              Bazar. Order online if you like — you still pay in person, never online.
            </p>
          </div>
        </section>

        {/* ---------------- photo wheel ---------------- */}
        <section className={styles.moments} aria-label="Photos of Gaurav">
          <div className={styles.momentsHead} data-reveal>
            <p className={styles.kicker}>Moments</p>
            <h2>
              A few <em>frames</em> of {first}
            </h2>
          </div>
          <div className={styles.wheelBox} data-reveal>
            <WorksWheel items={MOMENTS} label="Moments" hint="Scroll, drag or use the arrows to turn" />
          </div>
        </section>

        {/* ---------------- numbers ---------------- */}
        <section className={styles.stats} aria-label="Cycle Wala in numbers">
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.stat} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
              <strong data-count={s.to} data-suffix={s.suffix}>
                {s.to}
                {s.suffix}
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        {/* ---------------- values ---------------- */}
        <section className={styles.values}>
          <div className={styles.valuesHead} data-reveal>
            <p className={styles.kicker}>How we work</p>
            <h2>
              What {first} <em>stands for</em>
            </h2>
          </div>
          <div className={styles.valueGrid}>
            {VALUES.map((v, i) => (
              <article key={v.title} className={styles.value} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                <span className={styles.valueIcon}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {v.icon}
                  </svg>
                </span>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- call to action ---------------- */}
        <section className={styles.final} data-reveal>
          <span className={styles.finalGlow} aria-hidden="true" />
          <p className={styles.kicker}>Say hello</p>
          <h2>
            Come say hi to <em>{first}</em>
          </h2>
          <p className={styles.finalLede}>
            {SHOP.hours}. {SHOP.address}.
          </p>
          <div className={styles.cta}>
            <a href={SHOP.phoneHref} className={styles.callBtn}>
              Call {SHOP.phone}
            </a>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.ghostBtn}>
              Get directions
            </a>
            <Link href="/#shop" className={styles.ghostBtn}>
              Browse cycles
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
    </div>
  );
}
