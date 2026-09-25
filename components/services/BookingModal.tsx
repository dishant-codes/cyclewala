"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Service } from "@/data/services";
import { SHOP } from "@/lib/site";
import { isValidIndianMobile, PHONE_HINT } from "@/lib/validate";
import styles from "./BookingModal.module.css";

/* Customer popup for booking a service. Rendered into <body> so the stacked
   sections that slide up later can never paint over it. Only mounted after a
   click, so `document` always exists. No payment is taken — the shop calls
   to confirm a time. */
export default function BookingModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [address, setAddress] = useState("");
  const [cycle, setCycle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const phoneValid = isValidIndianMobile(phone);
  const showPhoneError = phoneTouched && phone.trim() !== "" && !phoneValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    if (!phoneValid) {
      setPhoneTouched(true);
      setError(PHONE_HINT);
      return;
    }
    if (service.requiresAddress && !address.trim()) {
      setError("Please add your address so we can visit.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, customer: { name, phone, address, cycle, date, note } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't send the request");
      setBookingId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the request");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <button className={styles.scrim} aria-label="Close" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Book ${service.title}`}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {bookingId ? (
          <div className={styles.done}>
            <p className={styles.doneIcon}>✓</p>
            <h2>Request {bookingId} received</h2>
            <p>
              Thanks {name.split(" ")[0]} — we&apos;ll call you on {phone} to confirm a time for your{" "}
              {service.title.toLowerCase()}.
            </p>
            <div className={styles.doneActions}>
              <button className={styles.submit} onClick={onClose}>
                Done
              </button>
              <a className={styles.callAlt} href={SHOP.phoneHref}>
                Or call us now
              </a>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.scrollArea}>
              <div className={styles.head}>
                <p className={styles.kicker}>Book a service</p>
                <h2>{service.title}</h2>
                <p className={styles.headSub}>
                  {service.subtitle} · <b>₹{service.price.toLocaleString("en-IN")}</b>
                </p>
              </div>

              <div className={styles.grid}>
                <label className={styles.field}>
                  Full name *
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                </label>
                <label className={styles.field}>
                  Phone *
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
                <label className={`${styles.field} ${styles.wide}`}>
                  {service.requiresAddress ? "Address for the visit *" : "Address (optional)"}
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    required={service.requiresAddress}
                  />
                </label>
                <label className={styles.field}>
                  Your cycle
                  <input value={cycle} onChange={(e) => setCycle(e.target.value)} placeholder="e.g. Hero MTB 26T" />
                </label>
                <label className={styles.field}>
                  Preferred date
                  <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className={`${styles.field} ${styles.wide}`}>
                  Anything we should know?
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brakes squeal, gears skip…" />
                </label>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <p className={styles.note}>No payment now — we&apos;ll call to confirm a time.</p>
            </div>

            {/* pinned outside the scrolling area above, so Send Request is
                always on screen — never hidden below a long form or a
                phone's on-screen keyboard */}
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.submit} disabled={submitting}>
                {submitting ? "Sending…" : "Send Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>,
    document.body
  );
}
