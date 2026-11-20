import { orderLabel } from "@/lib/admin/format";
import { dbError, handle, json } from "@/lib/server/http";
import { requireUser } from "@/lib/server/guard";
import { loadSettings } from "@/lib/server/orders";
import { serviceClient, serviceConfigured } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

interface SavedReview {
  rating: number;
  message: string;
  createdAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The signed-in customer's own orders. Read with the customer's session, so row-level security
 * (orders_own_read & co.) guarantees nobody can see anyone else's orders.
 */
export const GET = handle(async (req) => {
  const { client } = await requireUser(req);
  const base =
    "number, placed_at, status, shipping, address, ship_name, ship_phone, method, payment_id, payment_refunded, delivered_at, order_items(product_id, name, pack_size, qty, price), order_events(label, note, at)";
  // Payment mode, discount, the transporter details and the cancellation reason arrive with later migrations.
  const extra = ", payment_mode, amount_paid, discount, transporter, tracking_number, dispatch_date, tracking_status, tracking_url, cancel_reason";
  const query = (cols: string) => client.from("orders").select(cols).order("number", { ascending: false }).limit(100);
  let { data, error } = await query(`${base}${extra}`);
  // Before those migrations are applied, still show orders (just without the newer details).
  if (error && ["42703", "PGRST204"].includes(error.code ?? "")) ({ data, error } = await query(base));
  if (error && ["PGRST200", "PGRST205", "42P01"].includes(error.code ?? "")) ({ data, error } = await query(base));
  if (error) throw dbError(error);

  // Order numbers follow the store's invoice format (Settings is admin-only, so read it on the server).
  const format = serviceConfigured ? (await loadSettings(serviceClient())).invoice.numberFormat : "MEB-0000";

  // Fetch product-level reviews for all orders
  const orderNumbers = (data ?? []).map((o: any) => o.number);
  const { data: reviewsData, error: reviewsError } = orderNumbers.length > 0
    ? await client.from("reviews").select("order_number, product_id, rating, message, created_at").in("order_number", orderNumbers)
    : { data: [], error: null };

  // Build a map of (order_number, product_id) -> review
  const reviewMap = new Map<string, SavedReview>();
  if (!reviewsError && reviewsData) {
    for (const r of reviewsData) {
      const key = `${r.order_number}:${r.product_id}`;
      reviewMap.set(key, { rating: r.rating, message: r.message ?? "", createdAt: r.created_at });
    }
  }

  const orders = (data ?? []).map((o: any) => {
    const items = (o.order_items ?? []).map((i: any) => ({
      productId: i.product_id ?? null,
      name: i.name,
      packSize: i.pack_size ?? "",
      qty: i.qty,
      price: i.price,
      review: i.product_id ? reviewMap.get(`${o.number}:${i.product_id}`) ?? null : null,
    }));
    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
    const discount = o.discount ?? 0;
    const total = Math.max(0, subtotal + (o.shipping ?? 0) - discount);
    return {
      number: Number(o.number),
      label: orderLabel(Number(o.number), format),
      placedAt: o.placed_at,
      status: o.status as "New" | "Packed" | "Delivered" | "Cancelled",
      items,
      subtotal,
      shipping: o.shipping ?? 0,
      discount,
      total,
      paymentMode: o.payment_mode ?? "online",
      amountPaid: o.amount_paid ?? 0,
      tracking: o.transporter || o.tracking_number
        ? { transporter: o.transporter ?? "", number: o.tracking_number ?? "", dispatchDate: o.dispatch_date ?? "", status: o.tracking_status ?? "", url: o.tracking_url ?? "" }
        : null,
      refunded: o.payment_refunded ?? 0,
      address: o.address ?? "",
      shipName: o.ship_name ?? "",
      shipPhone: o.ship_phone ?? "",
      method: o.method,
      testPayment: String(o.payment_id ?? "").startsWith("dummy_"),
      deliveredAt: o.delivered_at ?? null,
      cancelReason: o.cancel_reason ?? "",
      timeline: [...(o.order_events ?? [])]
        .sort((a: any, b: any) => a.at.localeCompare(b.at))
        .map((e: any) => ({ label: e.label, note: e.note ?? null, at: e.at })),
    };
  });
  return json({ orders });
});
