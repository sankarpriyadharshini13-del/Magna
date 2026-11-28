"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useProducts } from "./ProductsContext";
import { loadCart, saveCart } from "@/services/cartStorage";
import { sellsOnline } from "@/lib/channels";
import { defaultPackSize, priceForPack } from "@/lib/pack";
import { availablePackStock, availableStock } from "@/lib/stock";
import type { CartItem, Product } from "@/types";

const MAX_QTY = 20;

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "normalize"; defaults: Record<string, string> }
  | { type: "add"; productId: string; quantity: number; packSize?: string }
  | { type: "set"; productId: string; quantity: number; packSize?: string }
  | { type: "remove"; productId: string; packSize?: string }
  | { type: "prune"; productIds: string[] }
  | { type: "clear" };

/** Cart lines are unique per product + pack size, so the same product can sit in two sizes. */
const sameLine = (i: CartItem, productId: string, packSize?: string) =>
  i.productId === productId && (i.packSize ?? "") === (packSize ?? "");

/** Merges lines that point at the same product + pack size (old saved carts could hold duplicates). */
function mergeLines(items: CartItem[]): CartItem[] {
  const merged: CartItem[] = [];
  for (const i of items) {
    const at = merged.findIndex((m) => sameLine(m, i.productId, i.packSize));
    if (at >= 0) merged[at] = { ...merged[at], quantity: Math.min(MAX_QTY, merged[at].quantity + i.quantity) };
    else merged.push(i);
  }
  return merged;
}

function reducer(state: CartItem[], a: Action): CartItem[] {
  switch (a.type) {
    case "hydrate":
      return mergeLines(a.items.map((i) => ({ ...i, quantity: Math.min(i.quantity, MAX_QTY), packSize: i.packSize ?? "" })));
    case "normalize": {
      let changed = false;
      const next = state.map((i) => {
        const size = !i.packSize && a.defaults[i.productId];
        if (!size) return i;
        changed = true;
        return { ...i, packSize: size };
      });
      return changed ? mergeLines(next) : state;
    }
    case "add": {
      const existing = state.find((i) => sameLine(i, a.productId, a.packSize));
      if (existing)
        return state.map((i) =>
          sameLine(i, a.productId, a.packSize)
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + a.quantity) }
            : i,
        );
      return [...state, { productId: a.productId, quantity: Math.min(MAX_QTY, a.quantity), packSize: a.packSize ?? "" }];
    }
    case "set":
      return a.quantity <= 0
        ? state.filter((i) => !sameLine(i, a.productId, a.packSize))
        : state.map((i) => (sameLine(i, a.productId, a.packSize) ? { ...i, quantity: Math.min(MAX_QTY, a.quantity) } : i));
    case "remove":
      return state.filter((i) => !sameLine(i, a.productId, a.packSize));
    case "prune":
      return state.filter((i) => !a.productIds.includes(i.productId));
    case "clear":
      return [];
  }
}

/** Shown when a customer tries to go past the stock left (or the per-order limit). */
export interface LimitNotice {
  productId: string;
  name: string;
  /** Most units this customer can put in the cart. */
  available: number;
  reason: "stock" | "order";
  message: string;
  at: number;
}

export function limitMessage(available: number, reason: LimitNotice["reason"]) {
  return reason === "stock"
    ? `Only ${available} unit${available === 1 ? "" : "s"} of this product ${available === 1 ? "is" : "are"} currently available in stock. If you need a larger quantity, please contact our shop.`
    : `You can order up to ${available} units of this product online. If you need a larger quantity, please contact our shop.`;
}

