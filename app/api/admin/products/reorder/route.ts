import { HttpError, dbError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/**
 * Persists the display order for one catalogue/page. The client sends the full ordered list of
 * product ids for a page; each product is given sort_order = its 1-based position, and any product
 * on that page that is missing from the list is reset to 0 (shown last).
 */
export const POST = handle(async (req) => {
  const { client } = await requireAdmin(req);
  const body = await readJson(req, 20_000);

  const channel = body.channel;
  if (channel !== "ecommerce" && channel !== "distributors" && channel !== "export") {
    throw new HttpError(400, "Unknown catalogue.");
  }
  const flag = channel === "ecommerce" ? "show_ecommerce" : channel === "distributors" ? "show_distributors" : "show_export";

  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length) throw new HttpError(400, "No products to order.");

  // Scope the reset to this page only, so ordering the shop never disturbs the export list.
  let query = await client.from("products").select("id").eq(flag, true);
  if (query.error && ["42703", "PGRST204"].includes(query.error.code ?? "")) {
    // Before the per-page switches: the old channel column decided the catalogue.
    query = await client.from("products").select("id").eq("channel", channel === "distributors" ? "ecommerce" : channel);
  }
  if (query.error) throw dbError(query.error);
  const existing = (query.data ?? []).map((r) => r.id as string);

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
