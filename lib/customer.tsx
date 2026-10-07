"use client";

/* Customer session for the browser: who is signed in, their wishlist, and the sign-in window.
   Everything sensitive stays on the server (HttpOnly cookie) — this only mirrors the public bits
   (name, email, wishlist) so the header and the heart buttons can react instantly. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AuthModal from "@/components/account/AuthModal";

export type PublicCustomer = { name: string; email: string; wishlist: string[] };
export type AuthMode = "signin" | "signup";

type Ctx = {
  /** false until the first "who am I?" answer arrives */
  ready: boolean;
  customer: PublicCustomer | null;
  wishlist: Set<string>;
  openAuth: (opts?: { mode?: AuthMode; reason?: string }) => void;
  setCustomer: (c: PublicCustomer | null) => void;
  signOut: () => Promise<void>;
  /** heart button: adds/removes a cycle, or asks the visitor to sign in first */
  toggleWishlist: (slug: string) => Promise<void>;
};

const CustomerContext = createContext<Ctx | null>(null);

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, { credentials: "same-origin", ...init });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [customer, setCustomer] = useState<PublicCustomer | null>(null);
  const [auth, setAuth] = useState<{ mode: AuthMode; reason?: string } | null>(null);
  /** a heart pressed while signed out — saved as soon as they have signed in */
  const pendingWish = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<{ customer: PublicCustomer | null }>("/api/customer/me")
      // a failed check (database down) must not look like a sign-out, so only a real answer is applied
      .then((r) => alive && r.ok && setCustomer(r.data.customer ?? null))
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const wishlist = useMemo(() => new Set(customer?.wishlist ?? []), [customer]);

  const openAuth = useCallback((opts?: { mode?: AuthMode; reason?: string }) => {
    setAuth({ mode: opts?.mode ?? "signin", reason: opts?.reason });
  }, []);

  const signOut = useCallback(async () => {
    await api("/api/customer/logout", { method: "POST" }).catch(() => {});
    setCustomer(null);
  }, []);

  const save = useCallback(async (slug: string, wished: boolean) => {
    // optimistic: the heart flips at once; the server confirms (or we put it back)
    setCustomer((c) =>
      c ? { ...c, wishlist: wished ? [slug, ...c.wishlist.filter((s) => s !== slug)] : c.wishlist.filter((s) => s !== slug) } : c
    );
    const r = await api<{ wishlist?: string[] }>("/api/customer/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, wished }),
    }).catch(() => null);
    if (r?.ok && r.data.wishlist) {
      const list = r.data.wishlist;
      setCustomer((c) => (c ? { ...c, wishlist: list } : c));
    } else if (r?.status === 401) {
      setCustomer(null);
    } else {
      setCustomer((c) =>
        c ? { ...c, wishlist: wished ? c.wishlist.filter((s) => s !== slug) : [slug, ...c.wishlist.filter((s) => s !== slug)] } : c
      );
    }
  }, []);

  const toggleWishlist = useCallback(
    async (slug: string) => {
      if (!customer) {
        pendingWish.current = slug;
        openAuth({ mode: "signin", reason: "Sign in to save cycles to your wishlist." });
        return;
      }
      await save(slug, !customer.wishlist.includes(slug));
    },
    [customer, openAuth, save]
  );

  const onAuthed = useCallback(
    (c: PublicCustomer) => {
      setCustomer(c);
      setAuth(null);
      const slug = pendingWish.current;
      pendingWish.current = null;
      if (slug && !c.wishlist.includes(slug)) void save(slug, true);
    },
    [save]
  );

  const value = useMemo<Ctx>(
    () => ({ ready, customer, wishlist, openAuth, setCustomer, signOut, toggleWishlist }),
    [ready, customer, wishlist, openAuth, signOut, toggleWishlist]
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
      {auth && (
        <AuthModal
          initialMode={auth.mode}
          reason={auth.reason}
          onClose={() => {
            pendingWish.current = null;
            setAuth(null);
          }}
          onAuthed={onAuthed}
        />
      )}
    </CustomerContext.Provider>
  );
}

export function useCustomer(): Ctx {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used inside <CustomerProvider>");
  return ctx;
}

/** small helper for the account page forms */
export { api as customerApi };