export interface CartLine {
  product: Product;
  /** Chosen pack size for this line (empty when the product has no pack options). */
  packSize: string;
  quantity: number;
  lineTotal: number | null;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  /** Sum of items that have a confirmed price. */
  subtotal: number;
  /** True when at least one line has no confirmed price yet. */
  hasUnpriced: boolean;
  hydrated: boolean;
  /** Last add message for the live region. */
  announcement: string;
  /** Most recent successful add (drives the "Added to cart" notice; the cart no longer opens itself). */
  lastAdded: { productId: string; name: string; at: number } | null;
  /** Latest "can't add more" message (stock or per-order limit). */
  limitNotice: LimitNotice | null;
  /** Most units of the selected pack that fit in the cart, capped by remaining product stock and order limit. */
  maxFor: (productId: string, packSize?: string) => number;
  /** Shows the limit message for a product (used when + is pressed at the limit). */
  notifyLimit: (productId: string, packSize?: string) => void;
  dismissLimit: () => void;
  add: (productId: string, quantity?: number, packSize?: string) => void;
  setQuantity: (productId: string, quantity: number, packSize?: string) => void;
  remove: (productId: string, packSize?: string) => void;
  clear: () => void;
  maxQty: number;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children, onAdd }: { children: React.ReactNode; onAdd?: () => void }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [lastAdded, setLastAdded] = useState<CartValue["lastAdded"]>(null);
  const [limitNotice, setLimitNotice] = useState<LimitNotice | null>(null);
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;
  const { getById } = useProducts();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    dispatch({ type: "hydrate", items: loadCart() });
    setHydrated(true);
  }, []);

  // Carts saved before pack sizes existed get the product's default pack so every line has a size.
  useEffect(() => {
    if (!hydrated) return;
    const defaults: Record<string, string> = {};
    for (const i of itemsRef.current) {
      if (i.packSize) continue;
      const size = defaultPackSize(getById(i.productId));
      if (size) defaults[i.productId] = size;
    }
    if (Object.keys(defaults).length > 0) dispatch({ type: "normalize", defaults });
  }, [hydrated, getById]);

  // Export catalogue products are enquiry-only: a line saved before the product moved to the
  // export shelf (or before this feature existed) leaves the cart so it can't reach checkout.
  useEffect(() => {
    if (!hydrated) return;
    const exportIds = items
      .map((i) => i.productId)
      .filter((id) => getById(id)?.channel === "export");
    if (exportIds.length > 0) dispatch({ type: "prune", productIds: [...new Set(exportIds)] });
  }, [hydrated, items, getById]);

  // Persist + sync across tabs.
  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "magna-cart-v1") dispatch({ type: "hydrate", items: loadCart() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const maxFor = useCallback((productId: string, packSize = "") => {
    const product = getById(productId);
    if (!product) return 0;
    const selectedSize = packSize || defaultPackSize(product);
    const totalStock = availableStock(product);
    const packStock = availablePackStock(product, selectedSize);
    const otherSizes = itemsRef.current
      .filter((item) => item.productId === productId && (item.packSize || defaultPackSize(product)) !== selectedSize)
      .reduce((total, item) => total + item.quantity, 0);
    const totalRoom = totalStock == null ? MAX_QTY : Math.max(0, totalStock - otherSizes);
    return Math.max(0, Math.min(MAX_QTY, totalRoom, packStock ?? MAX_QTY));
  }, [getById]);
  const notifyLimit = useCallback((productId: string, packSize = "") => {
    const p = getById(productId);
    if (!p) return;
    const available = maxFor(productId, packSize);
    const reason = available < MAX_QTY ? "stock" : "order";
    const message = limitMessage(available, reason);
    setLimitNotice({ productId, name: p.name, available, reason, message, at: Date.now() });
    setAnnouncement(message);
  }, [getById, maxFor]);
  const dismissLimit = useCallback(() => setLimitNotice(null), []);

  const add = useCallback((productId: string, quantity = 1, packSize = "") => {
    const p = getById(productId);
    if (!p) return;
    // Products that aren't sold online (export / distributor-only) are enquiry-only and never enter the cart.
    if (!sellsOnline(p)) return;
    const selectedSize = packSize || defaultPackSize(p);
    const stock = availablePackStock(p, selectedSize);
    if (stock != null && stock <= 0) {
      setAnnouncement(`${p.name} is out of stock`);
      return;
    }
    const inCart = itemsRef.current
      .filter((i) => i.productId === productId && (i.packSize || defaultPackSize(p)) === selectedSize)
      .reduce((n, i) => n + i.quantity, 0);
    const room = maxFor(productId, selectedSize) - inCart;
    if (room <= 0) return notifyLimit(productId, selectedSize);
    dispatch({ type: "add", productId, quantity: Math.min(quantity, room), packSize: selectedSize });
    setLastAdded({ productId, name: p.name, at: Date.now() });
    // After lastAdded, so the limit message wins over the "added" notice.
    if (quantity > room) notifyLimit(productId, selectedSize);
    else setAnnouncement(`${p.name} added to cart`);
    onAddRef.current?.();
  }, [getById, maxFor, notifyLimit]);
  /** Sets a line's quantity; asking for more than is available keeps the quantity at the limit and says why. */
  const setQuantity = useCallback((productId: string, quantity: number, packSize = "") => {
    const product = getById(productId);
    const selectedSize = packSize || (product ? defaultPackSize(product) : "");
    const max = maxFor(productId, selectedSize);
    const lines = itemsRef.current.filter((i) => i.productId === productId);
    const current = lines
      .filter((i) => (i.packSize || (product ? defaultPackSize(product) : "")) === selectedSize)
      .reduce((n, i) => n + i.quantity, 0);
    const lineMax = max;
    if (quantity > lineMax && quantity > current) {
      notifyLimit(productId, selectedSize);
      if (current >= lineMax) return;
      quantity = lineMax;
    }
    if (quantity < current) setLimitNotice((n) => (n?.productId === productId ? null : n));
    dispatch({ type: "set", productId, quantity, packSize: selectedSize });
  }, [getById, maxFor, notifyLimit]);
  const remove = useCallback((productId: string, packSize = "") => {
    const p = getById(productId);
    dispatch({ type: "remove", productId, packSize });
    if (p) setAnnouncement(`${p.name} removed from cart`);
  }, [getById]);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartValue>(() => {
    const lines: CartLine[] = items.flatMap((i) => {
      const product = getById(i.productId);
      if (!product || !sellsOnline(product)) return [];
      const packSize = i.packSize || defaultPackSize(product);
      const unitPrice = priceForPack(product, packSize).price;
      return [{
        product,
        packSize,
        quantity: i.quantity,
        lineTotal: unitPrice != null ? unitPrice * i.quantity : null,
      }];
    });
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + (l.lineTotal ?? 0), 0),
      hasUnpriced: lines.some((l) => l.lineTotal == null),
      hydrated,
      announcement,
      lastAdded,
      limitNotice,
      maxFor,
      notifyLimit,
      dismissLimit,
      add,
      setQuantity,
      remove,
      clear,
      maxQty: MAX_QTY,
    };
  }, [items, hydrated, announcement, lastAdded, limitNotice, maxFor, notifyLimit, dismissLimit, add, setQuantity, remove, clear, getById]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
