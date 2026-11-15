import { HttpError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/**
 * Updates only the delivery charge for an order.
 * Used by the Orders page when an admin edits the delivery charge inline.
 */
export const PUT = handle<{ params: { number: string } }>(async (req, { params }) => {
  const { client } = await requireAdmin(req);
  const number = Number(params.number);
  if (!Number.isInteger(number) || number <= 0) throw new HttpError(400, "Invalid order number.");

  const body = await readJson(req, 1000);
  const deliveryCharge = Number(body.delivery_charge);
  if (isNaN(deliveryCharge) || deliveryCharge < 0) {
    throw new HttpError(400, "Delivery charge must be a non-negative number.");
  }

  const { data, error } = await client
    .from("orders")
    .update({ delivery_charge: deliveryCharge })
    .eq("number", number)
    .select("number")
    .single();

  if (error) throw new HttpError(500, "Failed to update delivery charge.");
  if (!data) throw new HttpError(404, "Order not found.");

  return json({ number: Number(data.number) });
});
