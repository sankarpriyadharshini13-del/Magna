import "server-only";
import { defaultSettings, PRODUCT_COLORS } from "@/lib/admin/defaults";
import { TRACKING_STATUSES } from "@/lib/admin/types";
import { emptyPack } from "@/lib/pack";
import type { ProductPack } from "@/types";
import type {
  AdminProduct,
  Customer,
  Invite,
  Member,
  Order,
  OrderStatus,
  PayMethod,
  PaymentStatus,
  Refund,
  Settings,
  StockLogEntry,
} from "@/lib/admin/types";
import { HttpError, dbError } from "./http";
import { publicUrl } from "./supabase";

/* ------------------------------------------------------------- DB → app shapes */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const BUCKET = "admin-assets";
export const storagePrefix = () => `${publicUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`;

export function mapProduct(r: Row): AdminProduct {
  // Before the pack migration runs, none of the pack_* columns exist — the form falls back to the built-in guide.
  const saved: ProductPack | null =
    r.pack_enabled === undefined && r.pack_ingredients === undefined
      ? null
      : {
          enabled: r.pack_enabled ?? true,
          ingredients: r.pack_ingredients ?? "",
          benefits: r.pack_benefits ?? "",
          whoCanEat: r.pack_who_can_eat ?? "",
          whoShouldBeCareful: r.pack_who_should_be_careful ?? "",
          customized: r.pack_customized === true,
        };
  return {
    id: r.id,
    name: r.name,
    sku: r.sku ?? "",
    price: r.price ?? null,
    originalPrice: r.original_price ?? null,
    stock: r.stock ?? 0,
    packSize: r.pack_size ?? "",
    tag: r.tag ?? "",
    description: r.description ?? "",
    barcode: r.barcode ?? "",
    visible: !!r.visible,
    images: r.images ?? [],
    color: r.color ?? PRODUCT_COLORS[0],
    pack: saved ?? emptyPack(),
  };
}

export function mapOrder(r: Row): Order {
  const events = [...(r.order_events ?? [])].sort((a: Row, b: Row) => a.at.localeCompare(b.at));
  return {
    number: Number(r.number),
    placedAt: r.placed_at,
    customerId: r.customer_id,
    items: (r.order_items ?? []).map((i: Row) => ({
      productId: i.product_id ?? "",
      name: i.name,
      packSize: i.pack_size ?? "",
      qty: i.qty,
      price: i.price,
    })),
    shipping: r.shipping ?? 0,
    method: r.method as PayMethod,
    status: r.status as OrderStatus,
    address: r.address ?? "",
    timeline: events.map((e: Row) => ({ label: e.label, note: e.note ?? undefined, at: e.at })),
    payment: { id: r.payment_id ?? "", status: r.payment_status as PaymentStatus, refunded: r.payment_refunded ?? 0 },
    email: r.email ?? "",
    shipName: r.ship_name ?? "",
    shipPhone: r.ship_phone ?? "",
    location: { city: r.ship_city ?? "", state: r.ship_state ?? "", pincode: r.ship_pincode ?? "" },
    deliveredAt: r.delivered_at ?? null,
    cancelReason: r.cancel_reason ?? "",
    kind: r.kind === "bulk" ? "bulk" : "normal",
    source: r.source === "admin" ? "admin" : r.source === "enquiry" ? "enquiry" : "online",
    businessName: r.business_name ?? "",
    gstNumber: r.gst_number ?? "",
    note: r.note ?? "",
    paymentMode: r.payment_mode ?? "online",
    amountPaid: r.amount_paid ?? 0,
    discount: r.discount ?? 0,
    deliveryCharge: r.delivery_charge ?? 0,
    boxes: r.boxes ?? null,
    totalWeight: r.total_weight ?? "",
    tracking: {
      transporter: r.transporter ?? "",
      number: r.tracking_number ?? "",
      dispatchDate: r.dispatch_date ?? "",
      status: r.tracking_status ?? "",
      url: r.tracking_url ?? "",
    },
  };
}

