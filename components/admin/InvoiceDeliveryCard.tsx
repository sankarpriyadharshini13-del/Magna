"use client";

import { useEffect, useState } from "react";
import { formatInr } from "@/lib/format";
import { useAdminData } from "@/lib/admin/store";
import type { Order } from "@/lib/admin/types";
import { Toggle } from "./ui";

/**
 * Distributor / Export invoice delivery options.
 * Free delivery prints "Delivery — Free". A delivery charge is added to the invoice total and can be
 * printed as its own line (Subtotal + Delivery = Total) or kept off the document while still counting
 * in the total.
 */
export default function InvoiceDeliveryCard({ order }: { order: Order }) {
  const { mutate } = useAdminData();
  const [mode, setMode] = useState<"free" | "charge">(order.deliveryCharge > 0 ? "charge" : "free");
  const [amount, setAmount] = useState(order.deliveryCharge > 0 ? String(order.deliveryCharge) : "");
  const [show, setShow] = useState(order.showDeliveryCharge);
  const [saving, setSaving] = useState(false);

  // Follow the saved order when another order is opened or a save comes back with new values.
  useEffect(() => {
    setMode(order.deliveryCharge > 0 ? "charge" : "free");
    setAmount(order.deliveryCharge > 0 ? String(order.deliveryCharge) : "");
    setShow(order.showDeliveryCharge);
  }, [order.number, order.deliveryCharge, order.showDeliveryCharge]);

  const charge = mode === "charge" ? Math.max(0, Number(amount) || 0) : 0;
  const dirty = charge !== order.deliveryCharge || show !== order.showDeliveryCharge;

  const save = async () => {
    setSaving(true);
    await mutate(
      `/api/admin/orders/${order.number}/delivery-charge`,
      "PUT",
      { delivery_charge: charge, show_delivery_charge: show },
      "Delivery options saved for the invoice.",
    );
    setSaving(false);
  };

  return (
    <div className="o-sec">
      <div className="adm-fl">Delivery on the invoice</div>
      <p className="adm-muted" style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.5 }}>
        Distributor and Export orders only. Free delivery prints “Delivery — Free”; a delivery charge is
        added to the invoice total.
      </p>

      <div role="group" aria-label="Delivery option" style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className={`adm-btn sm ${mode === "free" ? "pri" : ""}`}
          aria-pressed={mode === "free"}
          onClick={() => setMode("free")}
        >
          Free delivery
        </button>
        <button
          type="button"
          className={`adm-btn sm ${mode === "charge" ? "pri" : ""}`}
          aria-pressed={mode === "charge"}
          onClick={() => setMode("charge")}
        >
          Delivery charge
        </button>
      </div>

      {mode === "charge" && (
        <div className="adm-fg" style={{ marginBottom: 10 }}>
          <label className="adm-fl" htmlFor={`dc-${order.number}`}>Delivery charge (₹)</label>
          <input
            id={`dc-${order.number}`}
            className="adm-in"
            inputMode="numeric"
            value={amount}
            placeholder="e.g. 150"
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void save();
              }
            }}
          />
        </div>
      )}

      <div className="adm-tg-row" style={{ borderTop: "1px solid #efe8d8" }}>
        <span>Show delivery charge in the invoice</span>
        <Toggle checked={show} label="Show the delivery charge on the invoice" onChange={setShow} />
      </div>

      <p className="adm-muted" style={{ margin: "2px 0 10px", fontSize: 12 }}>
        {charge === 0
          ? "Invoice: Delivery — Free."
          : show
            ? `Invoice: Subtotal + ${formatInr(charge)} delivery = Total.`
            : `Invoice total includes ${formatInr(charge)} delivery; the delivery line stays hidden.`}
      </p>

      <div className="adm-box-a">
        <button type="button" className="adm-btn pri sm" onClick={save} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save delivery options"}
        </button>
      </div>
    </div>
  );
}
