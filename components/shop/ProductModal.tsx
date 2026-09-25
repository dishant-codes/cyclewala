"use client";

import { createPortal } from "react-dom";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { SHOP } from "@/lib/site";
import StarRating from "@/components/ui/StarRating";
import styles from "./ProductModal.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  kids: "Kids' Cycles",
  mtb: "Mountain Cycles",
  hybrid: "City & Hybrid",
};

export default function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart } = useCart();

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
            <img src={product.image} alt={`${product.brand} ${product.model}`} />
            <span className={product.inStock ? styles.stockBadge : styles.stockBadgeOut}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className={styles.info}>
            <p className={styles.category}>{CATEGORY_LABEL[product.category]}</p>
            <p className={styles.brand}>{product.brand}</p>
            <h2 className={styles.model}>{product.model}</h2>
            <div className={styles.rating}>
              <StarRating value={product.rating} />
            </div>
            <p className={styles.sizes}>Sizes: {product.sizes}</p>

            <ul className={styles.specs}>
              {product.specs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <div className={styles.foot}>
              <span className={product.price === null ? styles.priceTbc : styles.price}>
                {product.price === null ? "Add: price" : `₹${product.price.toLocaleString("en-IN")}`}
              </span>
              <div className={styles.ctaRow}>
                <button
                  className={styles.addBtn}
                  onClick={() =>
                    addToCart({
                      slug: product.slug,
                      brand: product.brand,
                      model: product.model,
                      image: product.image,
                      price: product.price,
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
        </div>
      </div>
    </>,
    document.body
  );
}