export function mapCustomer(r: Row): Customer {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? "",
    email: r.email ?? "",
    area: r.area ?? undefined,
    city: r.city ?? "",
    state: r.state ?? "",
    since: r.since,
    notes: [...(r.customer_notes ?? [])]
      .sort((a: Row, b: Row) => b.at.localeCompare(a.at))
      .map((n: Row) => ({ id: n.id, text: n.text, at: n.at })),
  };
}

export const mapRefund = (r: Row): Refund => ({
  id: r.id,
  orderNumber: Number(r.order_number),
  amount: r.amount,
  reason: r.reason,
  note: r.note ?? "",
  at: r.at,
});

export const mapStockLog = (r: Row): StockLogEntry => ({ id: r.id, at: r.at, text: r.text, delta: r.delta });

export const mapMember = (r: Row): Member => ({
  userId: r.user_id,
  email: r.email,
  name: r.name ?? null,
  role: r.role,
  createdAt: r.created_at,
});

export function mapInvite(r: Row, now = Date.now()): Invite {
  const status: Invite["status"] = r.accepted_at
    ? "accepted"
    : r.revoked_at
      ? "revoked"
      : new Date(r.expires_at).getTime() < now
        ? "expired"
        : "pending";
  return { id: r.id, email: r.email, name: r.name ?? null, createdAt: r.created_at, expiresAt: r.expires_at, status };
}

/** Saved settings merged over the defaults so older rows keep working when new options appear. */
export function mergeSettings(saved: Row | null | undefined): Settings {
  const d = defaultSettings();
  const s = (saved ?? {}) as Partial<Settings>;
  return {
    store: { ...d.store, ...(s.store ?? {}) },
    razorpay: { ...d.razorpay, ...(s.razorpay ?? {}) },
    notifications: { ...d.notifications, ...(s.notifications ?? {}) },
    invoice: { ...d.invoice, ...(s.invoice ?? {}) },
  };
}

/* ------------------------------------------------------------------ validation */

const bad = (message: string) => new HttpError(400, message);
const str = (v: unknown, field: string, max: number, opts: { required?: boolean } = {}) => {
  if (v === undefined || v === null) {
    if (opts.required) throw bad(`${field} is required.`);
    return "";
  }
  if (typeof v !== "string") throw bad(`${field} must be text.`);
  const t = v.trim();
  if (opts.required && !t) throw bad(`${field} is required.`);
  if (t.length > max) throw bad(`${field} must be at most ${max} characters.`);
  return t;
};
const int = (v: unknown, field: string, min: number, max: number) => {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) {
    throw bad(`${field} must be a whole number between ${min} and ${max}.`);
  }
  return v;
};

export const isAllowedImage = (u: unknown): u is string =>
  typeof u === "string" &&
  u.length < 600 &&
  ((u.startsWith("/images/") && !u.includes("..")) || u.startsWith(storagePrefix()));

export interface ProductInput {
  id?: string;
  name: string;
  price: number | null;
  originalPrice: number | null;
  stock: number;
  packSize: string;
  tag: string;
  description: string;
  visible: boolean;
  images: string[];
  pack: ProductPack;
}

/** "Who can eat" / "Who should be careful": one point per line, trimmed and normalised. */
const packList = (v: unknown, field: string) => {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") throw bad(`${field} must be text.`);
  const points = v.split(/\r?\n/).map((p) => p.trim()).filter(Boolean);
  if (points.length > 15) throw bad(`${field} can have at most 15 points.`);
  if (points.some((p) => p.length > 240)) throw bad(`Each point under “${field}” must be at most 240 characters.`);
  return points.join("\n");
};

