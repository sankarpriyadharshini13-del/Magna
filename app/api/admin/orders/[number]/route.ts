import { HttpError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";
import { orderSaveError, parseOrder } from "@/lib/server/model";

export const dynamic = "force-dynamic";

/**
 * "Edit" on Admin → Orders: updates any order (website or admin). Stock moves by the difference in
 * quantities; payments made on the website are never changed here.
 */
export const PUT = handle<{ params: { number: string } }>(async (req, { params }) => {
  const { client } = await requireAdmin(req);
  const number = Number(params.number);
  if (!Number.isInteger(number) || number <= 0) throw new HttpError(400, "Invalid order number.");
  const input = parseOrder(await readJson(req, 50_000), true);
  const { data, error } = await client.rpc("admin_save_order", { p_number: number, p: input });
  if (error) throw orderSaveError(error);
  return json({ number: Number(data) });
});
