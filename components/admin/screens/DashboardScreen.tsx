"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { customerSub, LOW_STOCK, orderTone, orderTotal, orderUnits } from "@/lib/admin/logic";
import { fmtDate, startOfDay } from "@/lib/admin/format";
import { printInvoices } from "@/lib/admin/print";
import { useAdminData } from "@/lib/admin/store";
import { availableStock } from "@/lib/stock";
import type { Order } from "@/lib/admin/types";
import { formatInr } from "@/lib/format";
import { Badge, Modal, Topbar } from "../ui";

type Range = "today" | "week" | "month" | "custom";
const RANGES: { id: Range; label: string; days: number; prev: string }[] = [
  { id: "today", label: "Day", days: 1, prev: "yesterday" },
  { id: "week", label: "Week", days: 7, prev: "last week" },
  { id: "month", label: "Month", days: 30, prev: "last month" },
  { id: "custom", label: "Custom", days: 0, prev: "" },
];

const DAY = 86_400_000;
const STATUS_COLORS: Record<string, string> = { Delivered: "#3b5a3a", Packed: "#7a8fbf", New: "#d9a441", Cancelled: "#9aa39a" };
const TOP_COLORS = ["#c8602b", "#d9a441", "#3b5a3a"];

const sum = (orders: Order[]) => orders.reduce((s, o) => s + orderTotal(o), 0);
const delta = (cur: number, prev: number, fmt: (n: number) => string, suffix = "") =>
  prev > 0 ? `${cur >= prev ? "▲" : "▼"} ${fmt(Math.abs(cur - prev))}${suffix}` : null;

