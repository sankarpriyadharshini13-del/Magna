"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { orderLabel } from "./format";
import { LOW_STOCK } from "./logic";
import { availableStock } from "@/lib/stock";
import type { AdminData, AdminProduct } from "./types";

export type ToastTone = "ok" | "warn" | "error";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export type AdminStatus = "loading" | "signed-out" | "forbidden" | "error" | "ready";
export type AdminDataSection = "dashboard" | "orders" | "products" | "barcodes" | "customers" | "payments" | "reviews" | "settings";

export interface ApiResult<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

interface AdminContextValue {
  status: AdminStatus;
  errorMessage: string;
  sectionLoading: boolean;
  sectionErrorMessage: string;
  data: AdminData | null;
  /** Current time, refreshed every minute so "settled" / relative labels stay honest. */
  now: Date;
  label: (orderNumber: number) => string;
  toast: (message: string, tone?: ToastTone) => void;
  /** When the data was last read from the database (drives the "Live · updated" label). */
  lastSync: Date | null;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
  /** Re-read the current screen's data from the database. */
  refresh: () => Promise<void>;
  /** Authenticated call to the admin API. Doesn't toast and doesn't refresh. */
  api: <T = unknown>(path: string, init?: { method?: string; body?: unknown; form?: FormData }) => Promise<ApiResult<T>>;
  /** Call the API, toast the outcome, and refresh shared data in the background on success. */
  mutate: <T = unknown>(
    path: string,
    method: "POST" | "PUT" | "DELETE",
    body?: unknown,
    success?: string | ((data: T) => string),
  ) => Promise<ApiResult<T>>;
  uploadImage: (file: Blob, kind: "product" | "branding") => Promise<ApiResult<{ url: string }>>;
  retry: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

async function accessToken(attempt = 0): Promise<string | null> {
  const { data } = (await getSupabase()?.auth.getSession()) ?? { data: { session: null } };
  const token = data.session?.access_token ?? null;
  if (token || attempt > 0) return token;
  // Right after sign-in the stored session can take a moment to settle; try once more before
  // reporting a 401, so the panel never flashes the sign-in screen on a fresh login.
  await new Promise((resolve) => setTimeout(resolve, 250));
  return accessToken(attempt + 1);
}

async function call<T>(path: string, init: { method?: string; body?: unknown; form?: FormData } = {}): Promise<ApiResult<T> & { status: number }> {
  const token = await accessToken();
  if (!token) return { ok: false, status: 401, error: "Please sign in." };
  try {
    const res = await fetch(path, {
      method: init.method ?? "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      signal: AbortSignal.timeout(20_000),
      body: init.form ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: (json as { error?: string }).error ?? "Something went wrong." };
    return { ok: true, status: res.status, data: json as T };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return {
      ok: false,
      status: 0,
      error: timedOut ? "This admin request took too long. Please try again." : "Network problem. Check your connection and try again.",
    };
  }
}

/**
 * Admin call that survives a token which was mid-refresh: a 401 is confirmed with /api/admin/me and
 * the request is tried once more. Only a confirmed 401 (the session really is gone) signs the admin out.
 */
async function callAdmin<T>(path: string, init: { method?: string; body?: unknown; form?: FormData } = {}) {
  const first = await call<T>(path, init);
  if (first.status !== 401) return { res: first, confirm: null };
  const confirm = await call<unknown>("/api/admin/me");
  if (!confirm.ok) return { res: first, confirm };
  const retry = await call<T>(path, init);
  return { res: retry, confirm };
}

/**
 * Tells the admin when stock changed since the last refresh: products that just ran low or out (always),
 * and purchases that lowered stock (on background refreshes, so their own edits don't echo back).
 */
function announceStock(
  before: Map<string, number> | null,
  products: AdminProduct[],
  background: boolean,
  toast: (message: string, tone?: ToastTone) => void,
) {
  if (!before) return;
  const sold: string[] = [];
  const out: string[] = [];
  const low: string[] = [];
  for (const p of products) {
    const prev = before.get(p.id);
    const stock = availableStock(p) ?? 0;
    if (prev === undefined || stock >= prev) continue;
    // Products not sold online are enquiry-only, so their stock never prompts a restock toast.
    if (!p.channels.includes("ecommerce")) continue;
    sold.push(`${p.name} ${prev} → ${stock}`);
    if (!p.visible) continue;
    if (stock <= 0) out.push(p.name);
    else if (stock <= LOW_STOCK && prev > LOW_STOCK) low.push(`${p.name} (${stock} left)`);
  }
  if (out.length) toast(`Out of stock: ${out.join(", ")}. Restock it in Products & Stock.`, "error");
  if (low.length) toast(`Low stock: ${low.join(", ")}.`, "warn");
  if (background && sold.length && !out.length && !low.length) {
    toast(sold.length <= 2 ? `Stock updated after a sale: ${sold.join(", ")}.` : `Stock updated for ${sold.length} products after new sales.`);
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const section: AdminDataSection = pathname?.startsWith("/admin/orders") ? "orders"
    : pathname?.startsWith("/admin/products") ? "products"
      : pathname?.startsWith("/admin/barcodes") ? "barcodes"
        : pathname?.startsWith("/admin/customers") ? "customers"
          : pathname?.startsWith("/admin/payments") ? "payments"
            : pathname?.startsWith("/admin/reviews") ? "reviews"
              : pathname?.startsWith("/admin/settings") ? "settings"
                : "dashboard";
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionErrorMessage, setSectionErrorMessage] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message: string, tone: ToastTone = "ok") => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-2), { id, message, tone }]);
      setTimeout(() => dismissToast(id), tone === "ok" ? 3500 : 7000);
    },
    [dismissToast],
  );

  const lastOrder = useRef<number | null>(null);
  /** Stock per product at the last refresh, to spot purchases and products running low. */
  const lastStock = useRef<Map<string, number> | null>(null);
  const dataRef = useRef<AdminData | null>(null);
  const loadedSections = useRef(new Set<AdminDataSection>());
  const activeSection = useRef(section);
  const activeUserId = useRef<string | null>(null);
  activeSection.current = section;
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const load = useCallback(async (target: AdminDataSection, background = false, reportFailure = false) => {
    const { res, confirm } = await callAdmin<Partial<AdminData>>(`/api/admin/data?section=${target}`);
    if (res.ok && res.data) {
      if (!res.data.me || !res.data.settings) {
        setErrorMessage("The admin response was incomplete. Please try again.");
        if (dataRef.current) setSectionErrorMessage("The admin data couldn't be loaded. Please try again.");
        else setStatus("error");
        return;
      }
      if (res.data.orders) {
        // Announce orders that arrived since the last refresh (e.g. a customer just paid).
        const newest = res.data.orders.reduce((m, o) => Math.max(m, o.number), 0);
        if (lastOrder.current !== null && newest > lastOrder.current) {
          const fresh = res.data.orders.filter((o) => o.number > (lastOrder.current ?? 0)).length;
          const fmt = res.data.settings.invoice.numberFormat;
          toastRef.current?.(fresh === 1 ? `New order #${orderLabel(newest, fmt)} received.` : `${fresh} new orders received.`);
        }
        lastOrder.current = newest;
      }
      if (res.data.products) {
        announceStock(lastStock.current, res.data.products, background, toastRef.current);
        lastStock.current = new Map(res.data.products.map((p) => [p.id, availableStock(p) ?? 0]));
      }
      const base = dataRef.current ?? {
        me: res.data.me,
        settings: res.data.settings,
        reviews: [],
        members: [],
        invites: [],
        products: [],
        orders: [],
        customers: [],
        refunds: [],
        stockLog: [],
      };
      const merged = { ...base, ...res.data };
      dataRef.current = merged;
      setData(merged);
      loadedSections.current.add(target);
      setLastSync(new Date());
      setSectionErrorMessage("");
      setStatus("ready");
    } else if (background && res.status !== 401 && res.status !== 403) {
      // A failed background refresh keeps showing the last good data.
      if (reportFailure) {
        toastRef.current?.("Saved, but the admin data couldn't refresh. Reload the page to see the latest values.", "warn");
      }
      return;
    } else if (res.status === 401) {
      // The session check already succeeded: this was a one-off failure, not a sign-out.
      if (confirm?.ok) {
        if (dataRef.current) setSectionErrorMessage("The admin data couldn't refresh. Please try again.");
        return;
      }
      // A background refresh must never throw the admin back to the sign-in screen.
      if (background && dataRef.current) return;
      dataRef.current = null;
      loadedSections.current.clear();
      setData(null);
      setStatus(confirm?.status === 403 ? "forbidden" : "signed-out");
    } else if (res.status === 403) {
      dataRef.current = null;
      loadedSections.current.clear();
      setData(null);
      setStatus("forbidden");
    } else {
      const message = res.error ?? "The admin data couldn't be loaded.";
      if (dataRef.current) setSectionErrorMessage(message);
      else {
        setErrorMessage(message);
        setStatus("error");
      }
    }
  }, []);

  // Load each admin screen's data only when it is first opened.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      activeUserId.current = null;
      dataRef.current = null;
      loadedSections.current.clear();
      setData(null);
      setStatus("signed-out");
      setSectionLoading(false);
      return;
    }
    if (activeUserId.current !== user.id) {
      activeUserId.current = user.id;
      dataRef.current = null;
      loadedSections.current.clear();
      lastOrder.current = null;
      lastStock.current = null;
      setData(null);
      setStatus("loading");
    }
    if (loadedSections.current.has(section)) {
      setSectionLoading(false);
      setSectionErrorMessage("");
      return;
    }
    const alreadyLoaded = loadedSections.current.has(section);
    let active = true;
    setSectionLoading(!alreadyLoaded);
    setSectionErrorMessage("");
    void load(section, alreadyLoaded).finally(() => {
      if (active && !alreadyLoaded) setSectionLoading(false);
    });
    return () => {
      active = false;
    };
  }, [ready, user?.id, section, load]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  // Refresh only the visible screen's datasets in the background.
  useEffect(() => {
    if (status !== "ready") return;
    const refreshIfVisible = () => document.visibilityState === "visible" && load(section, true);
    const timer = setInterval(refreshIfVisible, 60_000);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, [status, section, load]);

  const api = useCallback<AdminContextValue["api"]>(async (path, init) => {
    const res = await call(path, init);
    if (res.status === 401) {
      // Confirm the session before dropping the panel: a token can be mid-refresh.
      const confirm = await call<unknown>("/api/admin/me");
      if (confirm.status === 401 || confirm.status === 403) {
        dataRef.current = null;
        loadedSections.current.clear();
        setStatus(confirm.status === 401 ? "signed-out" : "forbidden");
        setData(null);
      }
    } else if (res.status === 403) {
      // A 403 can simply mean "owner only". Leave the panel only if admin access itself is gone.
      const me = await call("/api/admin/me");
      if (me.status === 401 || me.status === 403) {
        setStatus(me.status === 401 ? "signed-out" : "forbidden");
        setData(null);
      }
    }
    return res as ApiResult<never>;
  }, []);

  const mutate = useCallback<AdminContextValue["mutate"]>(
    async (path, method, body, success) => {
      const res = await api(path, { method, body: body ?? (method === "DELETE" ? undefined : {}) });
      if (!res.ok) {
        toast(res.error ?? "Something went wrong.", "error");
        return res as ApiResult<never>;
      }
      const msg = typeof success === "function" ? success(res.data as never) : success;
      if (msg) toast(msg);
      loadedSections.current.clear();
      void load(activeSection.current, true, true);
      return res as ApiResult<never>;
    },
    [api, load, toast],
  );

  const uploadImage = useCallback<AdminContextValue["uploadImage"]>(
    async (file, kind) => {
      const form = new FormData();
      form.append("file", file, kind === "branding" ? "logo" : "photo");
      form.append("kind", kind);
      const res = await api<{ url: string }>("/api/admin/uploads", { method: "POST", form });
      if (!res.ok) toast(res.error ?? "Upload failed.", "error");
      return res;
    },
    [api, toast],
  );

  const format = data?.settings.invoice.numberFormat ?? "MEB-0000";
  const label = useCallback((n: number) => orderLabel(n, format), [format]);

  const value = useMemo<AdminContextValue>(
    () => ({
      status,
      errorMessage,
      sectionLoading,
      sectionErrorMessage,
      data,
      now,
      label,
      toast,
      lastSync,
      toasts,
      dismissToast,
      refresh: () => load(activeSection.current),
      api,
      mutate,
      uploadImage,
      retry: () => {
        if (!dataRef.current) setStatus("loading");
        else setSectionLoading(true);
        setSectionErrorMessage("");
        void load(activeSection.current).finally(() => setSectionLoading(false));
      },
    }),
    [status, errorMessage, sectionLoading, sectionErrorMessage, data, now, label, toast, lastSync, toasts, dismissToast, load, api, mutate, uploadImage],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

/** Same as useAdmin but guarantees data (screens render only once the shell has loaded it). */
export function useAdminData() {
  const ctx = useAdmin();
  return { ...ctx, data: ctx.data as AdminData };
}
