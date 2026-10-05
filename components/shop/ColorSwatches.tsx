"use client";

import type { ProductVariant } from "@/lib/products";
import styles from "./ColorSwatches.module.css";

/* Round colour dots for cycles sold in several colourways. The swatch is the
   exact one oyekidbikes.com shows (a solid or a two-tone gradient). Clicking a
   dot only selects it — the parent decides what the choice changes. */
export default function ColorSwatches({
  variants,
  selected,
  onSelect,
  size = "md",
}: {
  variants: ProductVariant[];
  selected: string | undefined;
  onSelect: (color: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className={`${styles.row} ${size === "sm" ? styles.sm : ""}`} role="radiogroup" aria-label="Colour">
      {variants.map((v) => {
        const on = v.color === selected;
        return (
          <button
            key={v.color}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={v.inStock ? v.color : `${v.color} (out of stock)`}
            title={v.color}
            className={`${styles.dot} ${on ? styles.on : ""} ${v.inStock ? "" : styles.out}`}
            onClick={() => onSelect(v.color)}
          >
            <span className={styles.fill} style={{ background: v.swatch }} />
          </button>
        );
      })}
    </div>
  );
}
