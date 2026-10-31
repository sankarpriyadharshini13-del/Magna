import { barcodeSvgString } from "./code128";
import { groupBarcode, isTestPayment, maskPaymentId, orderLabel } from "./format";
import { orderSubtotal, orderTotal, paymentLabel } from "./logic";
import type { AdminProduct, Customer, Order, Settings } from "./types";

/**
 * Printable documents (invoice, product label sheet).
 * Each builder returns an HTML fragment sized with container-query units, so the same
 * markup renders as the on-screen preview and as the printed page.
 */

export const esc = (v: string | number) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

export const DOC_CSS = `
.doc{container-type:inline-size;color:#2b2f2a;font-family:Inter,"Segoe UI",system-ui,Arial,sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.doc *{box-sizing:border-box}
.iv{background:#fff;font-size:1.85cqw;line-height:1.55}
.iv-top{display:flex;justify-content:space-between;align-items:center;gap:3cqw;background:#2f5d3a;color:#fff;padding:4.4cqw 5.4cqw;border-bottom:.75cqw solid #e2b94f}
.iv-brand{display:flex;align-items:center;gap:2cqw}
.iv-logo{width:6cqw;height:6cqw;border-radius:50%;background:#4f7a59;display:grid;place-items:center;flex-shrink:0;overflow:hidden}
.iv-logo svg{width:3.2cqw;height:3.2cqw}
.iv-logo img{width:100%;height:100%;object-fit:cover}
.iv-brand b{display:block;font-family:Fraunces,Georgia,"Times New Roman",serif;font-size:4cqw;line-height:1.1;font-weight:700}
.iv-brand span{display:block;font-size:1.85cqw;color:#dfe9e1;margin-top:.4cqw}
.iv-no{text-align:right}
.iv-no span{display:block;font-size:1.85cqw;color:#e8efe9}
.iv-no b{display:block;font-family:Fraunces,Georgia,"Times New Roman",serif;font-size:3.5cqw;line-height:1.25;font-weight:700;margin:.3cqw 0}
.iv-body{padding:5cqw 5.4cqw 3cqw}
.iv-lbl{display:block;font-size:1.8cqw;color:#2b2f2a;margin-bottom:.8cqw}
.iv-parties{display:grid;grid-template-columns:1fr 1fr 19cqw;gap:3cqw;align-items:start}
.iv-parties b{display:block;color:#3f6b45;font-size:1.95cqw;margin-bottom:.5cqw}
.iv-parties p{margin:0;color:#777b74;font-size:1.85cqw;line-height:1.7}
.iv-code{text-align:center}
.iv-bars{height:6.6cqw}
.iv-code span{display:block;font-size:1.5cqw;color:#555;margin-top:.9cqw}
.iv-band{background:#1f2b22;color:#e6ece6;border-radius:1.3cqw;padding:2.2cqw 2.4cqw;margin:4.2cqw 0 2.4cqw}
.iv-band-row{display:flex;flex-wrap:wrap;gap:1cqw 4cqw;font-size:1.8cqw}
.iv-band b{color:#fff;font-weight:700}
.iv-state{color:#8fd19e;font-weight:700;font-size:1.8cqw;margin-top:1.2cqw}
.iv-items{width:100%;border-collapse:collapse}
.iv-items th{text-align:left;font-size:1.8cqw;font-weight:700;color:#3b3f3a;padding:1.6cqw 1.3cqw;border-bottom:.3cqw solid #8ccf98}
.iv-items td{padding:2.2cqw 1.3cqw;border-bottom:.15cqw solid #3a3d39;vertical-align:top;color:#8a8e88;font-size:1.85cqw}
.iv-items th:nth-child(n+2),.iv-items td:nth-child(n+2){text-align:right}
.iv-items th:nth-child(2),.iv-items td:nth-child(2){text-align:center;width:9cqw}
.iv-items th:nth-child(3),.iv-items td:nth-child(3){width:15cqw}
.iv-items th:nth-child(4),.iv-items td:nth-child(4){width:15cqw}
.iv-items td b{display:block;color:#8d9a8f;font-weight:700;font-size:1.95cqw}
.iv-items td span{display:block;color:#555a53;font-size:1.65cqw;margin-top:.5cqw}
.iv-items tr{break-inside:avoid}
.iv-sum{margin:2.6cqw 0 0 auto;width:50%}
.iv-r{display:flex;justify-content:space-between;color:#8a8e88;font-size:1.85cqw;padding:.9cqw 1.3cqw}
.iv-r.due{color:#c8602b;font-weight:700}
.iv-total{display:flex;justify-content:space-between;align-items:baseline;border-top:.3cqw solid #8ccf98;margin-top:1.4cqw;padding:2cqw 1.3cqw 1cqw}
.iv-total span{color:#4d7c55;font-weight:700;font-size:1.95cqw}
.iv-total b{color:#4d7c55;font-size:3cqw;font-weight:800}
.iv-note{margin:.6cqw 0 0;text-align:right;color:#555a53;font-size:1.6cqw}
.iv-extra{display:grid;grid-template-columns:1fr 1fr;gap:4cqw;margin-top:5cqw;break-inside:avoid}
.iv-pay{width:100%;border-collapse:collapse}
.iv-pay td{padding:1cqw .9cqw;border-bottom:.15cqw solid #3a3d39;font-size:1.7cqw;color:#8a8e88}
.iv-pay tr:first-child td{border-top:.3cqw solid #8ccf98}
.iv-pay td:last-child{text-align:right;color:#3b3f3a}
.iv-extra ul{margin:0;padding-left:2.6cqw;list-style:disc;color:#555a53;font-size:1.8cqw}
.iv-extra li{margin-bottom:1cqw}
.iv-foot{display:flex;justify-content:space-between;gap:3cqw;flex-wrap:wrap;margin-top:4cqw;padding-top:2.2cqw;border-top:.2cqw dashed #6f7469;color:#555a53;font-size:1.7cqw;break-inside:avoid}
.iv-foot b{color:#3f6b45}
.bl{border:.3cqw solid #cfc8b4;border-radius:2.4cqw;padding:4cqw 5cqw 3.2cqw;background:#fff;height:100%;display:flex;flex-direction:column}
.bl b.s{font-size:5.4cqw;line-height:1.25}
.bl .p{font-size:4.4cqw;color:#666;line-height:1.3}
.bl .bars{height:16cqw;margin:2cqw 0 1cqw}
.bl .n{font-size:3.8cqw;text-align:center;color:#333;letter-spacing:.06em}
.bl .pr{font-size:5.2cqw;font-weight:800;margin-top:auto;padding-top:1cqw}
`;

