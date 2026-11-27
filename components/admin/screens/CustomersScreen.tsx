"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { downloadCsv, fmtDate, fmtDateTime, fmtMonthYear, initials, maskEmail, maskPhone } from "@/lib/admin/format";
import { customerCity, customerStats, orderTone, orderTotal } from "@/lib/admin/logic";
import { useAdminData } from "@/lib/admin/store";
import type { OrderChannel } from "@/lib/admin/types";
import { formatInr } from "@/lib/format";
import { Badge, PromptModal, Topbar } from "../ui";

const tagTone = { VIP: "yellow", Repeat: "green", New: "blue" } as const;

const CHANNELS: { id: OrderChannel; label: string }[] = [
  { id: "ecommerce", label: "Ecommerce" },
  { id: "distributors", label: "Distributors" },
  { id: "export", label: "Export" },
];

export default function CustomersScreen() {
  const router = useRouter();
  const { data, mutate, now, label } = useAdminData();
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<"all" | OrderChannel>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const stats = useMemo(() => customerStats(data), [data]);
  // Registered customers only: the owner, invited admins and invitees are excluded.
  const shoppers = useMemo(() => data.customers.filter((c) => !c.team), [data.customers]);

  /** Which channels each customer has ordered or enquired through. */
  const channelsByCustomer = useMemo(() => {
    const m = new Map<string, Set<OrderChannel>>();
    for (const o of data.orders) {
      const set = m.get(o.customerId) ?? new Set<OrderChannel>();
      set.add(o.channel);
      m.set(o.customerId, set);
    }
    return m;
  }, [data.orders]);

  /** Customers scoped to the selected channel (or everyone when no box is active). */
  const scoped = useMemo(
    () => (channel === "all" ? shoppers : shoppers.filter((c) => channelsByCustomer.get(c.id)?.has(channel))),
    [shoppers, channelsByCustomer, channel],
  );

  const channelCounts = useMemo(() => {
    const c = { ecommerce: 0, distributors: 0, export: 0 } as Record<OrderChannel, number>;
    for (const s of channelsByCustomer.values()) {
      if (s.has("ecommerce")) c.ecommerce += 1;
      if (s.has("distributors")) c.distributors += 1;
      if (s.has("export")) c.export += 1;
    }
    return c;
  }, [channelsByCustomer]);

  const sorted = useMemo(
    () =>
      [...scoped].sort((a, b) => (stats.get(b.id)?.last ?? "").localeCompare(stats.get(a.id)?.last ?? "")),
    [scoped, stats],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    const digits = q.replace(/\D/g, "");
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.area?.toLowerCase().includes(q) ?? false) ||
        (digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits)),
    );
  }, [sorted, query]);

  // Details stay hidden until a customer is ticked or clicked; the same checkbox (or the × in the
  // panel) clears the selection again, and the details card is not rendered at all while nothing is
  // selected — so there is no empty box taking up half the page.
  const toggleSelected = (id: string) => setSelectedId((cur) => (cur === id ? null : id));
  const active = scoped.find((c) => c.id === selectedId) ?? null;
  const st = active ? stats.get(active.id) : undefined;
  const history = active ? data.orders.filter((o) => o.customerId === active.id) : [];

  const favourite = useMemo(() => {
    const units = new Map<string, number>();
    for (const o of history) for (const i of o.items) units.set(i.name, (units.get(i.name) ?? 0) + i.qty);
    return [...units.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [history]);

  /* summary cards */
  const total = scoped.length;
  const repeat = scoped.filter((c) => (stats.get(c.id)?.orders ?? 0) >= 2).length;
  const totalSpent = scoped.reduce((s, c) => s + (stats.get(c.id)?.spent ?? 0), 0);
  const totalOrders = scoped.reduce((s, c) => s + (stats.get(c.id)?.orders ?? 0), 0);
  const newThisMonth = scoped.filter((c) => {
    const d = new Date(c.since);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const cityCount = new Map<string, number>();
  for (const c of scoped) if (c.city) cityCount.set(c.city, (cityCount.get(c.city) ?? 0) + 1);
  const topCity = [...cityCount.entries()].sort((a, b) => b[1] - a[1])[0];

  const exportCsv = () =>
    downloadCsv("customers.csv", [
      ["Name", "Phone", "Email", "City", "Orders", "Total spent (INR)", "Last order", "Tag"],
      ...list.map((c) => {
        const s = stats.get(c.id)!;
        return [c.name, c.phone, c.email, customerCity(c), s.orders, s.spent, s.last ? fmtDate(s.last) : "", s.tag];
      }),
    ]);

  return (
    <>
      <Topbar title="Customers" subtitle="Who is buying, how often, and from where">
        <input className="adm-search" placeholder="Search name, phone, city..." aria-label="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className="adm-btn lg" onClick={exportCsv}>Export CSV</button>
      </Topbar>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 14 }}>
        {CHANNELS.map((c) => {
          const active = channel === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => setChannel(active ? "all" : c.id)}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                border: `1.5px solid ${active ? "var(--forest, #3b5a3a)" : "rgba(59,90,58,.16)"}`,
                background: active ? "rgba(59,90,58,.07)" : "var(--card, #fff)",
              }}
            >
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{c.label}</span>
              <span style={{ display: "block", fontSize: 22, fontWeight: 700, color: active ? "var(--forest, #3b5a3a)" : "var(--ink)" }}>{channelCounts[c.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="adm-kpis p-kpis">
        <div className="adm-kpi">
          <div className="l">Total customers</div><div className="v">{total}</div>
          <div className="d">{newThisMonth ? `▲ ${newThisMonth} this month` : "No new customers this month"}</div>
        </div>
        <div className="adm-kpi">
          <div className="l">Repeat customers</div><div className="v">{total ? Math.round((repeat / total) * 100) : 0}%</div>
          <div className="d">{repeat} bought again</div>
        </div>
        <div className="adm-kpi">
          <div className="l">Avg. lifetime value</div><div className="v">{formatInr(total ? Math.round(totalSpent / total) : 0)}</div>
          <div className="d">{total ? (totalOrders / total).toFixed(1) : "0"} orders each</div>
        </div>
        <div className="adm-kpi">
          <div className="l">Top city</div><div className="v">{topCity?.[0] ?? "—"}</div>
          <div className="d">{topCity ? `${Math.round((topCity[1] / total) * 100)}% of customers` : ""}</div>
        </div>
      </div>

      <div className={`c-wrap ${active ? "open" : "closed"}`}>
        <section className="adm-card" style={{ minHeight: 628 }}>
          <div className="adm-scroll" style={{ maxHeight: 640 }}>
            <table className="adm-table adm-table-readable">
              <thead>
                <tr>
                  <th style={{ width: 30 }} aria-label="Select customer" />
                  <th>Customer</th><th className="c-city">City</th><th>Orders</th><th>Total spent</th><th>Last order</th><th>Tag</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const s = stats.get(c.id)!;
                  return (
                    <tr key={c.id} className={`click${active?.id === c.id ? " sel" : ""}`} style={{ height: 49 }} onClick={() => setSelectedId(c.id)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="adm-cb"
                          aria-label={`${active?.id === c.id ? "Hide" : "Show"} details for ${c.name}`}
                          checked={active?.id === c.id}
                          onChange={() => toggleSelected(c.id)}
                        />
                      </td>
                      <td><div className="p-cell"><div className="c-av">{initials(c.name)}</div><b style={{ fontWeight: 600 }}>{c.name}</b></div></td>
                      <td className="c-city" style={{ color: "#4a4f46" }}>{customerCity(c) || "—"}</td>
                      <td>{s.orders}</td>
                      <td className="b">{formatInr(s.spent)}</td>
                      <td style={{ color: "var(--muted)" }}>{s.last ? fmtDate(s.last) : "—"}</td>
                      <td><Badge tone={tagTone[s.tag]}>{s.tag}</Badge></td>
                    </tr>
                  );
                })}
                {!list.length && <tr><td colSpan={7}><div className="adm-empty">No customers match “{query}”.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {active && st && (
          <aside className="adm-card" aria-label="Customer details" style={{ minHeight: 628, display: "flex", flexDirection: "column" }}>
            <div className="c-head">
              <div className="c-av lg">{initials(active.name)}</div>
              <div style={{ minWidth: 0 }}>
                <h2>{active.name}</h2>
                <div className="adm-muted">{customerCity(active) ? `${customerCity(active)} · ` : ""}customer since {fmtMonthYear(active.since)}</div>
              </div>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}><Badge tone={tagTone[st.tag]}>{st.tag}</Badge><button type="button" className="adm-x" aria-label="Close customer details" title="Close" onClick={() => setSelectedId(null)}>×</button></span>
            </div>
            <div className="adm-row2 adm-fg">
              <div><div className="adm-fl">Phone</div><input className="adm-in" readOnly aria-label="Phone" value={maskPhone(active.phone)} /></div>
              <div><div className="adm-fl">Email</div><input className="adm-in" readOnly aria-label="Email" value={maskEmail(active.email)} /></div>
            </div>
            <div className="adm-row2 adm-fg">
              <div className="c-stat"><div className="l">Lifetime value</div><div className="v">{formatInr(st.spent)}</div></div>
              <div className="c-stat"><div className="l">Favourite</div><div className="v" style={{ fontSize: 16, lineHeight: "28px" }}>{favourite}</div></div>
            </div>

            <div className="adm-card-h" style={{ marginBottom: 4 }}><h2>Order history</h2><span>{history.length} order{history.length === 1 ? "" : "s"}</span></div>
            <div className="c-hist">
              {history.map((o) => (
                <div className="c-hist-r" key={o.number} onClick={() => router.push(`/admin/orders?order=${o.number}`)} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && router.push(`/admin/orders?order=${o.number}`)}>
                  <span><b>#{label(o.number)}</b> · {fmtDate(o.placedAt)}</span>
                  <span><b style={{ fontWeight: 600 }}>{formatInr(orderTotal(o))}</b> · <Badge tone={orderTone(o.status)}>{o.status}</Badge></span>
                </div>
              ))}
              {!history.length && <div className="adm-empty" style={{ padding: "12px 0" }}>No orders yet.</div>}
            </div>

            {active.notes.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div className="adm-fl">Notes</div>
                {active.notes.map((n) => (
                  <div className="c-note" key={n.id}>{n.text}<small>{fmtDateTime(n.at)}</small></div>
                ))}
              </div>
            )}

            <div className="p-btns" style={{ marginTop: "auto", paddingTop: 16 }}>
              <button className="adm-btn pri lg" onClick={() => router.push(`/admin/orders?q=${encodeURIComponent(active.name)}`)}>View all orders</button>
              <button className="adm-btn lg" onClick={() => setNoteOpen(true)}>Add note</button>
            </div>
          </aside>
        )}
      </div>

      {noteOpen && active && (
        <PromptModal
          title={`Add note · ${active.name}`}
          label="Note"
          multiline
          placeholder="e.g. Prefers delivery after 6 PM"
          confirmLabel="Save note"
          validate={(v) => (v.trim() ? null : "Write a note first.")}
          onSubmit={(v) => mutate(`/api/admin/customers/${active.id}/notes`, "POST", { text: v }, "Note added.")}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </>
  );
}
