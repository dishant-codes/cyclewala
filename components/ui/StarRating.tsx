"use client";

/* Small inline star-rating display — illustrative values only (see
   data/products-seed.ts). No external icon library needed. */
export default function StarRating({ value }: { value: number }) {
  return (
    <div aria-label={`${value.toFixed(1)} out of 5`} style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`star-${i}-${value}`}>
                <stop offset={`${fill * 100}%`} stopColor="#F2A93B" />
                <stop offset={`${fill * 100}%`} stopColor="#E3E1DA" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.5l2.47 5.5 5.98.55-4.53 4.02 1.37 5.93L10 14.77l-5.29 2.73 1.37-5.93L1.55 7.55l5.98-.55z"
              fill={`url(#star-${i}-${value})`}
            />
          </svg>
        );
      })}
      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)", marginLeft: 4 }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}