export function printHtml(title: string, body: string, pageCss: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${DOC_CSS}
html,body{margin:0;padding:0;background:#fff}${pageCss}</style></head><body>${body}</body></html>`,
  );
  doc.close();
  const cleanup = () => setTimeout(() => iframe.remove(), 500);
  const go = () => {
    const win = iframe.contentWindow!;
    win.addEventListener("afterprint", cleanup);
    win.focus();
    win.print();
    setTimeout(cleanup, 120_000);
  };
  // Give the iframe a tick to lay out before printing.
  setTimeout(go, 250);
}

/* -------------------------------- invoice -------------------------------- */

const LEAF_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#e2b94f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';
const TAGLINE = "A little tradition. A lot of flavour.";
const inr2 = (n: number) => `₹${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
const longDate = (v: string) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const longDateTime = (v: string) =>
  `${longDate(v)}, ${new Date(v).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}`;

/** "MEB-1009" → "MEB-INV-1009" (the invoice number follows the order number). */
export function invoiceNumber(orderNo: string) {
  const m = orderNo.match(/^([A-Za-z]+-)(.+)$/);
  return m ? `${m[1]}INV-${m[2]}` : `INV-${orderNo}`;
}

/** The street part of the address (city, state and PIN are printed on their own line). */
function streetOf(o: Order) {
  const { city, state, pincode } = o.location;
  const suffix = [city, state].filter(Boolean).join(", ") + (pincode ? ` – ${pincode}` : "");
  if (!suffix) return o.address;
  if (o.address === suffix) return "";
  return o.address.endsWith(`, ${suffix}`) ? o.address.slice(0, -(suffix.length + 2)) : o.address;
}

const STATUS_TEXT: Record<Order["status"], string> = { New: "Processing", Packed: "Packed", Delivered: "Delivered", Cancelled: "Cancelled" };

/** Tax invoice in the Magna Eco Bites house style (same markup on screen and on paper). */
export function invoiceHtml(o: Order, c: Customer, s: Settings) {
  const label = orderLabel(o.number, s.invoice.numberFormat);
  const total = orderTotal(o);
  const refunded = o.payment.refunded;
  const store = s.store.name || "Magna Eco Bites";
  const name = o.shipName || c.name;

  // Payment, as printed in the order band, the totals and the status line.
  const testPay = isTestPayment(o.payment.id);
  const paidAmount =
    o.paymentMode === "online" ? (o.payment.status === "pending" ? 0 : total)
      : o.paymentMode === "paid" ? total : o.paymentMode === "advance" ? o.amountPaid : 0;
  const balance = Math.max(0, total - paidAmount);
  const method = o.method === "NetBanking" ? "Net banking" : o.method;
  const bandPay =
    o.paymentMode === "cod" ? `Payment <b>Cash on delivery</b>`
      : o.paymentMode === "pending" || (o.paymentMode === "online" && o.payment.status === "pending") ? `Payment <b>Pending</b>`
        : o.paymentMode === "advance" ? `Advance <b>${inr(o.amountPaid)}</b> via <b>${esc(method)}</b>`
          : `Paid via <b>${esc(method)}</b>${testPay ? " (test)" : ""}`;
  const payState =
    refunded >= total && refunded > 0 ? "Refunded" : refunded > 0 ? "Part refunded"
      : balance === 0 ? "Paid" : paidAmount > 0 ? "Part paid" : o.paymentMode === "cod" ? "Cash on delivery" : "Payment due";

  // Parties.
  const street = streetOf(o);
  const cityLine = [[o.location.city, o.location.state].filter(Boolean).join(", "), o.location.pincode].filter(Boolean).join(" ");
  const billLines = [
    o.businessName ? `Attn: ${esc(name)}` : "",
    esc(street),
    esc(cityLine),
    esc(o.shipPhone || c.phone),
    o.gstNumber ? `GSTIN: ${esc(o.gstNumber)}` : "",
  ].filter(Boolean);
  const soldLines = [esc(s.store.address), s.store.gstin ? `GSTIN: ${esc(s.store.gstin)}` : "", s.store.udyam ? `Udyam: ${esc(s.store.udyam)}` : ""].filter(Boolean);
  const logo = s.invoice.logo ? `<img src="${esc(s.invoice.logo)}" alt="">` : LEAF_SVG;

  // Lines: products, then shipping / freight as its own line (as on a courier invoice).
  const rows = o.items
    .map(
      (i) => `<tr><td><b>${esc(i.name)}</b>${i.packSize ? `<span>${esc(i.packSize)}</span>` : ""}</td>
