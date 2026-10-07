"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadProducts } from "@/lib/catalogue";
import styles from "./size-guide.module.css";

/* Wheel size → who it suits. These are Oyekid's published age and height bands (the brand whose kids'
   cycles we stock by age); other brands size their frames differently, which the page says. */
const SIZES = [
  { id: "12T", age: "2–3 years", ageMid: 2.5, hMin: 80, hMax: 100 },
  { id: "14T", age: "3–5 years", ageMid: 4, hMin: 90, hMax: 110 },
  { id: "16T", age: "5–7 years", ageMid: 6, hMin: 110, hMax: 120 },
  { id: "20T", age: "7–9 years", ageMid: 8, hMin: 120, hMax: 130 },
  { id: "24T", age: "10–15 years", ageMid: 12.5, hMin: 130, hMax: 160 },
  { id: "26T", age: "15+ years", ageMid: 17, hMin: 160, hMax: 190 },
] as const;

type Size = (typeof SIZES)[number];

/** how tall each figure is drawn, in cm (the middle of its band) */
const figureCm = (s: Size) => (s.id === "26T" ? 172 : (s.hMin + s.hMax) / 2);
const mid = (s: Size) => (s.hMin + s.hMax) / 2;

function recommend(heightCm: number | null, ageYears: number | null): { best: Size; also: Size[] } | { below: true } | null {
  if (heightCm !== null) {
    if (heightCm < SIZES[0].hMin) return { below: true };
    const fits = SIZES.filter((s) => heightCm >= s.hMin && heightCm <= s.hMax);
    const pool = fits.length ? fits : [SIZES[SIZES.length - 1]];
    const best = [...pool].sort((a, b) => Math.abs(mid(a) - heightCm) - Math.abs(mid(b) - heightCm))[0];
    return { best, also: pool.filter((s) => s.id !== best.id) };
  }
  if (ageYears !== null) {
    if (ageYears < 2) return { below: true };
    const best = [...SIZES].sort((a, b) => Math.abs(a.ageMid - ageYears) - Math.abs(b.ageMid - ageYears))[0];
    return { best, also: [] };
  }
  return null;
}

/* a simple, friendly figure — head, body, arms, legs — drawn to the given height */
function Kid({ cm, on }: { cm: number; on: boolean }) {
  const h = (cm / 175) * 230; // px, so a 175 cm rider is 230 px tall
  const w = h * 0.42;
  return (
    <svg
      viewBox="0 0 100 240"
      aria-hidden="true"
      className={on ? styles.kidOn : styles.kid}
      preserveAspectRatio="none"
      style={{ "--fh": `${h}px`, "--fw": `${w}px` } as React.CSSProperties}
    >
      <circle cx="50" cy="22" r="17" />
      <path d="M26 52c0-6 5-10 12-10h24c7 0 12 4 12 10v70c0 4-3 7-7 7H33c-4 0-7-3-7-7z" />
      <path d="M26 56 10 112c-1 4 2 7 5 6 3 0 5-2 6-5l14-44zM74 56l16 56c1 4-2 7-5 6-3 0-5-2-6-5L65 69z" />
      <path d="M34 126h14v104c0 5-3 8-7 8s-7-3-7-8zM52 126h14v104c0 5-3 8-7 8s-7-3-7-8z" />
    </svg>
  );
}

