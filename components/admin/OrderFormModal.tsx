"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/lib/admin/store";
import { TRACKING_STATUSES, type AdminProduct, type Customer, type Order, type PaymentMode } from "@/lib/admin/types";
import { formatInr } from "@/lib/format";
import { Modal } from "./ui";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const METHODS = [
  { v: "UPI", l: "UPI" },
  { v: "Cash", l: "Cash" },
  { v: "Card", l: "Card" },
  { v: "NetBanking", l: "Bank transfer" },
  { v: "Other", l: "Other" },
];
type Mode = Exclude<PaymentMode, "online">;
const NORMAL_PAY: { v: Mode; l: string }[] = [
  { v: "pending", l: "Payment pending" },
  { v: "cod", l: "Cash on delivery" },
  { v: "paid", l: "Already paid (UPI / cash)" },
];

interface Line {
  key: number;
  productId: string | null;
  /** Kept for lines whose product was deleted after the order was placed. */
  name: string;
  packSize: string;
  qty: number;
  price: string;
}

let nextKey = 1;
const blankLine = (): Line => ({ key: nextKey++, productId: null, name: "", packSize: "", qty: 1, price: "" });
const digits = (v: string) => v.replace(/\D/g, "");

/** Splits "14 Main St, Chennai, Tamil Nadu – 600099" back into the street line (city/state/PIN are their own fields). */
function streetLine(o: Order) {
  const { city, state, pincode } = o.location;
  const suffix = [city, state].filter(Boolean).join(", ") + (pincode ? ` – ${pincode}` : "");
  if (!suffix) return o.address;
  if (o.address === suffix) return "";
  return o.address.endsWith(`, ${suffix}`) ? o.address.slice(0, -(suffix.length + 2)) : o.address;
}

/**
 * Admin → Orders → "+ Add" (order = null) or "Edit".
 *  - Normal order: one customer, shop prices, shipping + discount.
 *  - Bulk order: a business (shops, events), bulk rate per product, freight, parcels and the transporter details
 *    the admin enters (manual tracking).
 */