<td>${i.qty}</td><td>${inr2(i.price)}</td><td>${inr2(i.price * i.qty)}</td></tr>`,
    )
    .join("");
  const shipSub = [o.tracking.transporter, o.tracking.number].filter(Boolean).join(" · ");
  const shipRow = o.shipping > 0
    ? `<tr><td><b>${o.kind === "bulk" ? "Freight" : "Shipping &amp; delivery"}</b><span>${esc(shipSub || (o.kind === "bulk" ? "Paid to transporter" : "Courier"))}</span></td>
<td>1</td><td>${inr2(o.shipping)}</td><td>${inr2(o.shipping)}</td></tr>`
    : "";

  const sumRows = [
    `<div class="iv-r"><span>Subtotal</span><span>${inr2(orderSubtotal(o) + o.shipping)}</span></div>`,
    o.discount ? `<div class="iv-r"><span>Discount</span><span>−${inr2(o.discount)}</span></div>` : "",
  ].join("");
  const afterRows = [
    o.paymentMode === "advance" ? `<div class="iv-r"><span>Advance received</span><span>${inr2(o.amountPaid)}</span></div>` : "",
    refunded > 0 ? `<div class="iv-r"><span>Refunded</span><span>−${inr2(refunded)}</span></div>` : "",
    balance > 0 && refunded === 0 ? `<div class="iv-r due"><span>Balance due</span><span>${inr2(balance)}</span></div>` : "",
  ].join("");

  // Payment details (left) and "Good to know" (right).
  const payDetails = [
    ["Payment", o.paymentMode === "online" ? `${method}${testPay ? " · test payment" : ""}` : paymentLabel(o)],
    o.paymentMode === "online" && o.payment.id && !testPay ? ["Reference", maskPaymentId(o.payment.id)] : null,
    ["Amount received", inr2(paidAmount)],
    ["Balance due", inr2(refunded > 0 ? 0 : balance)],
  ].filter(Boolean) as [string, string][];
  const tips = [
    o.tracking.number
      ? `Track your shipment${o.tracking.transporter ? ` with ${esc(o.tracking.transporter)}` : ""} using the tracking number above.`
      : o.source === "online" ? "See the latest status of your order anytime under My orders on our website." : "",
    "Damaged or incorrect item? Message us within 48 hours of delivery.",
    s.invoice.footer ? esc(s.invoice.footer) : "",
  ].filter(Boolean);
  const contact = [s.store.email, s.store.phone].filter(Boolean).map(esc).join(" · ");

  return `<div class="doc"><div class="iv">