export function parseProduct(body: Row): ProductInput {
  const name = str(body.name, "Product name", 120, { required: true });
  let price: number | null = null;
  if (body.price !== null && body.price !== undefined && body.price !== "") price = int(body.price, "Price", 0, 10_000_000);
  let originalPrice: number | null = null;
  if (body.originalPrice !== null && body.originalPrice !== undefined && body.originalPrice !== "")
    originalPrice = int(body.originalPrice, "Original price", 0, 10_000_000);
  if (originalPrice != null && price == null) throw bad("Add a selling price along with the original price.");
  if (originalPrice != null && price != null && originalPrice < price) throw bad("Original price can't be lower than the selling price.");
  const stock = int(body.stock ?? 0, "Stock", 0, 1_000_000);
  const images = body.images ?? [];
  if (!Array.isArray(images) || images.length > 5) throw bad("A product can have at most 5 photos.");
  if (!images.every(isAllowedImage)) throw bad("One of the photos isn't from this store's uploads.");
  if (typeof body.visible !== "boolean") throw bad("Visibility must be on or off.");
  if (body.visible && price == null) throw bad("Add a price before making the product visible.");
  let id: string | undefined;
  if (body.id !== undefined && body.id !== null) {
    if (typeof body.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.id) || body.id.length > 80) throw bad("Invalid product id.");
    id = body.id;
  }
  return {
    id,
    name,
    price,
    originalPrice,
    stock,
    packSize: str(body.packSize, "Pack size", 40),
    tag: str(body.tag, "Tag", 30),
    description: str(body.description, "Description", 2000),
    visible: body.visible,
    images: Array.from(new Set(images as string[])),
    pack: {
      // Switch on unless the admin turned it off; individual blank boxes simply hide that card.
      enabled: body.pack?.enabled !== false,
      ingredients: str(body.pack?.ingredients, "Ingredients", 600),
      benefits: str(body.pack?.benefits, "Benefits", 1200),
      whoCanEat: packList(body.pack?.whoCanEat, "Who can eat"),
      whoShouldBeCareful: packList(body.pack?.whoShouldBeCareful, "Who should be careful"),
      // Set by the full product form so a cleared box stays cleared instead of falling back to the guide.
      customized: body.pack?.customized === true,
    },
  };
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "product";

export function skuFor(name: string, packSize: string, current: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length || !packSize.trim()) return current;
  const code = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0];
  const m = /([\d.]+)\s*(kg|g)?/i.exec(packSize);
  const size = m ? Math.round(parseFloat(m[1]) * (m[2]?.toLowerCase() === "kg" ? 1000 : 1)) : 0;
  return `MEB-${code.toUpperCase()}-${size || packSize.replace(/\W/g, "").toUpperCase()}`;
}

/** 12-digit barcodes step by 7 from the highest existing one, matching the printed label sheet. */
export function nextBarcode(existing: (string | null)[]) {
  const nums = existing.map((b) => Number(b)).filter((n) => Number.isFinite(n) && n > 0);
  return String((nums.length ? Math.max(...nums) : 890123450010) + 7);
}

