import type { ProductChannel, ProductPack, ProductPackPrice } from "@/types";

export type OrderStatus = "New" | "Packed" | "Delivered" | "Cancelled";

export type PayMethod = "UPI" | "Card" | "NetBanking" | "Wallet" | "Cash" | "Other";

/** online = paid on the website; the rest are set by an admin on orders they add or edit. */
export type PaymentMode = "online" | "paid" | "cod" | "pending" | "advance";

export type PaymentStatus = "pending" | "captured" | "refunded" | "partial_refund";

/** Which part of the website an order or enquiry came from. */
export type OrderChannel = "ecommerce" | "distributors" | "export";
export const ORDER_CHANNELS: OrderChannel[] = ["ecommerce", "distributors", "export"];

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  /** Whole INR. null while the product is still a draft without a price. */
  price: number | null;
  /** Optional "was" price (MRP), whole INR. Shown struck through on the shop when higher than `price`. */
  originalPrice: number | null;
  /** Selling and original prices by pack size. */
  packPrices: Record<string, ProductPackPrice>;
  stock: number;
  /** First pack size, kept for order lines and older copy. */
  packSize: string;
  /** Every pack size the product is sold in, in display order. */
  packSizes: string[];
  /** Stock quantity per pack size, e.g. {"200 g": 50, "500 g": 30}. Falls back to global stock if empty. */
  packStock: Record<string, number>;
  /** Which admin catalogue (and storefront page) the product belongs to. */
  channel: ProductChannel;
  /** Position on the website inside its catalogue (1 = first). 0 = not positioned yet. */
  sortOrder: number;
  tag: string;
  description: string;
  /** 12-digit code, auto-assigned. Empty for drafts that were never given one. */
  barcode: string;
  visible: boolean;
  /** Compressed JPEG data URLs, max 5. */
  images: string[];
  /** Tile colour used when there is no photo. */
  color: string;
  /** Optional "Know your pack" copy shown under the description on the product page. */
  pack: ProductPack;
}

export interface OrderItem {
  productId: string;
  name: string;
  packSize: string;
  qty: number;
  price: number;
}

export interface TimelineEvent {
  label: string;
  at: string;
  note?: string;
}

export interface OrderPayment {
  /** Full Razorpay-style payment id, e.g. pay_Nx41h3Lm8c9Q. Masked in the UI. */
  id: string;
  status: PaymentStatus;
  refunded: number;
}

export interface Order {
  number: number;
  placedAt: string;
  customerId: string;
  items: OrderItem[];
  shipping: number;
  method: PayMethod;
  status: OrderStatus;
  address: string;
  timeline: TimelineEvent[];
  payment: OrderPayment;
  /** Contact + delivery details captured at checkout (empty for older orders). */
  email: string;
  shipName: string;
  shipPhone: string;
  location: { city: string; state: string; pincode: string };
  deliveredAt: string | null;
  /** Why the shop cancelled it (empty when the order wasn't cancelled, or no reason was given). */
  cancelReason: string;
  /** Bulk = shops, events, large quantities (added by an admin). */
  kind: "normal" | "bulk";
  /** online = placed on the website; admin = added in Admin → Orders; enquiry = Business/Distributors/Export form. */
  source: "online" | "admin" | "enquiry";
  /** Which part of the website it came from: the shop (Ecommerce), /distributors or /export. */
  channel: OrderChannel;
  businessName: string;
  gstNumber: string;
  /** Note for packing. */
  note: string;
  paymentMode: PaymentMode;
  /** Money received so far on admin orders (the advance for part-paid bulk orders). */
  amountPaid: number;
  /** Taken off the total (total = items + shipping − discount). */
  discount: number;
  /** Manual delivery charge entered by admin. */
  deliveryCharge: number;
  /** Bulk orders: parcels and the transporter details the admin entered. */
  boxes: number | null;
  totalWeight: string;
  tracking: OrderTracking;
}

export const TRACKING_STATUSES = ["Not dispatched", "Dispatched", "In transit", "Out for delivery", "Delivered", "Delayed"] as const;
export type TrackingStatus = (typeof TRACKING_STATUSES)[number];

export interface OrderTracking {
  transporter: string;
  number: string;
  /** YYYY-MM-DD, empty when not dispatched yet. */
  dispatchDate: string;
  status: TrackingStatus | "";
  url: string;
}

export interface Refund {
  id: string;
  orderNumber: number;
  amount: number;
  reason: string;
  note: string;
  at: string;
}

export interface CustomerNote {
  id: string;
  text: string;
  at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  area?: string;
  city: string;
  state: string;
  since: string;
  notes: CustomerNote[];
  /** True for the owner, invited admins and invitees — hidden from the Customers tab. */
  team?: boolean;
}

export interface StockLogEntry {
  id: string;
  at: string;
  text: string;
  delta: number;
}

export interface Member {
  userId: string;
  email: string;
  name: string | null;
  role: "owner" | "admin";
  createdAt: string;
}

export interface Invite {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "revoked" | "expired";
}

export interface Me {
  userId: string;
  email: string;
  name: string | null;
  role: "owner" | "admin";
}

export interface NotificationPrefs {
  newOrder: boolean;
  lowStock: boolean;
  orderEmail: boolean;
  whatsapp: boolean;
}

export interface Settings {
  store: {
    name: string;
    owner: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
    udyam: string;
  };
  razorpay: {
    mode: "Live" | "Test";
    upi: boolean;
    cards: boolean;
    netbanking: boolean;
    cod: boolean;
    payoutAccount: string;
  };
  notifications: NotificationPrefs;
  invoice: {
    footer: string;
    numberFormat: string;
    logo: string | null;
  };
}

export interface Review {
  id: string;
  orderNumber: number;
  customerName: string;
  rating: number;
  message: string;
  createdAt: string;
  /** "Idli Podi ×2, Country Sugar ×1" */
  products: string;
  /** "Live on website": shown in the home page Reviews section. */
  published: boolean;
}

export interface AdminData {
  reviews: Review[];
  me: Me;
  members: Member[];
  invites: Invite[];
  products: AdminProduct[];
  orders: Order[];
  customers: Customer[];
  refunds: Refund[];
  stockLog: StockLogEntry[];
  settings: Settings;
}
