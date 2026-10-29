import { handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";
import { orderSaveError, parseOrder } from "@/lib/server/model";

export const dynamic = "force-dynamic";

/** "+ Add" on Admin → Orders: a Normal or Bulk order entered by an admin. Stock goes down by the quantities. */
export const POST = handle(async (req) => {
  const { client } = await requireAdmin(req);
  const input = parseOrder(await readJson(req, 50_000), false);
  const { data, error } = await client.rpc("admin_save_order", { p_number: null, p: input });
  if (error) throw orderSaveError(error);
  return json({ number: Number(data) }, 201);
});