export function parseSettings(body: Row): Settings {
  const d = defaultSettings();
  const s = (body.settings ?? body) as Row;
  const store = (s.store ?? {}) as Row;
  const rz = (s.razorpay ?? {}) as Row;
  const nt = (s.notifications ?? {}) as Row;
  const iv = (s.invoice ?? {}) as Row;
  const email = str(store.email, "Store email", 200, { required: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad("Enter a valid store email address.");
  const numberFormat = str(iv.numberFormat, "Invoice number format", 20, { required: true });
  if (!/^[A-Za-z0-9\-_/]*0+$/.test(numberFormat)) throw bad("Invoice number format must end in zeros, e.g. MEB-0000.");
  const bool = (v: unknown, f: boolean) => (typeof v === "boolean" ? v : f);
  let logo: string | null = null;
  if (iv.logo !== null && iv.logo !== undefined) {
    if (!isAllowedImage(iv.logo)) throw bad("The logo isn't from this store's uploads.");
    logo = iv.logo;
  }
  const mode = rz.mode === "Test" ? "Test" : "Live";
  return {
    store: {
      name: str(store.name, "Store name", 120, { required: true }),
      owner: str(store.owner, "Owner", 120),
      address: str(store.address, "Address", 300),
      phone: str(store.phone, "Phone", 30),
      email,
      gstin: str(store.gstin, "GSTIN", 30),
      udyam: str(store.udyam, "Udyam number", 30),
    },
    razorpay: {
      mode,
      upi: bool(rz.upi, d.razorpay.upi),
      cards: bool(rz.cards, d.razorpay.cards),
      netbanking: bool(rz.netbanking, d.razorpay.netbanking),
      cod: bool(rz.cod, d.razorpay.cod),
      payoutAccount: str(rz.payoutAccount, "Payout account", 60),
    },
    notifications: {
      newOrder: bool(nt.newOrder, true),
      lowStock: bool(nt.lowStock, true),
      orderEmail: bool(nt.orderEmail, true),
      whatsapp: bool(nt.whatsapp, false),
    },
    invoice: { footer: str(iv.footer, "Invoice footer", 400), numberFormat, logo },
  };
}

export { bad, int, str };

/* ------------------------------------------------------------ admin orders */

export type OrderPaymentMode = "paid" | "cod" | "pending" | "advance";

export interface OrderInput {
  kind: "normal" | "bulk";
  name: string;
  phone: string;
  email: string;
  business_name: string;
  gst_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  note: string;
  shipping: number;
  discount: number;
  delivery_charge: number;
  boxes: number | null;
  total_weight: string;
  transporter: string;
  tracking_number: string;
  dispatch_date: string;
  tracking_status: string;
  tracking_url: string;
  payment_mode: OrderPaymentMode;
  method: string;
  amount_paid: number;
  items: { product_id: string | null; name: string; pack_size: string; qty: number; price: number }[];
}

const MODES: OrderPaymentMode[] = ["paid", "cod", "pending", "advance"];
const METHODS = ["UPI", "Cash", "Card", "NetBanking", "Other"];

/** Body of "+ Add" / "Edit" order (Admin → Orders), checked before it reaches admin_save_order(). */
export function parseOrder(body: Row, editing: boolean): OrderInput {
  const kind = body.kind === "bulk" ? "bulk" : body.kind === "normal" ? "normal" : null;
  if (!kind) throw bad("Choose Normal or Bulk order.");
  const email = str(body.email, "Email", 160).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad("Enter a valid email address.");
  const phone = str(body.phone, "Phone", 20, { required: true });
  if (phone.replace(/\D/g, "").length < 10) throw bad("Enter a valid phone number (at least 10 digits).");
  const pincode = str(body.pincode, "Pincode", 6);
  if (pincode && !/^\d{6}$/.test(pincode)) throw bad("Pincode must be 6 digits.");
  const gst = str(body.gst_number, "GST number", 15).toUpperCase();
  if (gst && !/^[0-9A-Z]{15}$/.test(gst)) throw bad("GST number must be 15 letters and digits.");

  if (!Array.isArray(body.items) || body.items.length === 0) throw bad("Add at least one product.");
  if (body.items.length > 50) throw bad("An order can have at most 50 products.");
  const items = body.items.map((raw: unknown, i: number) => {
    const it = (raw ?? {}) as Row;
    const productId = it.product_id === null || it.product_id === undefined || it.product_id === "" ? null : it.product_id;
    if (productId !== null && (typeof productId !== "string" || productId.length > 80)) throw bad(`Product ${i + 1} isn't valid.`);
    if (productId === null && !editing) throw bad(`Choose a product for line ${i + 1}.`);
    return {
      product_id: productId as string | null,
      name: str(it.name, `Product ${i + 1} name`, 120, { required: productId === null }),
      pack_size: str(it.pack_size, `Product ${i + 1} pack`, 40),
      qty: int(it.qty, `Quantity of product ${i + 1}`, 1, 100_000),
      price: int(it.price, `Price of product ${i + 1}`, 0, 10_000_000),
    };
  });
  const shipping = int(body.shipping ?? 0, kind === "bulk" ? "Freight" : "Shipping", 0, 1_000_000);
  const discount = int(body.discount ?? 0, "Discount", 0, 10_000_000);
  const deliveryCharge = int(body.delivery_charge ?? 0, "Delivery charge", 0, 1_000_000);
  const total = shipping + deliveryCharge - discount + items.reduce((s: number, i: { qty: number; price: number }) => s + i.qty * i.price, 0);
  if (total < 0) throw bad("The discount can't be more than the order total.");

  // Parcels and manual tracking (bulk orders only).
  const boxes = body.boxes === null || body.boxes === undefined || body.boxes === "" ? null : int(body.boxes, "Boxes / parcels", 0, 10_000);
  const dispatchDate = str(body.dispatch_date, "Dispatch date", 10);
  if (dispatchDate && (!/^\d{4}-\d{2}-\d{2}$/.test(dispatchDate) || Number.isNaN(Date.parse(dispatchDate)))) throw bad("Choose a valid dispatch date.");
  const trackingStatus = str(body.tracking_status, "Tracking status", 30);
  if (trackingStatus && !(TRACKING_STATUSES as readonly string[]).includes(trackingStatus)) throw bad("Choose a tracking status from the list.");
  const trackingUrl = str(body.tracking_url, "Tracking link", 300);
  if (trackingUrl && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(trackingUrl)) throw bad("The tracking link must start with https://");

  const mode = body.payment_mode as OrderPaymentMode;
  if (!MODES.includes(mode)) throw bad("Choose how the order is paid.");
  const method = mode === "cod" ? "Cash" : METHODS.includes(body.method) ? body.method : "Other";
  const amountPaid = mode === "advance" ? int(body.amount_paid, "Advance received", 1, 10_000_000) : 0;
  if (mode === "advance" && amountPaid >= total) throw bad("The advance must be less than the order total. Choose Fully paid instead.");

  return {
    kind,
    name: str(body.name, kind === "bulk" ? "Contact person" : "Customer name", 120, { required: true }),
    phone,
    email,
    business_name: kind === "bulk" ? str(body.business_name, "Business name", 120, { required: true }) : "",
    gst_number: kind === "bulk" ? gst : "",
    address: str(body.address, "Address", 300),
    city: str(body.city, "City", 80),
    state: str(body.state, "State", 80),
    pincode,
    note: str(body.note, "Note", 500),
    shipping,
    discount,
    delivery_charge: deliveryCharge,
    boxes: kind === "bulk" ? boxes : null,
    total_weight: kind === "bulk" ? str(body.total_weight, "Total weight", 20) : "",
    transporter: kind === "bulk" ? str(body.transporter, "Transporter", 80) : "",
    tracking_number: kind === "bulk" ? str(body.tracking_number, "Tracking / LR number", 60) : "",
    dispatch_date: kind === "bulk" ? dispatchDate : "",
    tracking_status: kind === "bulk" ? trackingStatus : "",
    tracking_url: kind === "bulk" ? trackingUrl : "",
    payment_mode: mode,
    method,
    amount_paid: amountPaid,
    items,
  };
}

/** Turns admin_save_order() errors into messages for the admin. */
export function orderSaveError(e: { code?: string; message?: string } | null): HttpError {
  const m = e?.message ?? "";
  if (m.startsWith("insufficient_stock:")) return new HttpError(409, `Not enough stock for ${m.slice(19)}. Lower the quantity or add stock in Products & Stock.`);
  if (m.startsWith("unknown_product:")) return new HttpError(409, "One of the products no longer exists. Remove it and try again.");
  if (m.includes("order_not_found")) return new HttpError(404, "That order no longer exists.");
  if (m.includes("invalid_advance")) return new HttpError(400, "The advance must be more than ₹0 and less than the order total.");
  if (m.includes("invalid_discount")) return new HttpError(400, "The discount can't be more than the order total.");
  if (m.includes("not_admin")) return new HttpError(403, "You don't have permission to do that.");
  if (/(_required|invalid_)/.test(m)) return new HttpError(400, "Some of the order details are missing or not valid.");
  return dbError(e);
}
