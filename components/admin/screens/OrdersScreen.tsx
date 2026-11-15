"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { downloadCsv, fmtDate, fmtDateTime, isTestPayment, maskEmail, maskPhone } from "@/lib/admin/format";
import { customerSub, orderTone, orderTotal, orderUnits, paymentLabel } from "@/lib/admin/logic";
import { printInvoices } from "@/lib/admin/print";
import { useAdminData } from "@/lib/admin/store";
import type { Order } from "@/lib/admin/types";
import { formatInr } from "@/lib/format";
import OrderFormModal from "../OrderFormModal";
import { Badge, Topbar, useQueryParam } from "../ui";

const PAGE = 9;

type Filter = "All" | "New" | "Packed" | "Delivered";
const FILTERS: Filter[] = ["All", "New", "Packed", "Delivered"];

const matchesFilter = (o: Order, f: Filter) => (f === "All" ? true : o.status === f);

export default function OrdersScreen() {
  const router = useRouter();
  const { data, mutate, label } = useAdminData();

  const pack = (numbers: number[]) =>
    mutate<{ packed: number; skipped: number }>("/api/admin/orders/pack", "POST", { numbers }, (r) =>
      r.packed ? `${r.packed} order${r.packed > 1 ? "s" : ""} marked packed.${r.skipped ? ` ${r.skipped} skipped.` : ""}` : "Nothing to pack — those orders are already packed.",
    );
  const deliver = (numbers: number[]) =>
    mutate<{ delivered: number; skipped: number }>("/api/admin/orders/deliver", "POST", { numbers }, (r) =>
      r.delivered
        ? `${r.delivered} order${r.delivered > 1 ? "s" : ""} marked delivered — confirmation emailed.${r.skipped ? ` ${r.skipped} skipped (not packed yet).` : ""}`
        : "Only packed orders can be marked delivered.",
    );
  const qParam = useQueryParam("q");
  const orderParam = useQueryParam("order");

  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeNo, setActiveNo] = useState<number | null>(null);
  /** "+ Add" (new) or "Edit" (order number) popup. */
  const [form, setForm] = useState<null | "new" | number>(null);
  const initialised = useRef(false);
  /** Track delivery charge changes per order. */
  const [deliveryCharges, setDeliveryCharges] = useState<Record<number, number>>({});
  /** Track which orders have unsaved delivery charge changes. */
  const [modifiedDeliveryCharges, setModifiedDeliveryCharges] = useState<Set<number>>(new Set());

  const customers = useMemo(() => new Map(data.customers.map((c) => [c.id, c])), [data.customers]);

  useEffect(() => {
    if (initialised.current || qParam === undefined || orderParam === undefined) return;
    initialised.current = true;
    if (qParam) setQuery(qParam);
    // Details open only when the admin clicks an order, or follows a link to one (?order=1009).
    const fromUrl = orderParam ? Number(orderParam.replace(/\D/g, "")) : NaN;
    const target = data.orders.find((o) => o.number === fromUrl);
    if (target) {
      setActiveNo(target.number);
      setSelected([target.number]);
      if (!qParam) setPage(Math.floor(data.orders.indexOf(target) / PAGE) + 1);
    }
  }, [qParam, orderParam, data.orders]);

  const counts = useMemo(() => {
    const c = {} as Record<Filter, number>;
    for (const f of FILTERS) c[f] = data.orders.filter((o) => matchesFilter(o, f)).length;
    return c;
  }, [data.orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.orders.filter((o) => {
      if (!matchesFilter(o, filter)) return false;
      if (!q) return true;
      const c = customers.get(o.customerId);
      return (
        label(o.number).toLowerCase().includes(q) ||
        (/\d/.test(q) && String(o.number).includes(q.replace(/^#?meb-?/, ""))) ||
        (c?.name.toLowerCase().includes(q) ?? false) ||
        (c?.city.toLowerCase().includes(q) ?? false) ||
        (c?.area?.toLowerCase().includes(q) ?? false) ||
        o.location.city.toLowerCase().includes(q) ||
        o.location.pincode.includes(q) ||
        o.shipName.toLowerCase().includes(q) ||
        o.businessName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [data.orders, filter, query, customers, label]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const curPage = Math.min(page, pages);
  const rows = filtered.slice((curPage - 1) * PAGE, curPage * PAGE);

  const active = data.orders.find((o) => o.number === activeNo) ?? null;
  const activeCustomer = active ? customers.get(active.customerId) : undefined;

  // Ticking a checkbox only selects the order for bulk actions; clicking the row opens its details.
  const toggleSel = (n: number) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const pickRow = (n: number) => {
    setActiveNo(n);
    setSelected([n]);
  };

  const selectedOrders = data.orders.filter((o) => selected.includes(o.number));
  const entries = (list: Order[]) => list.map((o) => ({ order: o, customer: customers.get(o.customerId)! }));

  const exportCsv = () =>
    downloadCsv("orders.csv", [
      ["Order", "Type", "Placed", "Business", "Customer", "Email", "Phone", "City", "State", "PIN", "Address", "Units", "Amount (INR)", "Delivery Charge (INR)", "Payment", "Status"],
      ...filtered.map((o) => {
        const c = customers.get(o.customerId);
        return [
          label(o.number), o.kind === "bulk" ? "Bulk" : "Normal", fmtDateTime(o.placedAt), o.businessName, o.shipName || c?.name || "", o.email || c?.email || "", o.shipPhone || c?.phone || "",
          o.location.city || c?.city || "", o.location.state || c?.state || "", o.location.pincode, o.address,
          orderUnits(o), orderTotal(o), o.deliveryCharge ?? 0, paymentLabel(o), o.status,
        ];
      }),
    ]);

  const locationOf = (o: Order) => {
    if (o.location.city) return { main: o.location.city, sub: [o.location.state, o.location.pincode].filter(Boolean).join(" · ") };
    const c = customers.get(o.customerId);
    return c?.city ? { main: c.city, sub: c.state } : null;
  };

  return (
    <>
      <Topbar title="Orders" subtitle="Every order from the website, with payment and packing status">
        <input
          className="adm-search"
          placeholder="Search order or customer..."
          aria-label="Search orders"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <button type="button" className="adm-btn lg" onClick={exportCsv}>Export CSV</button>
        <button type="button" className="adm-btn pri lg" onClick={() => setForm("new")}>+ Add</button>
      </Topbar>

      <div className="adm-chips" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} className={`adm-chip${filter === f ? " on" : ""}`} onClick={() => { setFilter(f); setPage(1); }}>
            {f} <em>{counts[f]}</em>
          </button>
        ))}
      </div>

      <div className={`o-wrap ${active ? "open" : "closed"}`}>
        <section className="adm-card o-panel" style={{ minHeight: 686 }}>
          <div className="adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 30 }}>
                    <input
                      type="checkbox"
                      className="adm-cb"
                      aria-label="Select all on this page"
                      checked={rows.length > 0 && rows.every((o) => selected.includes(o.number))}
                      onChange={(e) => setSelected(e.target.checked ? Array.from(new Set([...selected, ...rows.map((o) => o.number)])) : selected.filter((n) => !rows.some((o) => o.number === n)))}
                    />
                  </th>
                  <th>Order</th><th>Customer</th><th className="o-loc">Customer location</th><th>Amount</th><th>Delivery Charge</th><th className="o-pay">Payment</th><th>Status</th><th aria-label="Edit" />
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const c = customers.get(o.customerId);
                  return (
                    <tr key={o.number} className={`click${activeNo === o.number ? " sel" : ""}`} onClick={() => pickRow(o.number)} style={{ height: 46 }}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="adm-cb" aria-label={`Select ${label(o.number)}`} checked={selected.includes(o.number)} onChange={() => toggleSel(o.number)} />
                      </td>
                      <td style={{ lineHeight: 1.25 }}>
                        <b style={{ color: "var(--ink)" }}>#{label(o.number)}</b>{o.kind === "bulk" && <span className="o-kind">BULK</span>}
                        <span className="sub">{fmtDateTime(o.placedAt)}</span>
                      </td>
                      <td style={{ lineHeight: 1.25 }}>
                        <b style={{ fontWeight: 600, color: "var(--ink)" }}>{o.businessName || o.shipName || c?.name}</b>
                        <span className="sub">{o.businessName ? o.shipName : c && customerSub(c)}</span>
                      </td>
                      <td className="o-loc" style={{ lineHeight: 1.25 }}>
                        {(() => {
                          const loc = locationOf(o);
                          return loc ? <><span style={{ color: "var(--ink)" }}>{loc.main}</span>{loc.sub && <span className="sub">{loc.sub}</span>}</> : <span className="adm-muted">—</span>;
                        })()}
                      </td>
                      <td style={{ lineHeight: 1.25 }}>
                        <b style={{ color: "var(--ink)" }}>{formatInr(orderTotal(o))}</b>
                        <span className="sub">{orderUnits(o)} item{orderUnits(o) === 1 ? "" : "s"}</span>
                      </td>
                      <td style={{ lineHeight: 1.25 }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="adm-in"
                          style={{ width: 80, height: 28, padding: "0 8px", fontSize: 12, MozAppearance: "textfield", WebkitAppearance: "none" }}
                          aria-label={`Delivery charge for ${label(o.number)}`}
                          placeholder={String(o.deliveryCharge ?? 0)}
                          value={deliveryCharges[o.number] !== undefined ? String(deliveryCharges[o.number]) : ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const numVal = val === "" ? 0 : Number(val);
                            setDeliveryCharges((prev) => ({ ...prev, [o.number]: numVal }));
                            setModifiedDeliveryCharges((prev) => {
                              const next = new Set(prev);
                              if (numVal !== (o.deliveryCharge ?? 0)) {
                                next.add(o.number);
                              } else {
                                next.delete(o.number);
                              }
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className="o-pay">{paymentLabel(o)}</td>
                      <td><Badge tone={orderTone(o.status)}>{o.status}</Badge></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {modifiedDeliveryCharges.has(o.number) ? (
                          <button
                            type="button"
                            className="adm-btn sm pri"
                            aria-label={`Update delivery charge for ${label(o.number)}`}
                            onClick={() => {
                              const newDeliveryCharge = deliveryCharges[o.number] ?? 0;
                              mutate<{ number: number }>(`/api/admin/orders/${o.number}/delivery-charge`, "PUT", { delivery_charge: newDeliveryCharge }, () => {
                                setModifiedDeliveryCharges((prev) => {
                                  const next = new Set(prev);
                                  next.delete(o.number);
                                  return next;
                                });
                                // Drop the staged value so the box shows the charge now saved on the order.
                                setDeliveryCharges((prev) => {
                                  const next = { ...prev };
                                  delete next[o.number];
                                  return next;
                                });
                                return "Delivery charge updated.";
                              });
                            }}
                          >
                            Update
                          </button>
                        ) : (
                          <button type="button" className="adm-btn sm" aria-label={`Edit order ${label(o.number)}`} onClick={() => { pickRow(o.number); setForm(o.number); }}>Edit</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr><td colSpan={9}><div className="adm-empty">{data.orders.length ? "No orders match your search." : "No orders yet. Click “+ Add” to add one."}</div></td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="o-page">
            <span>
              {filtered.length ? `Showing ${(curPage - 1) * PAGE + 1}–${Math.min(curPage * PAGE, filtered.length)} of ${filtered.length} orders` : "Showing 0 orders"}
            </span>
            <div className="o-pg">
              <button type="button" disabled={curPage === 1} onClick={() => setPage(curPage - 1)}>‹ Prev</button>
              {pageList(curPage, pages).map((p, i) =>
                p === "…" ? <button key={`e${i}`} type="button" disabled>…</button> : (
                  <button key={p} type="button" className={p === curPage ? "on" : ""} onClick={() => setPage(p)}>{p}</button>
                ),
              )}
              <button type="button" disabled={curPage === pages} onClick={() => setPage(curPage + 1)}>Next ›</button>
            </div>
          </div>

          <div className="o-bulk">
            <b style={{ color: "var(--ink)", marginRight: 4 }}>{selected.length} order{selected.length === 1 ? "" : "s"} selected</b>
            <button className="adm-btn sm" disabled={!selected.length} onClick={() => printInvoices(entries(selectedOrders), data.settings)}>Print invoices</button>
            <button className="adm-btn sm" disabled={!selected.length} onClick={() => deliver(selected)}>Mark delivered</button>
            <button className="adm-btn pri sm sp" disabled={!selected.length} onClick={() => pack(selected)}>Mark packed</button>
          </div>
        </section>

        {active && activeCustomer && (
        <aside className="adm-card o-panel" aria-label="Order details">
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 19, color: "var(--ink)" }}>Order #{label(active.number)}</h2>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Badge tone={orderTone(active.status)}>{active.status}</Badge>
                  <button type="button" className="adm-x" aria-label="Close order details" onClick={() => { setActiveNo(null); setSelected([]); }}>×</button>
                </span>
              </div>
              <p className="adm-muted" style={{ margin: "4px 0 14px" }}>
                {active.source === "admin" ? "Added by admin" : "Placed"} {fmtDateTime(active.placedAt)} ·{" "}
                {active.source === "admin"
                  ? paymentLabel(active)
                  : isTestPayment(active.payment.id)
                    ? `Test payment via ${active.method} (no money collected)`
                    : `${active.payment.status === "pending" ? "Payment pending" : "Paid"} via ${active.method} (Razorpay)`}
                {active.kind === "bulk" && <span className="o-kind">BULK</span>}
              </p>

              {active.status === "New" && (
                <div className="adm-box plain">
                  <div className="adm-box-h">Ready to pack</div>
                  <p>Mark it packed once every item has been scanned and boxed.</p>
                  <div className="adm-box-a">
                    <button className="adm-btn pri sm" onClick={() => pack([active.number])}>Mark packed</button>
                  </div>
                </div>
              )}
              {active.status === "Packed" && (
                <div className="adm-box plain">
                  <div className="adm-box-h">Packed · out for delivery</div>
                  <p>Mark it delivered once the customer has received it — they get a delivery confirmation email.</p>
                  <div className="adm-box-a">
                    <button className="adm-btn pri sm" onClick={() => deliver([active.number])}>Mark delivered</button>
                  </div>
                </div>
              )}

              <div className="o-sec">
                <div className="adm-fl">{active.businessName ? "Business" : "Customer"}</div>
                {active.businessName && <div className="o-name">{active.businessName}</div>}
                {active.businessName && active.gstNumber && <div className="adm-muted">GST {active.gstNumber}</div>}
                <div className={active.businessName ? "" : "o-name"} style={active.businessName ? { color: "var(--ink)", marginTop: 4 } : undefined}>
                  {active.shipName || activeCustomer.name}
                </div>
                <div className="adm-muted">
                  {maskPhone(active.shipPhone || activeCustomer.phone)} · {maskEmail(active.email || activeCustomer.email)}
                </div>
              </div>
              <div className="o-sec">
                <div className="adm-fl">Delivery location</div>
                <div style={{ lineHeight: 1.5 }}>{active.address || "—"}</div>
                {active.deliveredAt && <div className="adm-muted" style={{ marginTop: 4 }}>Delivered {fmtDateTime(active.deliveredAt)}</div>}
              </div>
              <div className="o-sec">
                <div className="adm-fl">Items</div>
                {active.items.map((i) => (
                  <div className="o-items" key={i.productId}>
                    <span>{i.name} {i.packSize} × {i.qty}</span>
                    <span style={{ fontWeight: 600 }}>{formatInr(i.price * i.qty)}</span>
                  </div>
                ))}
                {active.shipping > 0 && (
                  <div className="o-items adm-muted"><span>{active.kind === "bulk" ? "Freight" : "Shipping"}</span><span>{formatInr(active.shipping)}</span></div>
                )}
                {active.discount > 0 && (
                  <div className="o-items adm-muted"><span>Discount</span><span>−{formatInr(active.discount)}</span></div>
                )}
                <div className="o-total"><span>Total</span><span>{formatInr(orderTotal(active))}</span></div>
                {active.paymentMode === "advance" && (
                  <>
                    <div className="o-items adm-muted"><span>Advance received</span><span>{formatInr(active.amountPaid)}</span></div>
                    <div className="o-items" style={{ color: "var(--clay)", fontWeight: 600 }}><span>Balance due</span><span>{formatInr(Math.max(0, orderTotal(active) - active.amountPaid))}</span></div>
                  </>
                )}
                {(active.paymentMode === "pending" || active.paymentMode === "cod") && (
                  <div className="o-items" style={{ color: "var(--clay)", fontWeight: 600 }}><span>Balance due</span><span>{formatInr(orderTotal(active))}</span></div>
                )}
              </div>
              {active.kind === "bulk" && (active.boxes != null || active.totalWeight || active.tracking.transporter || active.tracking.number) && (
                <div className="o-sec">
                  <div className="adm-fl">Shipment (entered manually)</div>
                  {(active.boxes != null || active.totalWeight) && (
                    <div className="adm-muted">{[active.boxes != null && `${active.boxes} box${active.boxes === 1 ? "" : "es"}`, active.totalWeight].filter(Boolean).join(" · ")}</div>
                  )}
                  {(active.tracking.transporter || active.tracking.number) && (
                    <div style={{ color: "var(--ink)", marginTop: 2 }}>
                      {active.tracking.transporter}{active.tracking.number && ` · ${active.tracking.number}`}
                    </div>
                  )}
                  {(active.tracking.status || active.tracking.dispatchDate) && (
                    <div className="adm-muted">
                      {[active.tracking.status, active.tracking.dispatchDate && `dispatched ${fmtDate(active.tracking.dispatchDate)}`].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {active.tracking.url && (
                    <a href={active.tracking.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--clay)", fontWeight: 600, fontSize: 12.5 }}>Open tracking link</a>
                  )}
                </div>
              )}
              {active.note && (
                <div className="o-sec">
                  <div className="adm-fl">Note for packing</div>
                  <div style={{ lineHeight: 1.5 }}>{active.note}</div>
                </div>
              )}

              <div className="o-actions">
                <button className="adm-btn" onClick={() => setForm(active.number)}>Edit order</button>
                <button className="adm-btn" onClick={() => printInvoices(entries([active]), data.settings)}>Invoice PDF</button>
                <button className="adm-btn" onClick={() => router.push(`/admin/payments?order=${active.number}`)}>Refund</button>
              </div>
            </>
        </aside>
        )}
      </div>

      {form !== null && (
        <OrderFormModal
          order={form === "new" ? null : data.orders.find((o) => o.number === form) ?? null}
          customer={form === "new" ? undefined : customers.get(data.orders.find((o) => o.number === form)?.customerId ?? "")}
          onClose={() => setForm(null)}
          onSaved={(n) => {
            if (form === "new") {
              setFilter("All");
              setQuery("");
              setPage(1);
            }
            setActiveNo(n);
            setSelected([n]);
          }}
        />
      )}
    </>
  );
}

function pageList(cur: number, total: number): (number | "…")[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, 3, total, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}
