import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Settings } from "@/lib/admin/types";
import { LOW_STOCK } from "@/lib/admin/logic";
import { adminNewOrderEmail, deliveredEmail, lowStockEmail, orderConfirmationEmail, sendEmail, type EmailOrder } from "./email";
import { mergeSettings } from "./model";

export const EMAIL_ORDER_COLUMNS =
  "number, placed_at, email, ship_name, ship_phone, address, method, payment_id, shipping, order_items(name, pack_size, qty, price)";
const STOCK_COLUMNS = "order_items(product_id, products(name, pack_size, stock, visible, channel))";
/** Same query before the channel migration is applied (PostgREST errors on an unknown column). */
const STOCK_COLUMNS_LEGACY = "order_items(product_id, products(name, pack_size, stock, visible))";

/** Order lines plus their product's stock; `channel` is dropped until the migration adds it. */
async function stockForOrder(client: SupabaseClient, orderNumber: number) {
  const first = await client.from("orders").select(STOCK_COLUMNS).eq("number", orderNumber).maybeSingle();
  if (!first.error || (first.error.code !== "42703" && first.error.code !== "PGRST204")) return first.data;
  const legacy = await client.from("orders").select(STOCK_COLUMNS_LEGACY).eq("number", orderNumber).maybeSingle();
  return legacy.data;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function toEmailOrder(r: any): EmailOrder {
  return {
    number: Number(r.number),
    placedAt: r.placed_at,
    email: r.email ?? "",
    shipName: r.ship_name || "there",
    shipPhone: r.ship_phone ?? "",
    address: r.address ?? "",
    method: r.method ?? "",
    paymentId: r.payment_id ?? "",
    shipping: r.shipping ?? 0,
    items: (r.order_items ?? []).map((i: any) => ({ name: i.name, packSize: i.pack_size ?? "", qty: i.qty, price: i.price })),
  };
}

export async function loadSettings(client: SupabaseClient): Promise<Settings> {
  const { data } = await client.from("app_settings").select("data").eq("id", 1).maybeSingle();
  return mergeSettings(data?.data);
}

/**
 * Customer confirmation + admin notification for a newly paid order, and a low-stock alert to the admins when
 * the purchase left products at or below LOW_STOCK units (stock itself is already lowered by finalize_checkout).
 * Failures are logged, never thrown.
 */
export async function notifyOrderPlaced(client: SupabaseClient, orderNumber: number) {
  try {
    const [{ data: row }, settings, { data: owner }, stockRow] = await Promise.all([
      client.from("orders").select(EMAIL_ORDER_COLUMNS).eq("number", orderNumber).maybeSingle(),
      loadSettings(client),
      client.from("admin_members").select("email").eq("role", "owner").maybeSingle(),
      stockForOrder(client, orderNumber),
    ]);
    if (!row) return;
    const order = toEmailOrder(row);
    const admins = Array.from(new Set([settings.store.email, owner?.email].filter((e): e is string => !!e).map((e) => e.toLowerCase())));
    const jobs: Promise<unknown>[] = [];
    if (settings.notifications.orderEmail && order.email) {
      jobs.push(sendEmail({ to: order.email, replyTo: settings.store.email || undefined, ...orderConfirmationEmail(order, settings) }));
    }
    if (settings.notifications.newOrder && admins.length) {
      jobs.push(sendEmail({ to: admins, replyTo: order.email || undefined, ...adminNewOrderEmail(order, settings) }));
    }
    if (settings.notifications.lowStock && admins.length) {
      const seen = new Set<string>();
      const low = ((stockRow?.order_items ?? []) as any[])
        .map((i) => ({ id: i.product_id as string | null, p: Array.isArray(i.products) ? i.products[0] : i.products }))
        .filter(({ id, p }) => id && p && p.visible && p.channel !== "export" && p.stock <= LOW_STOCK && !seen.has(id) && seen.add(id))
        .map(({ p }) => ({ name: p.name as string, packSize: (p.pack_size as string) ?? "", stock: p.stock as number }));
      if (low.length) jobs.push(sendEmail({ to: admins, ...lowStockEmail(low, orderNumber, settings) }));
    }
    await Promise.all(jobs);
  } catch (e) {
    console.error("[notify] order emails failed", (e as Error).message);
  }
}

export async function notifyDelivered(client: SupabaseClient, rows: any[]) {
  try {
    const settings = await loadSettings(client);
    if (!settings.notifications.orderEmail) return;
    await Promise.all(
      rows
        .map(toEmailOrder)
        .filter((o) => o.email)
        .map((o) => sendEmail({ to: o.email, replyTo: settings.store.email || undefined, ...deliveredEmail(o, settings) })),
    );
  } catch (e) {
    console.error("[notify] delivery emails failed", (e as Error).message);
  }
}