function Donut({ parts }: { parts: { n: string; v: number; c: string }[] }) {
  const r = 40;
  const C = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + p.v, 0);
  let offset = 0;
  return (
    <svg viewBox="0 0 110 110" width="106" height="106" role="img" aria-label="Order status split">
      <g transform="rotate(-90 55 55)">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#efe8d6" strokeWidth="13" />
        {parts.filter((p) => p.v > 0).map((p) => {
          const len = (p.v / total) * C;
          const el = <circle key={p.n} cx="55" cy="55" r={r} fill="none" stroke={p.c} strokeWidth="13" strokeDasharray={`${Math.max(len - (parts.length > 1 ? 1.2 : 0), 0)} ${C}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </g>
      <text x="55" y="62" textAnchor="middle" fontFamily="var(--font-display), Georgia, serif" fontWeight="700" fontSize="22" fill="#17301f">{total}</text>
    </svg>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { data, now, label, mutate } = useAdminData();
  const [range, setRange] = useState<Range>("week");
  const [query, setQuery] = useState("");
  const [customMode, setCustomMode] = useState<"single" | "range">("range");
  const [customDate, setCustomDate] = useState<string>("");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showCustom, setShowCustom] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const R = RANGES.find((r) => r.id === range)!;

  const stats = useMemo(() => {
    // Enquiries (Business / Distributors / Export forms) aren't sales — they carry no items or payment.
    const valid = data.orders.filter((o) => o.status !== "Cancelled" && o.source !== "enquiry");
    const today0 = startOfDay(now).getTime();
    
    let from: number;
    let to: number;
    let span: number;
    
    if (range === "custom") {
      if (customMode === "single" && customDate) {
        from = startOfDay(new Date(customDate)).getTime();
        to = from + DAY;
        span = 1;
      } else if (customMode === "range" && customStartDate && customEndDate) {
        from = startOfDay(new Date(customStartDate)).getTime();
        to = startOfDay(new Date(customEndDate)).getTime() + DAY;
        const dayDiff = Math.round((to - from) / DAY);
        span = Math.max(1, Math.min(dayDiff, 365));
      } else {
        from = today0;
        to = now.getTime() + 1;
        span = 1;
      }
    } else {
      from = today0 - (R.days - 1) * DAY;
      to = now.getTime() + 1;
      span = range === "month" ? 30 : range === "week" ? 7 : 1;
    }
    
    const inWin = (o: Order, a: number, b: number) => {
      const t = new Date(o.placedAt).getTime();
      return t >= a && t < b;
    };
    const cur = valid.filter((o) => inWin(o, from, to));
    const prev = valid.filter((o) => inWin(o, from - span * DAY, from));
    const curAll = data.orders.filter((o) => inWin(o, from, to) && o.source !== "enquiry");

    // Sales trend: one point per day over the chart span, vs the same span before it.
    const series = (offsetDays: number) =>
      Array.from({ length: span }, (_, i) => {
        const dayStart = from + i * DAY + offsetDays * DAY;
        return sum(valid.filter((o) => inWin(o, dayStart, dayStart + DAY)));
      });
    const thisSeries = series(0);
    const prevSeries = series(span);

    const byProduct = new Map<string, number>();
    for (const o of cur) for (const i of o.items) byProduct.set(i.name, (byProduct.get(i.name) ?? 0) + i.price * i.qty);
    const top = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

    const perCustomer = new Map<string, number>();
    for (const o of valid) perCustomer.set(o.customerId, (perCustomer.get(o.customerId) ?? 0) + 1);
    const buyers = perCustomer.size;
    const repeat = [...perCustomer.values()].filter((n) => n >= 2).length;
    const cities = new Map<string, number>();
    for (const c of data.customers) if (perCustomer.has(c.id) && c.city) cities.set(c.city, (cities.get(c.city) ?? 0) + 1);
    const topCity = [...cities.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      sales: sum(cur),
      prevSales: sum(prev),
      count: cur.length,
      prevCount: prev.length,
      avg: cur.length ? Math.round(sum(cur) / cur.length) : 0,
      prevAvg: prev.length ? Math.round(sum(prev) / prev.length) : 0,
      thisSeries,
      prevSeries,
      span,
      from,
      to,
      top,
      repeatPct: buyers ? Math.round((repeat / buyers) * 100) : 0,
      topCity,
      deliveryCharge: cur.reduce((s, o) => s + (o.deliveryCharge ?? 0), 0),
      status: ["Delivered", "Packed", "New", "Cancelled"].map((n) => ({ n, v: curAll.filter((o) => o.status === n).length, c: STATUS_COLORS[n] })),
    };
  }, [data.orders, data.customers, now, R.days, range, customMode, customDate, customStartDate, customEndDate]);

  // Products not sold online (Export / distributor only) never appear in shop stock panels.
  const live = data.products.filter((p) => p.visible && p.channels.includes("ecommerce"));
  const low = live.filter((p) => (availableStock(p) ?? 0) <= LOW_STOCK);
  const customers = useMemo(() => new Map(data.customers.map((c) => [c.id, c])), [data.customers]);
  const recent = data.orders
    .filter((o) => {
      const t = new Date(o.placedAt).getTime();
      return t >= stats.from && t < stats.to;
    })
    .slice(0, 7);
  const entries = (list: Order[]) => list.map((o) => ({ order: o, customer: customers.get(o.customerId)! }));

  // Chart geometry.
  const max = Math.max(1, ...stats.thisSeries, ...stats.prevSeries);
  const x = (i: number) => 4 + (i * 392) / Math.max(1, stats.span - 1);
  const y = (v: number) => 124 - (v / max) * 100;
  const line = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  
  let tickDates: Date[];
  if (range === "custom") {
    const baseDate = customMode === "single" ? customDate : customStartDate;
    const startDate = startOfDay(new Date(baseDate || customEndDate || todayStr));
    tickDates = Array.from({ length: stats.span }, (_, i) => new Date(startDate.getTime() + i * DAY));
  } else {
    tickDates = Array.from({ length: stats.span }, (_, i) => new Date(startOfDay(now).getTime() - (stats.span - 1 - i) * DAY));
  }
  
  const ticks = tickDates.map((d, i) => ({ i, text: stats.span <= 7 ? d.toLocaleDateString("en-IN", { weekday: "short" }) : fmtDate(d) })).filter((t) => stats.span <= 7 || t.i % Math.max(1, Math.floor(stats.span / 6)) === 0 || t.i === stats.span - 1);
  const topMax = Math.max(1, ...stats.top.map((t) => t[1]));

  const salesDelta = delta(stats.sales, stats.prevSales, (n) => `${Math.round((n / stats.prevSales) * 100)}%`, ` vs ${R.prev}`);
  const countDelta = delta(stats.count, stats.prevCount, (n) => String(n), ` vs ${R.prev}`);
  const avgDelta = delta(stats.avg, stats.prevAvg, (n) => formatInr(n), ` vs ${R.prev}`);
  const owner = data.settings.store.owner || data.me.name || "there";
  
  const getSubtitle = () => {
    if (range === "custom") {
      if (customMode === "single" && customDate) return `Here's how ${data.settings.store.name} is doing on ${fmtDate(customDate)}`;
      if (customStartDate && customEndDate) return `Here's how ${data.settings.store.name} is doing from ${fmtDate(customStartDate)} to ${fmtDate(customEndDate)}`;
      return `Here's how ${data.settings.store.name} is doing for your custom range`;
    }
    return `Here's how ${data.settings.store.name} is doing ${range === "today" ? "today" : range === "week" ? "this week" : "this month"}`;
  };

  return (
    <>
      <Topbar title={`Vanakkam, ${owner}`} subtitle={getSubtitle()}>
        <input
          className="adm-search"
          placeholder="Search order ID or customer..."
          aria-label="Search orders"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query.trim() && router.push(`/admin/orders?q=${encodeURIComponent(query.trim())}`)}
        />
        <div className="adm-seg" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r.id} type="button" className={range === r.id ? "on" : ""} aria-pressed={range === r.id} onClick={() => {
              if (r.id === "custom") {
                setRange("custom");
                setShowCustom(true);
              } else {
                setRange(r.id);
                setShowCustom(false);
              }
            }}>{r.label}</button>
          ))}
        </div>
      </Topbar>
      
      {showCustom && (
        <Modal
          title="Custom range"
          onClose={() => setShowCustom(false)}
          footer={
            <>
              <button type="button" className="adm-btn" onClick={() => { setCustomDate(""); setCustomStartDate(""); setCustomEndDate(""); }}>Clear</button>
              <button type="button" className="adm-btn pri" onClick={() => setShowCustom(false)}>Apply</button>
            </>
          }
        >
          <div className="adm-seg" role="group" aria-label="Custom date type" style={{ marginBottom: 14 }}>
            <button type="button" className={customMode === "single" ? "on" : ""} aria-pressed={customMode === "single"} onClick={() => setCustomMode("single")}>Specific date</button>
            <button type="button" className={customMode === "range" ? "on" : ""} aria-pressed={customMode === "range"} onClick={() => setCustomMode("range")}>From – To</button>
          </div>
          {customMode === "single" ? (
            <div className="adm-date-field">
              <label className="adm-fl">Date</label>
              <input type="date" className="adm-in" value={customDate} max={todayStr} onChange={(e) => setCustomDate(e.target.value)} />
            </div>
          ) : (
            <div className="adm-date-picker-inner">
              <div className="adm-date-field">
                <label className="adm-fl">From</label>
                <input type="date" className="adm-in" value={customStartDate} max={customEndDate || todayStr} onChange={(e) => setCustomStartDate(e.target.value)} />
              </div>
              <div className="adm-date-field">
                <label className="adm-fl">To</label>
                <input type="date" className="adm-in" value={customEndDate} min={customStartDate} max={todayStr} onChange={(e) => setCustomEndDate(e.target.value)} />
              </div>
            </div>
          )}
          <p className="adm-muted" style={{ marginTop: 10 }}>
            {customMode === "single" ? "Shows that one day." : "Shows every day from the first date to the last, inclusive."}
          </p>
        </Modal>
      )}

      <div className="adm-kpis d-kpis">
        <div className="adm-kpi"><div className="l">Total Sales</div><div className="v">{formatInr(stats.sales)}</div><div className={`d ${salesDelta?.startsWith("▼") ? "bad" : ""}`}>{salesDelta ?? `${stats.count} order${stats.count === 1 ? "" : "s"} so far`}</div></div>
        <div className="adm-kpi"><div className="l">Orders</div><div className="v">{stats.count}</div><div className={`d ${countDelta?.startsWith("▼") ? "bad" : ""}`}>{countDelta ?? "No earlier orders to compare"}</div></div>
        <div className="adm-kpi"><div className="l">Avg. Order Value</div><div className="v">{formatInr(stats.avg)}</div><div className={`d ${avgDelta?.startsWith("▼") ? "bad" : ""}`}>{avgDelta ?? "—"}</div></div>
        <div className="adm-kpi">
          <div className="l">Low Stock</div><div className="v">{low.length}</div>
          <div className={`d ${low.length ? "warn" : ""}`}>{low.length ? low.slice(0, 2).map((p) => `${p.name}${p.packSize ? ` ${p.packSize}` : ""}`).join(" · ") : "All products well stocked"}</div>
        </div>
        <div className="adm-kpi">
          <div className="l">Delivery Charge</div><div className="v">{formatInr(stats.deliveryCharge)}</div>
          <div className="d">{range === "custom" ? "Selected period" : range === "today" ? "Today" : range === "week" ? "This week" : "This month"}</div>
        </div>
      </div>

      <div className="adm-grid d-row2">
        <section className="adm-card">
          <div className="adm-card-h"><h2>Sales trend</h2><span>₹ per day · last {stats.span} days</span></div>
          <svg viewBox="0 0 400 130" width="100%" height="130" preserveAspectRatio="none" role="img" aria-label="Sales trend">
            <defs>
              <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#c8602b" stopOpacity=".22" />
                <stop offset="1" stopColor="#c8602b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[22, 66, 110].map((gy) => <line key={gy} x1="0" x2="400" y1={gy} y2={gy} stroke="#eee8d8" />)}
            <path d={`${line(stats.thisSeries)} L${x(stats.span - 1)} 124 L${x(0)} 124 Z`} fill="url(#dg)" />
            <path d={line(stats.prevSeries)} fill="none" stroke="#6b5a45" strokeWidth="1.3" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            <path d={line(stats.thisSeries)} fill="none" stroke="#c8602b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx={x(stats.span - 1)} cy={y(stats.thisSeries[stats.span - 1])} r="4" fill="#c8602b" />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {ticks.map((t) => <span key={t.i}>{t.text}</span>)}
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
            <span><b style={{ color: "#c8602b" }}>━</b> This period</span>
            <span><b>╍</b> Previous period</span>
          </div>
        </section>

        <section className="adm-card">
          <div className="adm-card-h"><h2>Top products</h2><span>by revenue</span></div>
          {stats.top.map(([name, amount], i) => (
            <div className="d-top-row" key={name}>
              <span className="n">{name}</span>
              <span className="bar"><i style={{ width: `${Math.max(6, (amount / topMax) * 100)}%`, background: TOP_COLORS[i] }} /></span>
              <span className="a">{formatInr(amount)}</span>
            </div>
          ))}
          {!stats.top.length && <p className="adm-muted" style={{ margin: "10px 0" }}>No sales in this period yet.</p>}
          <div style={{ borderTop: "1px solid var(--line)", margin: "14px 0 10px" }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Stock left</div>
          <div style={{ marginBottom: 12 }}>
            {live.slice(0, 3).map((p) => (
            <span key={p.id} className="d-pill" style={(availableStock(p) ?? 0) <= LOW_STOCK ? { background: "#fbe0d2", color: "#b5532a" } : { background: "#ebe9d4", color: "#4a5238" }}>
              {p.name} · {availableStock(p) ?? 0}
              </span>
            ))}
            {!live.length && <span className="adm-muted">No live products.</span>}
          </div>
          <div className="adm-muted">Repeat customers: <b style={{ color: "var(--ink)" }}>{stats.repeatPct}%</b> · Top city: <b style={{ color: "var(--ink)" }}>{stats.topCity ?? "—"}</b></div>
        </section>

        <section className="adm-card">
          <div className="adm-card-h"><h2>Order status</h2><span>{range === "custom" ? "custom range" : range === "today" ? "today" : range === "week" ? "this week" : "this month"}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Donut parts={stats.status} />
            <ul className="d-legend">
              {stats.status.filter((s) => s.v > 0 || s.n !== "Cancelled").map((s) => (
                <li key={s.n}><i style={{ background: s.c }} />{s.n === "New" ? "New / to pack" : s.n} {s.v}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="adm-grid d-row3">
        <section className="adm-card">
          <div className="adm-card-h"><h2>Recent orders</h2><span>{range === "custom" ? "selected period" : range === "today" ? "today" : range === "week" ? "this week" : "this month"}</span></div>
          <div className="adm-scroll">
            <table className="adm-table adm-table-readable">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Delivery Charge</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const c = customers.get(o.customerId);
                  return (
                    <tr key={o.number}>
                      <td className="b">#{label(o.number)}</td>
                      <td>{c ? `${c.name} · ${customerSub(c)}` : "—"}</td>
                      <td>{orderUnits(o)}</td>
                      <td className="b">{formatInr(orderTotal(o))}</td>
                      <td className="b">{formatInr(o.deliveryCharge ?? 0)}</td>
                      <td><Badge tone={orderTone(o.status)}>{o.status}</Badge></td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {o.status === "New" && o.source !== "enquiry" && (
                          <button type="button" className="adm-btn sm pri" style={{ marginRight: 4 }} onClick={() => mutate("/api/admin/orders/pack", "POST", { numbers: [o.number] }, "1 order marked packed.")}>Mark packed</button>
                        )}
                        <button type="button" className="adm-btn sm" onClick={() => c && printInvoices(entries([o]), data.settings)}>Invoice</button>
                      </td>
                    </tr>
                  );
                })}
                {!recent.length && <tr><td colSpan={7}><div className="adm-empty">No orders in this period yet.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
