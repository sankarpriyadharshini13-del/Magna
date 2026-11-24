import { HttpError, dbError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/**
 * Persists the display order for one catalogue. The client sends the full ordered list of product
 * ids for a channel; each product is given sort_order = its 1-based position, and any product not in
 * the list is reset to 0 (shown last).
 */
export const POST = handle(async (req) => {
  const { client } = await requireAdmin(req);
  const body = await readJson(req, 20_000);

  const channel = body.channel;
  if (channel !== "ecommerce" && channel !== "export") throw new HttpError(400, "Unknown catalogue.");

  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length) throw new HttpError(400, "No products to order.");

  const { data: rows, error } = await client.from("products").select("id").eq("channel", channel);
  if (error) throw dbError(error);
  const existing = (rows ?? []).map((r) => r.id as string);

  const order = new Map(ids.map((id, i) => [id, i + 1]));
  const results = await Promise.all(
    existing.map((id) => client.from("products").update({ sort_order: order.get(id) ?? 0 }).eq("id", id)),
  );
  for (const res of results) {
    if (res.error) {
      if (["42703", "PGRST204"].includes(res.error.code ?? ""))
        throw new HttpError(503, "Run supabase/migrations/20261124010000_product_sort_order.sql in the Supabase SQL Editor first.", "SCHEMA_MISSING");
      throw dbError(res.error);
    }
  }
  return json({ ok: true });
});