<header class="iv-top">
  <div class="iv-brand"><span class="iv-logo">${logo}</span><div><b>${esc(store)}</b><span>${TAGLINE}</span></div></div>
  <div class="iv-no"><span>${s.store.gstin ? "Tax invoice" : "Invoice"}</span><b>${esc(invoiceNumber(label))}</b><span>${esc(longDate(o.placedAt))}</span></div>
</header>
<div class="iv-body">
  <section class="iv-parties">
    <div><span class="iv-lbl">Billed and shipped to</span><b>${esc(o.businessName || name)}</b>${billLines.map((l) => `<p>${l}</p>`).join("")}</div>
    <div><span class="iv-lbl">Sold by</span><b>${esc(store)}</b>${soldLines.map((l) => `<p>${l}</p>`).join("")}</div>
    <div class="iv-code"><div class="iv-bars">${barcodeSvgString(label, 40)}</div><span>${esc(label)}</span></div>
  </section>
  <section class="iv-band">
    <div class="iv-band-row"><span>Order <b>#${esc(label)}</b></span><span>Placed <b>${esc(longDateTime(o.placedAt))}</b></span><span>${bandPay}</span>${o.tracking.number ? `<span>Tracking <b>${esc(o.tracking.number)}</b></span>` : ""}</div>
    <div class="iv-state">${payState} · ${STATUS_TEXT[o.status]}</div>
  </section>
  <table class="iv-items"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
  <tbody>${rows}${shipRow}</tbody></table>
  <section class="iv-sum">
    ${sumRows}
    <div class="iv-total"><span>${balance === 0 && refunded === 0 ? "Total paid" : "Total"}</span><b>${inr2(total)}</b></div>
    ${afterRows}
    ${s.store.gstin ? `<p class="iv-note">Prices include GST</p>` : ""}
  </section>
  <section class="iv-extra">
    <div><span class="iv-lbl">Payment details</span>
      <table class="iv-pay">${payDetails.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>
    </div>
    <div><span class="iv-lbl">Good to know</span><ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul></div>
  </section>
  <footer class="iv-foot"><span>Thank you for choosing <b>${esc(store)}</b>, ${esc(name.split(" ")[0] || "there")}.</span><span>${contact}</span></footer>
</div>
</div></div>`;
}

/* ------------------------------ product label ------------------------------ */

export function productLabelHtml(p: AdminProduct, storeName: string) {
  return `<div class="doc" style="height:100%"><div class="bl">
<b class="s">${esc(storeName)}</b><div class="p">${esc(p.name)} ${esc(p.packSize)}</div>
<div class="bars">${barcodeSvgString(p.barcode, 40)}</div>
<div class="n">${esc(groupBarcode(p.barcode))}</div>
<div class="pr">${p.price != null ? inr(p.price) : ""}</div></div></div>`;
}

export interface LabelSize {
  id: string;
  label: string;
  w: number;
  h: number;
  cols: number;
}

export const LABEL_SIZES: LabelSize[] = [
  { id: "50x25", label: "50 × 25 mm · 3 per row", w: 50, h: 25, cols: 3 },
  { id: "38x25", label: "38 × 25 mm · 5 per row", w: 38, h: 25, cols: 5 },
  { id: "70x35", label: "70 × 35 mm · 2 per row", w: 70, h: 35, cols: 2 },
  { id: "100x50", label: "100 × 50 mm · 1 per row", w: 100, h: 50, cols: 1 },
];

export function printLabelSheet(products: AdminProduct[], qty: number, size: LabelSize, storeName: string) {
  const cells = Array.from({ length: qty }, (_, i) => products[i % products.length]);
  const body = `<div class="sheet">${cells.map((p) => `<div class="cell">${productLabelHtml(p, storeName)}</div>`).join("")}</div>`;
  printHtml(
    "Label sheet",
    body,
    `@page{size:A4;margin:10mm}.sheet{display:grid;grid-template-columns:repeat(${size.cols},${size.w}mm);gap:2mm}
.cell{width:${size.w}mm;height:${size.h}mm;break-inside:avoid}`,
  );
}

export function printInvoices(entries: { order: Order; customer: Customer }[], s: Settings) {
  const body = entries
    .map((e, i) => `<div class="page${i ? " brk" : ""}">${invoiceHtml(e.order, e.customer, s)}</div>`)
    .join("");
  printHtml("Invoices", body, `@page{size:A4;margin:10mm}.page{width:100%}.brk{break-before:page}`);
}
