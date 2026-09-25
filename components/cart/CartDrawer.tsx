"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { SHOP } from "@/lib/site";
import { isValidIndianMobile, PHONE_HINT } from "@/lib/validate";
import styles from "./CartDrawer.module.css";

type Step = "cart" | "checkout" | "confirmed";

/* No payment gateway is wired up — this is Pay at Store / Cash on
   Delivery: the order is saved, the shop calls to confirm, payment
   happens in person. Nothing here pretends to charge a card. */
export default function CartDrawer() {
  const { items, open, setOpen, removeFromCart, setQty, clearCart } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const phoneValid = isValidIndianMobile(phone);
  const showPhoneError = phoneTouched && phone.trim() !== "" && !phoneValid;

  if (!open) return null;

  const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);
  const hasUnknownPrice = items.some((i) => i.price === null);

  const close = () => {
    setOpen(false);
    if (step === "confirmed") {
      setStep("cart");
      setName("");
      setPhone("");
      setAddress("");
      setNote("");
      setOrderId("");
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Name, phone and address are required.");
      return;
    }
    if (!phoneValid) {
      setPhoneTouched(true);
      setError(PHONE_HINT);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, address, note },
          items: items.map((i) => ({ slug: i.slug, brand: i.brand, model: i.model, price: i.price, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't place the order");
      setOrderId(data.id);
      setStep("confirmed");
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't place the order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button className={styles.scrim} aria-label="Close cart" onClick={close} />
      <aside className={styles.drawer}>
        <div className={styles.head}>
          <h2>{step === "checkout" ? "Your Details" : step === "confirmed" ? "Order Placed" : "Your List"}</h2>
          <button className={styles.close} onClick={close} aria-label="Close">
            ×
          </button>
        </div>

        {step === "confirmed" ? (
          <div className={styles.confirmed}>
            <p className={styles.confirmedIcon}>✓</p>
            <p className={styles.confirmedTitle}>Order {orderId} received</p>
            <p className={styles.confirmedSub}>
              We&apos;ll call you at {phone || "the number you gave"} to confirm — pay in person when you collect it
              or it&apos;s delivered.
            </p>
            <a className={styles.callCta} href={SHOP.phoneHref}>
              Or Call Us Now
            </a>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>Nothing here yet.</p>
            <p className={styles.emptySub}>Add a cycle from the shop to start an order.</p>
          </div>
        ) : step === "checkout" ? (
          <form className={styles.checkoutForm} onSubmit={placeOrder}>
            <div className={styles.checkoutScroll}>
              <div className={styles.checkoutItems}>
                {items.map((i) => (
                  <div className={styles.checkoutItem} key={i.slug}>
                    <span>
                      {i.brand} {i.model} × {i.qty}
                    </span>
                    <span>{i.price === null ? "Add: price" : `₹${(i.price * i.qty).toLocaleString("en-IN")}`}</span>
                  </div>
                ))}
              </div>

              <label className={styles.field}>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label className={styles.field}>
                Phone
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={16}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setPhoneTouched(true)}
                  aria-invalid={showPhoneError}
                  className={showPhoneError ? styles.fieldInvalid : undefined}
                  required
                />
                {showPhoneError && <span className={styles.fieldError}>{PHONE_HINT}</span>}
              </label>
              <label className={styles.field}>
                Delivery / pickup address
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
              </label>
              <label className={styles.field}>
                Note (optional)
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Colour, size, anything else" />
              </label>

              {error && <p className={styles.error}>{error}</p>}

              <p className={styles.payNote}>Pay at Store / Cash on Delivery — no card details needed.</p>
            </div>

            {/* pinned outside the scrolling area above, so it's always on
                screen — never requires scrolling past a long form or a
                phone's on-screen keyboard to reach it */}
            <div className={styles.checkoutActions}>
              <button type="button" className={styles.back} onClick={() => setStep("cart")}>
                ← Back
              </button>
              <button type="submit" className={styles.placeOrder} disabled={submitting}>
                {submitting ? "Placing…" : "Place Order"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div className={styles.item} key={item.slug}>
                  <div className={styles.itemPhoto}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" />
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemBrand}>{item.brand}</p>
                    <p className={styles.itemModel}>{item.model}</p>
                    <p className={styles.itemPrice}>
                      {item.price === null ? "Add: price" : `₹${item.price.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                  <div className={styles.itemQty}>
                    <button onClick={() => setQty(item.slug, item.qty - 1)} aria-label="Decrease">
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => setQty(item.slug, item.qty + 1)} aria-label="Increase">
                      +
                    </button>
                  </div>
                  <button className={styles.remove} onClick={() => removeFromCart(item.slug)} aria-label="Remove">
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.foot}>
              <div className={styles.totalRow}>
                <span>Estimated total</span>
                <span className={styles.totalValue}>
                  {hasUnknownPrice ? `From ₹${total.toLocaleString("en-IN")}` : `₹${total.toLocaleString("en-IN")}`}
                </span>
              </div>
              {hasUnknownPrice && <p className={styles.totalNote}>Some items don&apos;t have a price yet.</p>}

              <button className={styles.callCta} onClick={() => setStep("checkout")}>
                Place Order
              </button>
              <a className={styles.callAlt} href={SHOP.phoneHref}>
                Or Call Us Instead
              </a>
              <button className={styles.clear} onClick={clearCart}>
                Clear list
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
