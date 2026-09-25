"use client";

import { useRef, useState } from "react";
import type { Product, ProductCategory } from "@/lib/products";
import { adminFetch } from "@/lib/admin-client";
import styles from "./ProductForm.module.css";

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "kids", label: "Kids' Cycles" },
  { id: "mtb", label: "Mountain Cycles" },
  { id: "hybrid", label: "City & Hybrid" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

export default function ProductForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Product;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "mtb");
  const [sizes, setSizes] = useState(initial?.sizes ?? "");
  const [specsText, setSpecsText] = useState((initial?.specs ?? []).join("\n"));
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [image, setImage] = useState(initial?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slug = initial?.slug ?? slugify(`${brand}-${model}`);

  const handleFile = async (file: File) => {
    if (!slug) {
      setError("Enter brand and model before choosing a photo.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImage(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!brand || !model || !sizes || !image) {
      setError("Brand, model, sizes and a photo are required.");
      return;
    }
    setSaving(true);
    const payload = {
      slug,
      brand,
      model,
      category,
      sizes,
      specs: specsText.split("\n").map((s) => s.trim()).filter(Boolean),
      price: price === "" ? null : Number(price),
      image,
      inStock,
    };
    try {
      const res = await adminFetch(
        isEdit ? `/api/admin/products/${initial!.slug}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cycle Details</h2>
        <div className={styles.grid}>
          <label className={styles.field}>
            Brand
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Neufman" required />
          </label>
          <label className={styles.field}>
            Model
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Annecy" required />
          </label>
          <label className={styles.field}>
            Category
            <span className={styles.selectWrap}>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <svg className={styles.selectChevron} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </label>
          <label className={styles.field}>
            Sizes
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="e.g. 24T / 26T / 27.5T"
              required
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing &amp; Availability</h2>
        <div className={styles.pricingRow}>
          <label className={styles.field}>
            Price (₹) — leave blank to show &quot;Add: price&quot;
            <input
              type="number"
              min={0}
              className={styles.noSpinner}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 12990"
            />
          </label>
          <div className={styles.switchField}>
            <span className={styles.fieldLabel}>Availability</span>
            <label className={styles.switchRow}>
              <span className={styles.switch}>
                <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                <span className={styles.switchTrack} aria-hidden="true" />
              </span>
              {inStock ? "In stock" : "Out of stock"}
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Specifications</h2>
        <label className={styles.field}>
          One per line
          <textarea
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            rows={4}
            placeholder={"21-speed Shimano gearing\nDual disc brakes"}
          />
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Photo</h2>
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneOver : ""} ${image ? styles.dropzoneFilled : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          role="button"
          tabIndex={0}
          aria-label={image ? "Replace photo" : "Upload a photo"}
        >
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className={styles.dropzoneImg} />
              <span className={styles.dropzoneOverlay}>{uploading ? "Uploading…" : "Click or drop to replace"}</span>
            </>
          ) : (
            <div className={styles.dropzoneEmpty}>
              <span className={styles.dropzoneIcon}>
                <UploadIcon />
              </span>
              <p className={styles.dropzoneText}>
                {uploading ? "Uploading…" : (
                  <>
                    <strong>Click to upload</strong> or drag and drop
                  </>
                )}
              </p>
              <p className={styles.dropzoneHint}>JPEG, PNG or WEBP — up to 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.hiddenInput}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </section>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.save} disabled={saving || uploading}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Cycle"}
        </button>
      </div>
    </form>
  );
}
