"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { SHOP } from "@/lib/site";
import StarRating from "@/components/ui/StarRating";
import ColorSwatches from "@/components/shop/ColorSwatches";
import { discountPct, optionValues, selectOption, shownFor, type OptionKey, type Selection } from "@/lib/variants";
import styles from "./ProductModal.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  kids: "Kids' Cycles",
  mtb: "Mountain Cycles",
  hybrid: "City & Hybrid",
  ebike: "E-Bikes",
};

const OPTION_LABEL: Record<"size" | "type", string> = { size: "Wheel size", type: "Setup" };

export default function ProductModal({
  product,
  initialSelection,
  onClose,
}: {
  product: Product;
  initialSelection?: Selection;
  onClose: () => void;
}) {
  const { addToCart } = useCart();
  const [sel, setSel] = useState<Selection>(initialSelection ?? {});
  const shown = shownFor(product, sel);
  const off = discountPct(shown.price, shown.regularPrice);
  const current: Selection = { color: shown.color, size: shown.size, type: shown.type };
  const pick = (key: OptionKey, value: string) => setSel(selectOption(product, current, key, value));

  /* Rendered into <body>, not inside the shop section: a stacked section is
     its own layer, so a modal left inside it could be painted over by the
     sections that slide up after it. Only ever mounted after a click, so
     `document` always exists. */
  return createPortal(
    <>
      <button className={styles.scrim} aria-label="Close" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${product.brand} ${product.model}`}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className={styles.body}>
          <div className={styles.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown.image} alt={`${product.brand} ${product.model}${shown.color ? ` – ${shown.color}` : ""}`} />
            <span className={shown.inStock ? styles.stockBadge : styles.stockBadgeOut}>
              {shown.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className={styles.info}>
            <p className={styles.category}>{CATEGORY_LABEL[product.category]}</p>
            <p className={styles.brand}>{product.brand}</p>
            <h2 className={styles.model}>{product.model}</h2>
            {product.tagline && <p className={styles.tagline}>{product.tagline}</p>}
            {product.rating > 0 && (
              <div className={styles.rating}>
                <StarRating value={product.rating} />
              </div>
            )}
            <p className={styles.sizes}>Sizes: {product.sizes}</p>

            {product.variants && product.variants.length > 0 && (
              <div className={styles.colors}>
                <p className={styles.colorsLabel}>
                  Colour: <strong>{shown.color}</strong>
                </p>
                <ColorSwatches variants={[...new Map(product.variants.map((v) => [v.color, v])).values()]} selected={shown.color} onSelect={(c) => pick("color", c)} />
              </div>
            )}

            {(["size", "type"] as const).map((key) => {
              const values = optionValues(product, key);
              if (values.length < 2) return null;
              return (
                <div className={styles.colors} key={key}>
                  <p className={styles.colorsLabel}>
                    {OPTION_LABEL[key]}: <strong>{shown[key]}</strong>
                  </p>
                  <div className={styles.chips} role="radiogroup" aria-label={OPTION_LABEL[key]}>
                    {values.map((v) => (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={v === shown[key]}
                        className={v === shown[key] ? styles.chipOn : styles.chip}
                        onClick={() => pick(key, v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {product.description && <p className={styles.desc}>{product.description}</p>}

            <ul className={styles.specs}>
              {product.specs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

          </div>
        </div>
          <div className={styles.foot}>
            <span className={shown.price === null ? styles.priceTbc : styles.price}>
              {shown.price === null ? (
                "Add: price"
              ) : (
                <>
                  ₹{shown.price.toLocaleString("en-IN")}
                  {off > 0 && shown.regularPrice !== null && (
                    <>
                      <s className={styles.mrp}>₹{shown.regularPrice.toLocaleString("en-IN")}</s>
                      <span className={styles.off}>{off}% off</span>
                    </>
                  )}
                </>
              )}
            </span>
            <div className={styles.ctaRow}>
              <button
                className={styles.addBtn}
                disabled={!shown.inStock}
                onClick={() =>
                  addToCart({
                    slug: product.slug,
                    color: shown.color,
                    size: shown.size,
                    type: shown.type,
                    brand: product.brand,
                    model: product.model,
                    image: shown.image,
                    price: shown.price,
                  })
                }
              >
                Add to Cart
              </button>
              <a className={styles.askBtn} href={SHOP.phoneHref}>
                Ask about this →
              </a>
            </div>
          </div>
      </div>
    </>,
    document.body
  );
}