export default function SizeGuide({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [picked, setPicked] = useState<Size["id"]>("14T");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadProducts()
      .then((all) => {
        const n: Record<string, number> = {};
        for (const p of all) if (p.brand === "Oyekid" && p.group) n[p.group] = (n[p.group] ?? 0) + 1;
        setCounts(n);
      })
      .catch(() => {});
  }, []);

  const h = height.trim() === "" ? null : Number(height);
  const a = age.trim() === "" ? null : Number(age);
  const result = useMemo(
    () => recommend(h !== null && Number.isFinite(h) && h > 0 ? h : null, a !== null && Number.isFinite(a) && a > 0 ? a : null),
    [h, a]
  );

  const size = SIZES.find((s) => s.id === picked) ?? SIZES[1];
  const shopLink = (s: Size) => `/?brand=Oyekid&group=${s.id}#shop`;

  return (
    <>
      <section className={styles.hero}>
        <p className={styles.kicker}>Size guide</p>
        <h1>
          Find the <em>right size</em> for your child
        </h1>
        <p className={styles.lede}>
          Cycles are sized by wheel (12T, 14T, 16T …), and the right one depends on how tall your child is — more than on their age. Tap a size
          below, or tell us a height and we&apos;ll pick it for you.
        </p>
      </section>

      {/* ---------------- the line-up ---------------- */}
      <section className={styles.stage} aria-label="Cycle sizes by age and height">
        <div className={styles.ruler} aria-hidden="true">
          {[160, 140, 120, 100, 80].map((cm) => (
            <span key={cm} style={{ "--y": `${(cm / 175) * 230}px` } as React.CSSProperties}>
              {cm} cm
            </span>
          ))}
        </div>

        <div className={styles.row} role="tablist" aria-label="Wheel size">
          {SIZES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={picked === s.id}
              className={picked === s.id ? styles.figOn : styles.fig}
              style={{ "--i": i } as React.CSSProperties}
              onClick={() => setPicked(s.id)}
            >
              <span className={styles.bubble}>{s.id}</span>
              <Kid cm={figureCm(s)} on={picked === s.id} />
              <span className={styles.figAge}>{s.age}</span>
            </button>
          ))}
        </div>
        <div className={styles.ground} aria-hidden="true" />
      </section>

      <section className={styles.detail} aria-live="polite">
        <div className={styles.detailMain}>
          <p className={styles.detailSize}>{size.id}</p>
          <dl>
            <div>
              <dt>Age</dt>
              <dd>{size.age}</dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>
                {size.hMin}–{size.id === "26T" ? "160+" : size.hMax} cm
              </dd>
            </div>
            <div>
              <dt>Wheel</dt>
              <dd>{size.id.replace("T", "")} inch</dd>
            </div>
          </dl>
        </div>
        <Link href={shopLink(size)} className={styles.cta}>
          {counts[size.id] ? `See ${counts[size.id]} ${size.id} cycles` : `See ${size.id} cycles`} →
        </Link>
      </section>

      {/* ---------------- find my size ---------------- */}
      <section className={styles.finder}>
        <div>
          <h2>Find my size</h2>
          <p>Enter your child&apos;s height — or just their age if you don&apos;t have it — and we&apos;ll suggest a wheel size.</p>
        </div>
        <div className={styles.fields}>
          <label>
            Height (cm)
            <input type="number" inputMode="decimal" min={40} max={220} placeholder="e.g. 108" value={height} onChange={(e) => setHeight(e.target.value)} />
          </label>
          <label>
            or Age (years)
            <input type="number" inputMode="decimal" min={0} max={30} placeholder="e.g. 4" value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
        </div>

        {result && (
          <div className={styles.answer} role="status">
            {"below" in result ? (
              <p>
                That&apos;s smaller than our smallest sized cycle (12T starts at 80 cm). For little ones we have balance bikes —{" "}
                <Link href="/?brand=Oyekid&group=Balance%20Bike#shop">see balance bikes</Link> or call us on <a href={phoneHref}>{phone}</a>.
              </p>
            ) : (
              <>
                <p>
                  Best fit: <b>{result.best.id}</b> — ages {result.best.age}, {result.best.hMin}–{result.best.id === "26T" ? "160+" : result.best.hMax} cm.
                  {result.also.length > 0 && (
                    <>
                      {" "}
                      Also fits: {result.also.map((s) => s.id).join(", ")} — pick the smaller for a child who&apos;s new to cycling, the larger for a confident rider.
                    </>
                  )}
                </p>
                <div className={styles.answerBtns}>
                  <Link href={shopLink(result.best)} className={styles.cta}>
                    Show {result.best.id} cycles →
                  </Link>
                  <button
                    type="button"
                    className={styles.ghost}
                    onClick={() => {
                      setPicked(result.best.id);
                      document.querySelector("[role=tablist]")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    Show on the chart
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ---------------- the chart as a table ---------------- */}
      <section className={styles.tableWrap}>
        <h2>Size chart</h2>
        <div className={styles.scroller}>
          <table>
            <thead>
              <tr>
                <th>Wheel size</th>
                <th>Age</th>
                <th>Height</th>
                <th aria-label="Browse" />
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s.id} className={picked === s.id ? styles.rowOn : undefined}>
                  <th scope="row">{s.id}</th>
                  <td>{s.age}</td>
                  <td>
                    {s.hMin}–{s.id === "26T" ? "160+" : s.hMax} cm
                  </td>
                  <td>
                    <Link href={shopLink(s)}>View cycles</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          These bands follow Oyekid&apos;s published size guide for its kids&apos; cycles. Sizes overlap — a tall 3-year-old and a small 5-year-old can both
          suit 14T — so go by height first, then by how confident the rider is. Other brands (Hero, Hercules, Neufman and the rest) size their frames
          differently: tell us the rider&apos;s height and we&apos;ll match the right model.
        </p>
      </section>

      {/* ---------------- tips ---------------- */}
      <section className={styles.tips}>
        <h2>Getting the fit right</h2>
        <ol>
          <li>
            <b>Measure height, not age.</b>
            <span>Stand your child barefoot against a wall, flat-footed, and mark the top of the head. That number is what the chart uses.</span>
          </li>
          <li>
            <b>Feet should reach the ground.</b>
            <span>Seated on the saddle, a beginner should be able to put the balls of both feet down. The saddle and handlebar are adjustable for growth.</span>
          </li>
          <li>
            <b>Don&apos;t buy a size to &ldquo;grow into&rdquo;.</b>
            <span>A cycle that&apos;s too big is harder to steer and brake, which is how falls happen. One size up at most, and only if the feet still reach.</span>
          </li>
          <li>
            <b>Try it in the shop.</b>
            <span>Every cycle is sized and checked before it leaves the shop — bring your child and we&apos;ll set the seat and bars for them.</span>
          </li>
        </ol>
        <div className={styles.help}>
          <p>Not sure? We&apos;re happy to help — call or visit.</p>
          <a href={phoneHref} className={styles.cta}>
            Call {phone}
          </a>
        </div>
      </section>
    </>
  );
}
