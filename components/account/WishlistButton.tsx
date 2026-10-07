"use client";

/* The heart on a cycle: saves it to (or removes it from) the customer's wishlist. Signed-out visitors are
   asked to sign in first and the cycle is saved the moment they do. */

import { useCustomer } from "@/lib/customer";
import styles from "./WishlistButton.module.css";

export default function WishlistButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const { wishlist, toggleWishlist } = useCustomer();
  const on = wishlist.has(slug);

  return (
    <button
      type="button"
      className={`${styles.heart} ${on ? styles.on : ""} ${className ?? ""}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      title={on ? "In your wishlist" : "Save to wishlist"}
      onClick={(e) => {
        e.stopPropagation();
        void toggleWishlist(slug);
      }}
    >
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.3 5 6.5 5c2 0 3.6 1.1 5.5 3.2C13.9 6.1 15.5 5 17.5 5c3.2 0 5 3.2 3.8 6.3-1.8 4.6-9.3 9.2-9.3 9.2z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
