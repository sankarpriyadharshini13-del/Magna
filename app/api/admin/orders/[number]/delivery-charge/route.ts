import { HttpError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/**
 * Updates the delivery options for an order:
 *  - delivery_charge: 0 = free delivery, otherwise the amount kept in the order total.
 *  - show_delivery_charge: whether Distributor / Export invoices print the charge as its own line.
 * Used by the Orders page (inline charge box and the invoice delivery card).
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
  const show = typeof body.show_delivery_charge === "boolean" ? body.show_delivery_charge : undefined;

  // The show/hide flag arrives with its own migration; without it the amount still saves.
  let result = await client
    .from("orders")
    .update({ delivery_charge: deliveryCharge, ...(show === undefined ? {} : { show_delivery_charge: show }) })
    .eq("number", number)
    .select("number, delivery_charge, show_delivery_charge")
    .single();

  if (result.error && ["42703", "PGRST204"].includes(result.error.code ?? "")) {
    result = await client
      .from("orders")
      .update({ delivery_charge: deliveryCharge })
      .eq("number", number)
      .select("number, delivery_charge")
      .single();
  }
  if (result.error) throw new HttpError(500, "Failed to update delivery charge.");
  if (!result.data) throw new HttpError(404, "Order not found.");

  const row = result.data as { number: number; delivery_charge: number; show_delivery_charge?: boolean };
  return json({
    number: Number(row.number),
    delivery_charge: Number(row.delivery_charge),
    show_delivery_charge: row.show_delivery_charge === true,
  });
});
