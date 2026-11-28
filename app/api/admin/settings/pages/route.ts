import { HttpError, dbError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";
import { mergeSettings } from "@/lib/server/model";

export const dynamic = "force-dynamic";

/**
 * One-click page-wide switch from Admin → Products & Stock: hide (or show) every product on the
 * Ecommerce / Distributors / Export page. Only the `pages` part of the settings changes, so the
 * rest of the admin settings are never re-validated or overwritten.
 */
export const POST = handle(async (req) => {
  const { client } = await requireAdmin(req);
  const body = await readJson(req, 2_000);
  const page = body.page;
  if (page !== "ecommerce" && page !== "distributors" && page !== "export") {
    throw new HttpError(400, "Unknown page.");
  }
  if (typeof body.enabled !== "boolean") throw new HttpError(400, "Choose whether the page is shown.");

  const { data, error } = await client.from("app_settings").select("data").eq("id", 1).maybeSingle();
  if (error) throw dbError(error);
  const settings = mergeSettings(data?.data);
  settings.pages[page] = body.enabled;

  const { error: saveErr } = await client.from("app_settings").upsert({ id: 1, data: settings });
  if (saveErr) throw dbError(saveErr);
  return json({ settings });
});
