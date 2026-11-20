import { HttpError, dbError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/**
 * Cancels New or Packed orders. The stock they held goes back to the shop, the status becomes
 * "Cancelled" (shown on the customer's My orders page) and a "Cancelled" update is logged on the
 * timeline. The admin can optionally say why — the reason is shown to the customer too.
 * Delivered orders are skipped; refunds stay in Payments & Refunds.
 */
export const POST = handle(async (req) => {
  const { client } = await requireAdmin(req);
  const body = await readJson<{ numbers?: unknown; reason?: unknown }>(req);
  const numbers = body.numbers;
  if (!Array.isArray(numbers) || !numbers.length || numbers.length > 200 || !numbers.every((n) => Number.isInteger(n) && n > 0)) {
    throw new HttpError(400, "Choose between 1 and 200 orders.");
  }
  if (body.reason !== undefined && body.reason !== null && typeof body.reason !== "string") {
    throw new HttpError(400, "The cancellation reason must be text.");
  }
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";
  const unique = Array.from(new Set(numbers as number[]));
  const { data, error } = await client.rpc("admin_cancel_orders", { p_numbers: unique, p_reason: reason });
  if (error) throw dbError(error);
  const cancelled = ((data ?? []) as (number | string)[]).map(Number);
  return json({ cancelled: cancelled.length, skipped: unique.length - cancelled.length });
});