export default function OrderFormModal({
  order,
  customer,
  onClose,
  onSaved,
}: {
  order: Order | null;
  customer?: Customer;
  onClose: () => void;
  onSaved: (number: number) => void;
}) {
  const { data, mutate, label } = useAdminData();
  const editing = !!order;
  const products = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products]);

  const [kind, setKind] = useState<"normal" | "bulk">(order?.kind ?? "normal");
  const [business, setBusiness] = useState(order?.businessName || (order?.kind === "bulk" ? customer?.name ?? "" : ""));
  const [gst, setGst] = useState(order?.gstNumber ?? "");
  const [name, setName] = useState(order ? order.shipName || customer?.name || "" : "");
  const [phone, setPhone] = useState(order ? order.shipPhone || customer?.phone || "" : "");
  const [email, setEmail] = useState(order ? order.email || customer?.email || "" : "");
  const [address, setAddress] = useState(order ? streetLine(order) : "");
  const [city, setCity] = useState(order ? order.location.city || customer?.city || "" : "");
  const [state, setState] = useState(order ? order.location.state || customer?.state || "Tamil Nadu" : "Tamil Nadu");
  const [pincode, setPincode] = useState(order?.location.pincode ?? "");
  const [note, setNote] = useState(order?.note ?? "");
  const [lines, setLines] = useState<Line[]>(() => {
    if (!order) return [blankLine()];

    // For enquiries with source="enquiry", the items might not have been saved properly in older versions.
    // Parse the note to extract product details if needed.
    if (order.source === "enquiry" && order.items.length === 1 && order.items[0].name.includes("enquiry")) {
      const parsedLines: Line[] = [];
      const noteLines = order.note.split("\n");
      for (const line of noteLines) {
        if (line.startsWith("Products interested:")) {
          const products = line.replace("Products interested:", "").trim().split(", ");
          const packSizesLine = noteLines.find((l) => l.startsWith("Pack sizes:"));
          const packSizes = packSizesLine ? packSizesLine.replace("Pack sizes:", "").trim().split(", ") : [];
          const quantityLine = noteLines.find((l) => l.startsWith("Estimated quantity:"));
          const quantities = quantityLine ? quantityLine.replace("Estimated quantity:", "").trim().split("; ") : [];

          products.forEach((product, i) => {
            const qtyMatch = quantities[i]?.match(/(\d+)/);
            const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
            parsedLines.push({
              key: nextKey++,
              productId: null,
              name: product.trim(),
              packSize: packSizes[i]?.trim() || "",
              qty,
              price: "0",
            });
          });
        }
      }
      return parsedLines.length > 0 ? parsedLines : [blankLine()];
    }

    // Normal order: use the items as-is
    return order.items.map((i) => ({ key: nextKey++, productId: i.productId || null, name: i.name, packSize: i.packSize, qty: i.qty, price: String(i.price) }));
  });
  const [shipping, setShipping] = useState(order ? String(order.shipping) : "0");
  const [discount, setDiscount] = useState(order ? String(order.discount ?? 0) : "0");
  const [deliveryCharge, setDeliveryCharge] = useState(order ? String(order.deliveryCharge ?? 0) : "0");
  const [boxes, setBoxes] = useState(order?.boxes != null ? String(order.boxes) : "");
  const [weight, setWeight] = useState(order?.totalWeight ?? "");
  const [transporter, setTransporter] = useState(order?.tracking?.transporter ?? "");
  const [trackingNo, setTrackingNo] = useState(order?.tracking?.number ?? "");
  const [dispatchDate, setDispatchDate] = useState(order?.tracking?.dispatchDate ?? "");
  const [trackingStatus, setTrackingStatus] = useState<string>(order?.tracking?.status || "Not dispatched");
  const [trackingUrl, setTrackingUrl] = useState(order?.tracking?.url ?? "");
  const onlinePaid = order ? order.paymentMode === "online" || order.payment.refunded > 0 : false;
  const [mode, setMode] = useState<Mode>(order && order.paymentMode !== "online" ? order.paymentMode : "pending");
  const [method, setMethod] = useState<string>(order && order.method !== "Wallet" ? order.method : "UPI");
  const [advance, setAdvance] = useState(order?.paymentMode === "advance" ? String(order.amountPaid) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const num = (v: string) => (v.trim() === "" ? 0 : Number(v));
  const priceOf = (l: Line) => {
    const val = Number(l.price);
    return l.productId ? (l.price.trim() === "" ? NaN : val) : val; // Enquiry lines always have a valid price (0)
  };
  const subtotal = lines.reduce((s, l) => s + (Number.isFinite(priceOf(l)) ? priceOf(l) * l.qty : 0), 0);
  // Bulk orders are priced per line (bulk rates), so they have no separate discount.
  const discountNum = kind === "bulk" ? 0 : num(discount);
  const deliveryChargeNum = num(deliveryCharge);
  const total = Math.max(0, subtotal + num(shipping) + deliveryChargeNum - discountNum);
  const filledLines = lines.filter((l) => l.productId || l.name);
  const units = filledLines.reduce((s, l) => s + l.qty, 0);
  const advanceNum = Number(advance);
  const paid = onlinePaid ? total : mode === "paid" ? total : mode === "advance" && Number.isFinite(advanceNum) ? advanceNum : 0;

  // Stock this order may use: what's on the shelf plus what this order already holds (when editing).
  const held = useMemo(() => {
    const m = new Map<string, number>();
    if (order && order.status !== "Cancelled") for (const i of order.items) if (i.productId) m.set(i.productId, (m.get(i.productId) ?? 0) + i.qty);
    return m;
  }, [order]);
  const wanted = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of lines) if (l.productId) m.set(l.productId, (m.get(l.productId) ?? 0) + l.qty);
    return m;
  }, [lines]);
  const available = (id: string) => (products.get(id)?.stock ?? 0) + (held.get(id) ?? 0);
  const shortOf = (l: Line) => (order?.status === "Cancelled" || !l.productId || !products.has(l.productId) ? null : (wanted.get(l.productId) ?? 0) > available(l.productId) ? available(l.productId) : null);

  const clearErr = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  const update = (key: number, patch: Partial<Line>) => {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
    clearErr("items");
  };
  const chooseProduct = (key: number, id: string) => {
    const p = products.get(id);
    // The same product can appear twice in different pack sizes; start on the first size this order doesn't already have.
    const used = new Set(lines.filter((l) => l.key !== key && l.productId === id).map((l) => l.packSize));
    const sizes = sizesFor(p);
    const packSize = sizes.find((s) => !used.has(s)) ?? sizes[0] ?? "";
    update(key, { productId: id || null, name: p?.name ?? "", packSize, price: p?.price != null ? String(p.price) : "" });
  };
  const switchKind = (k: "normal" | "bulk") => {
    if (k === kind) return;
    setKind(k);
    setErrors({});
    // Normal orders use shop prices; bulk orders start from them and can be changed per line.
    if (k === "normal") setLines((ls) => ls.map((l) => (l.productId && products.get(l.productId)?.price != null ? { ...l, price: String(products.get(l.productId)!.price) } : l)));
    if (k === "normal" && mode === "advance") setMode("pending");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (kind === "bulk" && !business.trim()) e.business = "Business name is required.";
    if (!name.trim()) e.name = kind === "bulk" ? "Contact person is required." : "Customer name is required.";
    if (digits(phone).length < 10) e.phone = "Enter a valid phone number.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email.";
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) e.pincode = "Pincode must be 6 digits.";
    if (kind === "bulk" && gst.trim() && !/^[0-9A-Za-z]{15}$/.test(gst.trim())) e.gst = "GST number is 15 letters and digits.";
    if (filledLines.length === 0) e.items = "Add at least one product.";
    // For enquiries (source="enquiry"), allow lines without productId - they have name and packSize instead
    const isEnquiry = order?.source === "enquiry";
    if (!isEnquiry && filledLines.some((l) => !l.productId && !editing)) e.items = "Choose a product on every line.";
    // For non-enquiry lines, validate prices
    if (!isEnquiry && !e.items && filledLines.some((l) => l.productId && (!Number.isInteger(priceOf(l)) || priceOf(l) < 0))) {
      e.items = kind === "normal" ? "One of the products has no price yet — set it in Products & Stock, or use a bulk order." : "Enter a price for every product.";
    }
    // Only check stock for non-enquiry lines with valid products
    if (!isEnquiry && !e.items && filledLines.some((l) => shortOf(l) != null)) e.items = "Some quantities are more than the stock available.";
    if (subtotal + num(shipping) - discountNum < 0) e.discount = "The discount can't be more than the total.";
    if (kind === "bulk" && trackingUrl.trim() && !/^https?:\/\/\S+\.\S+/i.test(trackingUrl.trim())) e.trackingUrl = "Start the link with https://";
    if (!onlinePaid && mode === "advance" && (!Number.isInteger(advanceNum) || advanceNum <= 0 || advanceNum >= total)) e.advance = "Enter an advance above ₹0 and below the total.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (busy || !validate()) return;
    setBusy(true);
    const body = {
      kind,
      business_name: business.trim(),
      gst_number: gst.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      note: note.trim(),
      shipping: num(shipping),
      discount: discountNum,
      delivery_charge: deliveryChargeNum,
      boxes: boxes.trim() === "" ? null : Number(boxes),
      total_weight: weight.trim(),
      transporter: transporter.trim(),
      tracking_number: trackingNo.trim(),
      dispatch_date: dispatchDate,
      tracking_status: transporter.trim() || trackingNo.trim() || dispatchDate ? trackingStatus : "",
      tracking_url: trackingUrl.trim(),
      payment_mode: onlinePaid ? "pending" : mode,
      method,
      amount_paid: mode === "advance" ? advanceNum : 0,
      items: filledLines.map((l) => ({
        product_id: l.productId,
        name: l.name,
        pack_size: l.packSize,
        qty: l.qty,
        price: l.productId ? priceOf(l) : 0, // Enquiry lines have no price
      })),
    };
    const res = editing
      ? await mutate<{ number: number }>(`/api/admin/orders/${order!.number}`, "PUT", body, `Order #${label(order!.number)} updated.`)
      : await mutate<{ number: number }>("/api/admin/orders", "POST", body, (r) => `Order #${label(r.number)} added.`);
    setBusy(false);
    if (res.ok && res.data) {
      onSaved(res.data.number);
      onClose();
    }
  };

  const field = (id: string, text: string, input: React.ReactNode, err?: string) => (
    <div className="mo-f">
      <label htmlFor={id}>{text}</label>
      {input}
      {err && <p className="adm-err">{err}</p>}
    </div>
  );
  const input = (id: string, value: string, set: (v: string) => void, opts: { err?: string; placeholder?: string; inputMode?: "numeric" | "tel" | "email"; maxLength?: number; type?: string } = {}) => (
    <input
      id={id}
      className={`mo-in${opts.err ? " err" : ""}`}
      value={value}
      type={opts.type ?? "text"}
      inputMode={opts.inputMode}
      maxLength={opts.maxLength}
      placeholder={opts.placeholder}
      onChange={(e) => { set(e.target.value); clearErr(id.replace("mo-", "")); }}
    />
  );
  const productOptions = (key: number) =>
    data.products.map((p: AdminProduct) => {
      const listed = sizesFor(p);
      const sizes = listed.length ? listed : [""];
      // A product with every pack size already on another line can't be added a second time.
      const allUsed = sizes.every((s) => lines.some((l) => l.key !== key && l.productId === p.id && l.packSize === s));
      return (
        <option key={p.id} value={p.id} disabled={allUsed}>
          {p.name}{!p.visible ? " (hidden from shop)" : ""}{available(p.id) <= 0 ? " (out of stock)" : ""}
        </option>
      );
    });
  /** Every pack size a product is sold in; older products fall back to their single saved size. */
  const sizesFor = (p?: AdminProduct) =>
    p ? (p.packSizes?.length ? p.packSizes : [p.packSize].filter(Boolean)) : [];
  /** A size can only sit on one line per product, so a second line has to use a different pack. */
  const packUsed = (key: number, productId: string | null, size: string) =>
    !!productId && lines.some((l) => l.key !== key && l.productId === productId && l.packSize === size);
  /** Small editable amount shown inside the order summary (shipping / freight / discount). */
  const amount = (id: string, value: string, set: (v: string) => void, labelText: string, err?: string) => {
    const shown = value === "" ? "" : Number(value).toLocaleString("en-IN");
    return (
      <span className={`mo-amt${err ? " err" : ""}`}>
        ₹<input
          id={id}
          aria-label={labelText}
          inputMode="numeric"
          value={shown}
          placeholder="0"
          // Digits are about 1ch wide, commas much narrower: size the box to the number so "₹1,800" has no gap.
          style={{ width: `${Math.max(1, shown.replace(/,/g, "").length) + (shown.split(",").length - 1) * 0.4 + 0.3}ch` }}
          onChange={(e) => { set(digits(e.target.value)); clearErr("discount"); clearErr("advance"); }}
          onFocus={(e) => e.target.select()}
        />
      </span>
    );
  };
  const methodSelect = (
    <select className="mo-in mo-sel" aria-label="Paid by" value={method} onChange={(e) => setMethod(e.target.value)}>
      {METHODS.map((m) => <option key={m.v} value={m.v}>Paid by {m.l}</option>)}
    </select>
  );

  const bulk = kind === "bulk";
  const cta = editing ? "Save changes" : bulk ? "Create bulk order" : "Create order";

  return (
    <Modal
      xl
      title={editing ? `Edit order #${label(order!.number)}` : "Add order"}
      onClose={onClose}
      footer={
        <>
          <span className="mo-foot-note">
            {editing
              ? `Placed ${new Date(order!.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}${order!.source === "online" ? " on the website" : order!.source === "enquiry" ? " via a website enquiry" : " by an admin"}`
              : "Order number is created automatically"}
          </span>
          <button type="button" className="mo-btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="mo-btn pri" onClick={submit} disabled={busy}>
            {busy ? "Saving…" : `${cta} · ${formatInr(total)}`}
          </button>
        </>
      }
    >
      <div className="mo-kind" role="radiogroup" aria-label="Order type">
        {(["normal", "bulk"] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={kind === k} className={kind === k ? "on" : ""} onClick={() => switchKind(k)}>
            <b>{k === "normal" ? "Normal order" : "Bulk order"}</b>
            <span>{k === "normal" ? "One customer · 1–5 items · shop prices" : "Shops, events, large quantity · you add the tracking"}</span>
          </button>
        ))}
      </div>

      <div className="mo-grid">
        <div className="mo-main">
          {bulk ? (
            <>
              <h3 className="mo-sec">Business / customer</h3>
              <div className="mo-row">
                {field("mo-business", "Business name", input("mo-business", business, setBusiness, { err: errors.business, placeholder: "e.g. Sri Naturals Store" }), errors.business)}
                {field("mo-name", "Contact person", input("mo-name", name, setName, { err: errors.name }), errors.name)}
                {field("mo-phone", "Phone", input("mo-phone", phone, setPhone, { err: errors.phone, inputMode: "tel", placeholder: "+91" }), errors.phone)}
              </div>
              <div className="mo-row">
                {field("mo-gst", "GST number (optional)", input("mo-gst", gst, (v) => setGst(v.toUpperCase()), { err: errors.gst, maxLength: 15 }), errors.gst)}
                {field("mo-city", "City", input("mo-city", city, setCity))}
                {field("mo-pincode", "Pincode", input("mo-pincode", pincode, (v) => setPincode(digits(v)), { err: errors.pincode, inputMode: "numeric", maxLength: 6 }), errors.pincode)}
              </div>
              <div className="mo-row one">
                {field("mo-address", "Delivery address", input("mo-address", address, setAddress, { placeholder: "Door no., street, area" }))}
              </div>
            </>
          ) : (
            <>
              <h3 className="mo-sec">Customer</h3>
              <div className="mo-row">
                {field("mo-name", "Name", input("mo-name", name, setName, { err: errors.name }), errors.name)}
                {field("mo-phone", "Phone", input("mo-phone", phone, setPhone, { err: errors.phone, inputMode: "tel", placeholder: "+91" }), errors.phone)}
                {field("mo-email", "Email (optional)", input("mo-email", email, setEmail, { err: errors.email, type: "email" }), errors.email)}
              </div>
              <h3 className="mo-sec">Delivery address</h3>
              <div className="mo-row one">
                {field("mo-address", "Address", input("mo-address", address, setAddress, { placeholder: "Door no., street, area" }))}
              </div>
              <div className="mo-row">
                {field("mo-city", "City", input("mo-city", city, setCity))}
                {field("mo-state", "State", (
                  <select id="mo-state" className="mo-in mo-sel" value={state} onChange={(e) => setState(e.target.value)}>
                    {!STATES.includes(state) && state && <option value={state}>{state}</option>}
                    <option value="">—</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ))}
                {field("mo-pincode", "Pincode", input("mo-pincode", pincode, (v) => setPincode(digits(v)), { err: errors.pincode, inputMode: "numeric", maxLength: 6 }), errors.pincode)}
              </div>
            </>
          )}

          <h3 className="mo-sec">{bulk ? "Products and quantity" : "Products"}</h3>
          <table className="mo-items">
            <thead>
              <tr><th>Product</th><th>Pack</th><th>Quantity</th><th>Price</th><th className="r">Total</th><th aria-label="Remove" /></tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => {
                const p = l.productId ? products.get(l.productId) : undefined;
                const short = shortOf(l);
                const price = priceOf(l);
                const removed = (l.productId && !p) || (!l.productId && l.name);
                const sizes = sizesFor(p);
                const isEnquiryLine = !l.productId && l.name && order?.source === "enquiry";
                return (
                  <tr key={l.key}>
                    <td className="mo-prod">
                      {isEnquiryLine ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{l.name}</span>
                          <span className="text-xs text-ink/50">(Enquiry)</span>
                        </div>
                      ) : removed ? (
                        <span title="This product was removed from the catalogue">{l.name} <em>(removed)</em></span>
                      ) : (
                        <select
                          className={`mo-prod-sel${l.productId ? " set" : ""}`}
                          aria-label={`Product ${idx + 1}`}
                          value={l.productId ?? ""}
                          onChange={(e) => chooseProduct(l.key, e.target.value)}
                        >
                          <option value="">Choose a product…</option>
                          {productOptions(l.key)}
                        </select>
                      )}
                    </td>
                    <td className="mo-pack">
                      {isEnquiryLine ? (
                        <input
                          type="text"
                          className="mo-in"
                          value={l.packSize}
                          onChange={(e) => update(l.key, { packSize: e.target.value })}
                          placeholder="Pack size"
                          aria-label={`Pack size for ${l.name}`}
                        />
                      ) : sizes.length > 1 ? (
                        <select
                          className="mo-pack-sel"
                          aria-label={`Pack size of product ${idx + 1}`}
                          value={l.packSize}
                          onChange={(e) => update(l.key, { packSize: e.target.value })}
                        >
                          {l.packSize && !sizes.includes(l.packSize) && <option value={l.packSize}>{l.packSize}</option>}
                          {sizes.map((s) => <option key={s} value={s} disabled={packUsed(l.key, l.productId, s)}>{s}</option>)}
                        </select>
                      ) : (
                        l.packSize || sizes[0] || "—"
                      )}
                    </td>
                    <td>
                      <div className="mo-qty" role="group" aria-label={`Quantity of product ${idx + 1}`}>
                        <button type="button" aria-label="Decrease" disabled={l.qty <= 1} onClick={() => update(l.key, { qty: Math.max(1, l.qty - 1) })}>−</button>
                        <input
                          inputMode="numeric"
                          aria-label="Quantity"
                          value={l.qty}
                          onChange={(e) => update(l.key, { qty: Math.min(100000, Math.max(1, Number(digits(e.target.value)) || 1)) })}
                        />
                        <button type="button" aria-label="Increase" onClick={() => update(l.key, { qty: Math.min(100000, l.qty + 1) })}>+</button>
                      </div>
                      {short != null && <span className="mo-short">Only {short} in stock</span>}
                    </td>
                    <td className="mo-price">
                      {bulk ? (
                        <>
                          ₹<input
                            inputMode="numeric"
                            aria-label={`Bulk price of product ${idx + 1}`}
                            value={l.price}
                            style={{ width: `${Math.max(2, l.price.length) + 1}ch` }}
                            onChange={(e) => update(l.key, { price: digits(e.target.value) })}
                          />
                          <em>bulk rate</em>
                        </>
                      ) : Number.isFinite(price) ? (
                        formatInr(price)
                      ) : (
                        <span className="mo-muted">{l.productId ? "No price" : "—"}</span>
                      )}
                    </td>
                    <td className="r mo-line-total">{Number.isFinite(price) && (l.productId || l.name) ? formatInr(price * l.qty) : "—"}</td>
                    <td className="mo-rm">
                      <button type="button" aria-label={`Remove product ${idx + 1}`} disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mo-add">
            <button type="button" className="mo-link" onClick={() => setLines((ls) => [...ls, blankLine()])} disabled={lines.length >= 50}>
              + Add another product
            </button>
            {bulk && <span>Total units: {units}</span>}
          </div>
          {errors.items && <p className="adm-err">{errors.items}</p>}

          {bulk ? (
            <>
              <div className="mo-row mo-gap">
                {field("mo-boxes", "Boxes / parcels", input("mo-boxes", boxes, (v) => setBoxes(digits(v)), { inputMode: "numeric", placeholder: "e.g. 6" }))}
                {field("mo-weight", "Total weight", input("mo-weight", weight, setWeight, { placeholder: "e.g. 42 kg", maxLength: 20 }))}
                {onlinePaid ? (
                  field("mo-pay", "Payment", <div className="mo-in mo-static">Paid on the website ({order!.method})</div>)
                ) : (
                  field("mo-pay", "Payment", (
                    <select
                      id="mo-pay"
                      className="mo-in mo-sel"
                      value={mode}
                      onChange={(e) => {
                        setMode(e.target.value as Mode);
                        clearErr("advance");
                        // The advance amount is entered in the order summary.
                        if (e.target.value === "advance") requestAnimationFrame(() => document.getElementById("mo-advance")?.focus());
                      }}
                    >
                      <option value="paid">Fully paid</option>
                      <option value="advance">{mode === "advance" && advanceNum > 0 ? `Advance ${formatInr(advanceNum)} received` : "Advance received"}</option>
                      <option value="pending">Not paid yet</option>
                    </select>
                  ))
                )}
              </div>

              <fieldset className="mo-track">
                <legend>Manual tracking · bulk orders only</legend>
                <div className="mo-row two">
                  {field("mo-transporter", "Transporter / courier", input("mo-transporter", transporter, setTransporter, { placeholder: "e.g. VRL Logistics", maxLength: 80 }))}
                  {field("mo-lr", "Tracking / LR number", input("mo-lr", trackingNo, setTrackingNo, { maxLength: 60 }))}
                </div>
                <div className="mo-row">
                  {field("mo-dispatch", "Dispatch date", input("mo-dispatch", dispatchDate, setDispatchDate, { type: "date" }))}
                  {field("mo-tstatus", "Status", (
                    <select id="mo-tstatus" className="mo-in mo-sel" value={trackingStatus} onChange={(e) => setTrackingStatus(e.target.value)}>
                      {TRACKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ))}
                  {field("mo-trackingUrl", "Tracking link (optional)", input("mo-trackingUrl", trackingUrl, setTrackingUrl, { err: errors.trackingUrl, placeholder: "https://...", maxLength: 300 }), errors.trackingUrl)}
                </div>
                <p className="mo-track-note">
                  You enter the transporter details yourself and update the status as it moves. The customer sees them on their My orders page.
                </p>
              </fieldset>
            </>
          ) : (
            <>
              <h3 className="mo-sec">Payment</h3>
              {onlinePaid ? (
                <div className="mo-info">
                  {order!.payment.refunded > 0
                    ? `Refunded ${formatInr(order!.payment.refunded)} — payment details can't be changed here.`
                    : `Paid on the website via ${order!.method}${order!.payment.id.startsWith("dummy_") ? " (test payment)" : ""}. Use Payments & Refunds for refunds.`}
                </div>
              ) : (
                <div className="mo-pay">
                  <div role="radiogroup" aria-label="Payment" className="mo-chips">
                    {NORMAL_PAY.map((o) => (
                      <button key={o.v} type="button" role="radio" aria-checked={mode === o.v} className={mode === o.v ? "on" : ""} onClick={() => setMode(o.v)}>
                        {mode === o.v && <i aria-hidden="true" />}{o.l}
                      </button>
                    ))}
                  </div>
                  {mode === "paid" && <div className="mo-method">{methodSelect}</div>}
                </div>
              )}
              <div className="mo-row one mo-gap">
                {field("mo-note", "Note for packing (optional)", input("mo-note", note, setNote, { placeholder: "Please pack gently", maxLength: 500 }))}
              </div>
            </>
          )}
        </div>

        <aside className="mo-side">
          <section className="mo-card" aria-labelledby="mo-h-sum">
            <h3 id="mo-h-sum" className="mo-sec">Order summary</h3>
            {bulk ? (
              <>
                <div className="mo-sr"><span>Units ({filledLines.length} product{filledLines.length === 1 ? "" : "s"})</span><b>{units}</b></div>
                <div className="mo-sr"><span>Items</span><b>{formatInr(subtotal)}</b></div>
                <div className="mo-sr"><span>Freight (paid to transporter)</span>{amount("mo-shipping", shipping, setShipping, "Freight")}</div>
                <div className="mo-sr"><span>Delivery Charge</span>{amount("mo-delivery-charge", deliveryCharge, setDeliveryCharge, "Delivery Charge")}</div>
              </>
            ) : (
              <>
                <div className="mo-sr"><span>Items ({units})</span><b>{formatInr(subtotal)}</b></div>
                <div className="mo-sr"><span>Shipping</span>{amount("mo-shipping", shipping, setShipping, "Shipping")}</div>
                <div className="mo-sr"><span>Delivery Charge</span>{amount("mo-delivery-charge", deliveryCharge, setDeliveryCharge, "Delivery Charge")}</div>
                <div className="mo-sr"><span>Discount</span>{amount("mo-discount", discount, setDiscount, "Discount")}</div>
              </>
            )}
            {errors.discount && <p className="adm-err">{errors.discount}</p>}
            <div className="mo-total"><span>Total</span><span>{formatInr(total)}</span></div>
            {bulk && !onlinePaid && (
              <>
                <div className="mo-sr sm">
                  <span>{mode === "advance" ? "Advance received" : mode === "paid" ? "Paid" : "Received"}</span>
                  {mode === "advance" ? amount("mo-advance", advance, setAdvance, "Advance received", errors.advance) : <span>{formatInr(paid)}</span>}
                </div>
                {errors.advance && <p className="adm-err">{errors.advance}</p>}
                <div className="mo-sr sm"><span>Balance due</span><span className={total - paid > 0 ? "due" : ""}>{formatInr(Math.max(0, total - paid))}</span></div>
              </>
            )}
          </section>

          <section className="mo-card" aria-labelledby="mo-h-after">
            <h3 id="mo-h-after" className="mo-sec">{editing ? "When you save" : "After you create it"}</h3>
            <ul className="mo-list">
              {editing ? (
                <>
                  <li>The order is updated everywhere</li>
                  <li>Stock moves by the change in quantity</li>
                  <li>The timeline notes the edit</li>
                </>
              ) : bulk ? (
                <>
                  <li>Shows in Orders with a <b>Bulk</b> tag</li>
                  <li>Stock reduces by quantity</li>
                  <li>Invoice with the GST number</li>
                  <li>Tracking is the one you entered</li>
                </>
              ) : (
                <>
                  <li>Order appears as <b>New</b></li>
                  <li>Stock reduces by quantity</li>
                  <li>Print invoice from the order</li>
                </>
              )}
            </ul>
          </section>
        </aside>
      </div>
    </Modal>
  );
}
