"use client";

import { useRef, useState } from "react";
import { fmtDateTime, fmtTime, groupBarcode, initials } from "@/lib/admin/format";
import { compressImage } from "@/lib/admin/image";
import { LOW_STOCK, nextBarcode, productOrder, productStatus } from "@/lib/admin/logic";
import { PRODUCT_COLORS } from "@/lib/admin/defaults";
import { useAdminData } from "@/lib/admin/store";
import type { AdminProduct } from "@/lib/admin/types";
import { cleanPackSizes } from "@/lib/pack";
import { formatInr } from "@/lib/format";
import type { ProductChannel } from "@/types";
import { Badge, BarcodeSvg, ConfirmModal, Modal, PromptModal, Toggle, Topbar } from "../ui";
import ProductPreviewCard from "./ProductPreviewCard";

const MAX_PHOTOS = 5;
const MAX_PACK_SIZES = 8;

const CHANNELS: { id: ProductChannel; title: string; blurb: string }[] = [
  {
    id: "ecommerce",
    title: "Ecommerce & Distributors",
    blurb: "Shop, retail packs and distributor enquiries — priced and stocked online.",
  },
  {
    id: "export",
    title: "Export",
    blurb: "Bulk export catalogue shown on /export — enquiry only, no online checkout.",
  },
];

interface Draft {
  name: string;
  originalPrice: string;
  price: string;
  stock: string;
  channel: ProductChannel;
  /** Every pack size the product is sold in; the first one is the default on the shop. */
  packSizes: string[];
  /** Stock quantity per pack size, e.g. {"200 g": "50", "500 g": "30"}. */
  packStock: Record<string, string>;
  tag: string;
  description: string;
  /** "Know your pack" block — optional, shown on the product page when switched on. */
  packEnabled: boolean;
  packIngredients: string;
  packBenefits: string;
  packWhoCanEat: string;
  packWhoShouldBeCareful: string;
  visible: boolean;
  images: string[];
}

const toDraft = (p: AdminProduct | null): Draft => {
  // The form shows exactly what is saved for the product — nothing is pre-filled from bundled copy.
  const saved = p?.pack;
  const sizes = p ? (p.packSizes.length ? p.packSizes : [p.packSize].filter(Boolean)) : [];
  // Initialize packStock from product data or empty object
  const packStock: Record<string, string> = {};
  if (p?.packStock) {
    for (const [size, qty] of Object.entries(p.packStock)) {
      packStock[size] = String(qty);
    }
  }
  return {
    name: p?.name ?? "",
    originalPrice: p?.originalPrice != null ? String(p.originalPrice) : "",
    price: p?.price != null ? String(p.price) : "",
    stock: p ? String(p.stock) : "0",
    channel: p?.channel ?? "ecommerce",
    packSizes: sizes.length ? sizes : [""],
    packStock,
    tag: p?.tag ?? "",
    description: p?.description ?? "",
    // New products start with the block off; existing ones keep whatever was saved.
    packEnabled: saved?.enabled ?? false,
    packIngredients: saved?.ingredients ?? "",
    packBenefits: saved?.benefits ?? "",
    packWhoCanEat: saved?.whoCanEat ?? "",
    packWhoShouldBeCareful: saved?.whoShouldBeCareful ?? "",
    visible: p?.visible ?? false,
    images: p?.images ?? [],
  };
};

export default function ProductsScreen() {
  const { data, mutate, uploadImage, toast, lastSync } = useAdminData();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  /** null = no panel; "new" = Add new product; otherwise the product being edited. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Which catalogue landing box is open. */
  const [channel, setChannel] = useState<ProductChannel>("ecommerce");
  const isNew = selectedId === "new";
  const product = data.products.find((p) => p.id === selectedId) ?? null;

  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [position, setPosition] = useState("");
  const [modal, setModal] = useState<null | "remove" | "preview" | { stockFor: string }>(null);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  /** Opens the Edit product panel for a product and brings it into view. */
  const openEdit = (id: string) => {
    const editing = data.products.find((p) => p.id === id) ?? null;
    setSelectedId(id);
    setDraft(toDraft(editing));
    if (editing) {
      setChannel(editing.channel);
      const pos = data.products.filter((p) => p.channel === editing.channel).sort(productOrder).findIndex((p) => p.id === id) + 1;
      setPosition(String(pos));
    }
    setErrors({});
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  const closePanel = () => setSelectedId(null);

  const startNew = (target: ProductChannel = channel) => {
    setSelectedId("new");
    setDraft({ ...toDraft(null), channel: target });
    setChannel(target);
    setErrors({});
    setPosition("");
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("pf-name")?.focus();
    });
  };

  // The panel refreshes its data every 20 s in the background. The draft is only filled when a
  // product is opened (or after a save), so typing and the Know your pack switch survive refreshes.

  const live = data.products.filter((p) => p.visible);
  const drafts = data.products.length - live.length;
  // Export catalogue items are enquiry-only: they never carry stock alerts or stock KPIs.
  const shop = live.filter((p) => p.channel !== "export");
  const low = shop.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK);
  const out = shop.filter((p) => p.stock <= 0);
  const units = shop.reduce((s, p) => s + p.stock, 0);
  const alerts = shop.filter((p) => p.stock <= LOW_STOCK);
  const listed = data.products.filter((p) => p.channel === channel).sort(productOrder);
  const activeChannel = CHANNELS.find((c) => c.id === channel) ?? CHANNELS[0];

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const addPhotos = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const room = MAX_PHOTOS - draft.images.length;
    if (room <= 0) return toast(`You can add up to ${MAX_PHOTOS} photos.`, "error");
    const added: string[] = [];
    setUploading(true);
    for (const f of list.slice(0, room)) {
      try {
        const blob = await compressImage(f);
        const res = await uploadImage(blob, "product");
        if (res.ok && res.data) added.push(res.data.url);
      } catch (e) {
        toast((e as Error).message, "error");
      }
    }
    setUploading(false);
    if (list.length > room) toast(`Only ${room} more photo${room === 1 ? "" : "s"} fit — the rest were skipped.`, "error");
    if (added.length) setDraft((d) => ({ ...d, images: [...d.images, ...added] }));
  };

  /** Product fields the API expects, built from a stored product (used by the quick visibility toggle). */
  const payloadOf = (p: AdminProduct, visible = p.visible) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    stock: p.stock,
    packSize: p.packSize,
    packSizes: p.packSizes,
    packStock: p.packStock,
    channel: p.channel,
    tag: p.tag,
    description: p.description,
    pack: p.pack,
    visible,
    images: p.images,
  });

  const toggleVisible = (p: AdminProduct, visible: boolean) =>
    mutate("/api/admin/products", "POST", payloadOf(p, visible), visible ? `${p.name} is now visible on the shop.` : `${p.name} is now hidden from the shop.`);

  const save = async () => {
    if (busy || uploading) return;
    const errs: typeof errors = {};
    if (!draft.name.trim()) errs.name = "Product name is required.";
    let price: number | null = null;
    if (draft.price.trim() !== "") {
      price = Number(draft.price);
      if (!Number.isInteger(price) || price < 0) errs.price = "Use a whole number of rupees.";
    } else if (draft.visible && draft.channel !== "export") errs.price = "Add a selling price to make this product visible.";
    let originalPrice: number | null = null;
    if (draft.originalPrice.trim() !== "") {
      originalPrice = Number(draft.originalPrice);
      if (!Number.isInteger(originalPrice) || originalPrice < 0) errs.originalPrice = "Use a whole number of rupees.";
      else if (price == null && !errs.price) errs.price = "Add the selling price too.";
      else if (price != null && originalPrice < price) errs.originalPrice = "Can't be lower than the selling price.";
    }
    const stock = draft.stock.trim() === "" ? 0 : Number(draft.stock);
    if (!Number.isInteger(stock) || stock < 0) errs.stock = "Use a whole number, 0 or more.";
    if (draft.packSizes.some((s) => s.trim().length > 40)) errs.packSizes = "Each pack size must be 40 characters or fewer.";
    const packSizes = cleanPackSizes(draft.packSizes);

    // Validate packStock quantities
    const packStock: Record<string, number> = {};
    for (const [size, qtyStr] of Object.entries(draft.packStock)) {
      if (qtyStr.trim() !== "") {
        const qty = Number(qtyStr);
        if (!Number.isInteger(qty) || qty < 0) {
          errs.packStock = `Invalid quantity for "${size}". Use a whole number, 0 or more.`;
        } else {
          packStock[size] = qty;
        }
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length) return toast("Please fix the highlighted fields.", "error");

    setBusy(true);
    const res = await mutate<{ product: AdminProduct }>(
      "/api/admin/products",
      "POST",
      {
        id: product?.id,
        name: draft.name.trim(),
        price,
        originalPrice,
        stock,
        packSize: packSizes[0] ?? "",
        packSizes,
        packStock,
        channel: draft.channel,
        tag: draft.tag.trim(),
        description: draft.description.trim(),
        pack: {
          enabled: draft.packEnabled,
          ingredients: draft.packIngredients.trim(),
          benefits: draft.packBenefits.trim(),
          whoCanEat: draft.packWhoCanEat.trim(),
          whoShouldBeCareful: draft.packWhoShouldBeCareful.trim(),
          // Saving the form makes this the admin's own copy: cleared boxes stay cleared.
          customized: true,
        },
        visible: draft.visible,
        images: draft.images,
      },
      (r) => {
        if (isNew) {
          return r.product.visible
            ? `“${r.product.name}” is now live in the shop.`
            : `“${r.product.name}” was added. Switch on “Visible on website” when it's ready.`;
        }
        return `Saved — “${r.product.name}” is up to date.`;
      },
    );
    setBusy(false);
    if (res.ok && isNew && res.data) {
      const saved = res.data.product;
      setSelectedId(saved.id);
      // A new product is appended at the end of its catalogue (sort_order 0).
      setPosition(String(data.products.filter((p) => p.channel === saved.channel).length + 1));
    }

    // Reposition the product when the admin typed a different display position.
    if (res.ok && !isNew && product) {
      const targetPos = parseInt(position, 10);
      if (Number.isInteger(targetPos) && targetPos >= 1) {
        const targetChannel = draft.channel;
        const ordered = data.products.filter((p) => p.channel === targetChannel).sort(productOrder);
        const currentPos = ordered.findIndex((p) => p.id === product.id) + 1;
        if (currentPos !== targetPos) {
          const others = ordered.filter((p) => p.id !== product.id);
          const newIndex = Math.min(Math.max(targetPos - 1, 0), others.length);
          others.splice(newIndex, 0, product);
          await mutate("/api/admin/products/reorder", "POST", { channel: targetChannel, ids: others.map((p) => p.id) }, "Product position updated.");
        }
      }
    }
  };

  /** Live "was / now" preview while typing both prices. */
  const pricePreview = (() => {
    const price = Number(draft.price);
    const original = Number(draft.originalPrice);
    if (!draft.price.trim() || !draft.originalPrice.trim() || !Number.isInteger(price) || !Number.isInteger(original) || original <= price || price < 0) return null;
    return { price, original, off: Math.round(((original - price) / original) * 100) };
  })();

  const barcode = product?.barcode || (isNew ? nextBarcode(data.products) : "");
  const tint = product?.color ?? PRODUCT_COLORS[data.products.length % PRODUCT_COLORS.length];
  const status = product ? (product.visible ? { label: "Live on site", tone: "green" as const } : { label: "Hidden", tone: "gray" as const }) : { label: "New product", tone: "blue" as const };
  const stockTarget = typeof modal === "object" && modal ? data.products.find((p) => p.id === modal.stockFor) : null;

  const sizesLabel = (p: AdminProduct) => p.packSizes.filter(Boolean).join(" · ") || p.packSize || "No pack size";

  const subtitle = (p: AdminProduct) =>
    !p.visible ? "Draft · hidden from site" : [sizesLabel(p), p.tag].filter(Boolean).join(" · ") || "—";

  const tileStyle = (p: AdminProduct): React.CSSProperties =>
    p.images[0] ? { backgroundImage: `url(${p.images[0]})` } : { background: p.color };

  const recent = data.stockLog.slice(0, 5);

  return (
    <>
      <Topbar title="Products & Stock" subtitle="Add, edit or hide products — changes are saved instantly">
        <button type="button" className="adm-btn pri lg" onClick={() => startNew()}>+ Add new product</button>
      </Topbar>

      <div className="adm-kpis p-kpis">
        <div className="adm-kpi"><div className="l">Products</div><div className="v">{data.products.length}</div><div className="d">{live.length} live · {drafts} draft</div></div>
        <div className="adm-kpi"><div className="l">Total units in stock</div><div className="v">{units}</div><div className="d">across {shop.length} shop items</div></div>
        <div className="adm-kpi"><div className="l">Low stock</div><div className="v">{low.length}</div><div className={`d ${low.length ? "warn" : ""}`}>{low.length ? "Reorder soon" : "All good"}</div></div>
        <div className="adm-kpi"><div className="l">Out of stock</div><div className="v">{out.length}</div><div className={`d ${out.length ? "bad" : ""}`}>{out.length ? "Restock now" : "All good"}</div></div>
      </div>

      <div className={`p-wrap ${selectedId ? "open" : "closed"}`}>
        <div className="p-col">
          <section className="adm-card" aria-label="Product catalogues">
            <div className="adm-card-h">
              <h2>Catalogues</h2>
              <span>choose a product list</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {CHANNELS.map((c) => {
                const active = c.id === channel;
                const count = data.products.filter((p) => p.channel === c.id).length;
                const liveCount = data.products.filter((p) => p.channel === c.id && p.visible).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    aria-pressed={active}
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: `1.5px solid ${active ? "var(--forest, #3b5a3a)" : "rgba(59,90,58,.16)"}`,
                      background: active ? "rgba(59,90,58,.07)" : "var(--card, #fff)",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{c.title}</span>
                    <span style={{ display: "block", marginTop: 2, fontSize: 24, fontWeight: 700, color: active ? "var(--forest, #3b5a3a)" : "var(--ink)" }}>{count}</span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
                      {c.blurb}
                      <br />{liveCount} live on the website
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-h">
              <h2>{activeChannel.title}</h2>
              <span>{listed.length} product{listed.length === 1 ? "" : "s"}</span>
            </div>
            <div className="adm-scroll">
              <table className="adm-table">
                <thead>
                  <tr><th style={{ width: 52 }}>Order</th><th>Product</th><th className="p-sku">SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Visible</th><th /></tr>
                </thead>
                <tbody>
                  {listed.map((p, index) => {
                    const st = productStatus(p);
                    return (
                      <tr key={p.id} className={`click${selectedId === p.id ? " sel" : ""}`} style={{ height: 56 }} onClick={() => openEdit(p.id)}>
                        <td className="p-order">{index + 1}</td>
                        <td>
                          <div className="p-cell">
                            <div className="p-tile" style={tileStyle(p)}>{p.images[0] ? "" : p.name === "Coming Soon" ? "?" : initials(p.name)}</div>
                            <div><b>{p.name}</b><span>{subtitle(p)}</span></div>
                          </div>
                        </td>
                        <td className="p-sku" style={{ color: "var(--muted)" }}>{p.sku || "—"}</td>
                        <td className="b">
                          {p.price != null ? formatInr(p.price) : "—"}
                          {p.price != null && p.originalPrice != null && p.originalPrice > p.price && (
                            <s style={{ display: "block", fontWeight: 400, fontSize: 11.5, color: "var(--muted)" }}>{formatInr(p.originalPrice)}</s>
                          )}
                        </td>
                        <td>
                          {p.channel === "export" ? (
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>Enquiry only</span>
                          ) : (
                            <>
                              {p.stock} units
                              <div className={`adm-meter${p.stock <= LOW_STOCK ? " low" : ""}`}><i style={{ width: `${Math.min(100, p.stock)}%` }} /></div>
                            </>
                          )}
                        </td>
                        <td><Badge tone={st.tone}>{st.label}</Badge></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Toggle checked={p.visible} label={`Show ${p.name} on website`} onChange={(v) => toggleVisible(p, v)} />
                        </td>
                        <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                          <button className="adm-btn sm" onClick={() => openEdit(p.id)}>Edit</button>
                        </td>
                      </tr>
                    );
                  })}
                  {!listed.length && <tr><td colSpan={8}><div className="adm-empty">No {activeChannel.title} products yet. Click “+ Add new product”.</div></td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12 }}>
              <span className="adm-muted">Add a product to {activeChannel.title}.</span>
              <button type="button" className="adm-btn pri sm" onClick={() => startNew()}>+ Add new product</button>
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-h">
              <h2>Low-stock alerts</h2>
              <span className="p-live" title="Stock refreshes automatically every 20 seconds and after every sale">
                <i aria-hidden="true" />Live{lastSync ? ` · updated ${fmtTime(lastSync)}` : ""}
              </span>
            </div>
            <p className="adm-muted" style={{ margin: "-4px 0 8px" }}>Stock drops automatically with every purchase. You&apos;re emailed when a product reaches {LOW_STOCK} units or fewer.</p>
            {alerts.length ? [...alerts].sort((a, b) => a.stock - b.stock).map((p) => (
              <div className="p-alert" key={p.id}>
                <span><b style={{ color: "var(--ink)" }}>{p.name} {sizesLabel(p)}</b> — {p.stock <= 0 ? <span className="out">out of stock</span> : `${p.stock} left`}</span>
                <button className="adm-btn pri sm" onClick={() => setModal({ stockFor: p.id })}>Update stock</button>
              </div>
            )) : <div className="adm-empty" style={{ padding: "10px 0" }}>Everything is well stocked.</div>}
          </section>

          <section className="adm-card">
            <div className="adm-card-h"><h2>Recent stock changes</h2><span>automatic + manual</span></div>
            {recent.map((l) => (
              <div className="p-log" key={l.id}>
                <span>{l.text}</span>
                <span className={l.delta > 0 ? "plus" : "minus"}>{l.delta > 0 ? "+" : "−"}{Math.abs(l.delta)} · {fmtDateTime(l.at)}</span>
              </div>
            ))}
            {!recent.length && <div className="adm-empty" style={{ padding: "10px 0" }}>No stock changes yet.</div>}
          </section>
        </div>

        {selectedId && (
        <section ref={panelRef} className="adm-card" aria-label={isNew ? "New product" : "Edit product"} style={{ minHeight: 700, display: "flex", flexDirection: "column" }}>
          <div className="adm-card-h">
            <h2>{isNew ? "New product" : "Edit product"}</h2>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Badge tone={status.tone}>{status.label}</Badge>
              <button type="button" className="adm-x" aria-label="Close product panel" onClick={closePanel}>×</button>
            </span>
          </div>

          <div className="p-up">
            <div
              className="p-big"
              style={draft.images[0] ? { backgroundImage: `url(${draft.images[0]})` } : { background: `linear-gradient(135deg, ${tint}22, ${tint}55)`, color: tint }}
            >
              {draft.images[0] ? "" : initials(draft.name || "?")}
            </div>
            <div
              className={`p-drop${over ? " over" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); addPhotos(e.dataTransfer.files); }}
            >
              <div>
                <b>Upload photos</b>
                Drag &amp; drop images
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) addPhotos(e.target.files); e.target.value = ""; }} />
            </div>
          </div>
          {draft.images.length > 0 && (
            <div className="p-thumbs">
              {draft.images.map((src, i) => (
                <div key={i} style={{ backgroundImage: `url(${src})` }}>
                  <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => set("images", draft.images.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="adm-fg">
            <label className="adm-fl" htmlFor="pf-name">Product name</label>
            <input id="pf-name" className={`adm-in${errors.name ? " err" : ""}`} value={draft.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p className="adm-err">{errors.name}</p>}
          </div>
          {!isNew && (
            <div className="adm-fg">
              <label className="adm-fl" htmlFor="pf-position">Display position</label>
              <input
                id="pf-position"
                className="adm-in"
                inputMode="numeric"
                min={1}
                max={listed.length}
                value={position}
                onChange={(e) => setPosition(e.target.value.replace(/\D/g, ""))}
              />
              <p className="adm-muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
                The order this product appears in on the website. Changing it moves the other products down or up automatically.
              </p>
            </div>
          )}
          <div className="adm-row2 adm-fg" style={{ marginBottom: 6 }}>
            <div>
              <label className="adm-fl" htmlFor="pf-mrp">Original price (₹)</label>
              <input id="pf-mrp" className={`adm-in${errors.originalPrice ? " err" : ""}`} inputMode="numeric" placeholder="Optional, e.g. MRP" aria-describedby="pf-price-hint" value={draft.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              {errors.originalPrice && <p className="adm-err">{errors.originalPrice}</p>}
            </div>
            <div>
              <label className="adm-fl" htmlFor="pf-price">Actual price (selling) (₹)</label>
              <input id="pf-price" className={`adm-in${errors.price ? " err" : ""}`} inputMode="numeric" aria-describedby="pf-price-hint" value={draft.price} onChange={(e) => set("price", e.target.value)} />
              {errors.price && <p className="adm-err">{errors.price}</p>}
            </div>
          </div>
          <p id="pf-price-hint" className="adm-muted" style={{ margin: "0 0 14px", fontSize: 12 }}>
            {pricePreview ? (
              <>Shop shows <s>{formatInr(pricePreview.original)}</s> <b style={{ color: "var(--ink)" }}>{formatInr(pricePreview.price)}</b> · {pricePreview.off}% off</>
            ) : (
              "Customers pay the selling price. Add an original price above it to show a struck-through “was” price."
            )}
          </p>
          <div className="adm-row2 adm-fg">
            <div>
              <label className="adm-fl" htmlFor="pf-stock">Stock</label>
              <input id="pf-stock" className={`adm-in${errors.stock ? " err" : ""}`} inputMode="numeric" value={draft.stock} onChange={(e) => set("stock", e.target.value)} />
              {errors.stock && <p className="adm-err">{errors.stock}</p>}
            </div>
            <div>
              <label className="adm-fl" htmlFor="pf-channel">Catalogue</label>
              <select
                id="pf-channel"
                className="adm-in"
                value={draft.channel}
                onChange={(e) => set("channel", e.target.value as ProductChannel)}
              >
                {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-fg">
            <span className="adm-fl" id="pf-packs-label">Pack sizes & quantities</span>
            <div role="group" aria-labelledby="pf-packs-label" style={{ display: "grid", gap: 8 }}>
              {draft.packSizes.map((size, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, alignItems: "center" }}>
                  <input
                    className={`adm-in${errors.packSizes ? " err" : ""}`}
                    value={size}
                    maxLength={40}
                    placeholder={i === 0 ? "e.g. 200 g (default)" : "e.g. 500 g"}
                    aria-label={`Pack size ${i + 1}${i === 0 ? " (default)" : ""}`}
                    onChange={(e) => {
                      const newSizes = draft.packSizes.map((s, j) => (j === i ? e.target.value : s));
                      set("packSizes", newSizes);
                      // Update packStock key when size changes
                      const oldSize = draft.packSizes[i];
                      if (oldSize !== e.target.value && draft.packStock[oldSize]) {
                        const newStock = { ...draft.packStock };
                        newStock[e.target.value] = newStock[oldSize];
                        delete newStock[oldSize];
                        set("packStock", newStock);
                      }
                    }}
                  />
                  <input
                    className={`adm-in${errors.packStock ? " err" : ""}`}
                    inputMode="numeric"
                    value={draft.packStock[size] || ""}
                    placeholder="Qty"
                    aria-label={`Quantity for ${size || "pack size"}`}
                    onChange={(e) => set("packStock", { ...draft.packStock, [size]: e.target.value })}
                  />
                  {draft.packSizes.length > 1 && (
                    <button
                      type="button"
                      className="adm-btn sm"
                      aria-label={`Remove pack size ${i + 1}`}
                      title="Remove this pack size"
                      onClick={() => {
                        const removedSize = draft.packSizes[i];
                        const newStock = { ...draft.packStock };
                        delete newStock[removedSize];
                        set("packStock", newStock);
                        set("packSizes", draft.packSizes.filter((_, j) => j !== i));
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="adm-btn sm"
              style={{ marginTop: 8, alignSelf: "flex-start" }}
              onClick={() => set("packSizes", [...draft.packSizes, ""])}
              disabled={draft.packSizes.length >= MAX_PACK_SIZES}
            >
              + Add pack size
            </button>
            <p className="adm-muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
              The first size is preselected on the shop; customers can choose any size from the dropdown. Set quantity per pack size for detailed stock tracking. Up to {MAX_PACK_SIZES}.
            </p>
            {errors.packSizes && <p className="adm-err">{errors.packSizes}</p>}
            {errors.packStock && <p className="adm-err">{errors.packStock}</p>}
          </div>
          <div className="adm-fg">
            <label className="adm-fl" htmlFor="pf-tag">Tag</label>
            <input id="pf-tag" className="adm-in" value={draft.tag} placeholder="e.g. Bestseller" onChange={(e) => set("tag", e.target.value)} />
          </div>
          <div className="adm-fg">
            <label className="adm-fl" htmlFor="pf-desc">Description</label>
            <textarea id="pf-desc" className="adm-ta" rows={3} value={draft.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="p-pack">
            <div className="p-pack-h">
              <div>
                <b>Know your pack</b>
                <small>Ingredients &amp; benefits · optional</small>
              </div>
              <Toggle
                checked={draft.packEnabled}
                label="Show Know your pack on the product page"
                onChange={(v) => set("packEnabled", v)}
              />
            </div>
            {draft.packEnabled ? (
              <div className="p-pack-b">
                <p className="p-pack-sub">Ingredients &amp; Benefits</p>
                <div className="adm-fg">
                  <label className="adm-fl" htmlFor="pf-pack-ing">Ingredients</label>
                  <textarea
                    id="pf-pack-ing"
                    className="adm-ta"
                    rows={3}
                    maxLength={600}
                    placeholder="e.g. Urad dal · chana dal · red chilli · curry leaves · salt"
                    value={draft.packIngredients}
                    onChange={(e) => set("packIngredients", e.target.value)}
                  />
                </div>
                <div className="adm-fg">
                  <label className="adm-fl" htmlFor="pf-pack-benefits">Benefits</label>
                  <textarea
                    id="pf-pack-benefits"
                    className="adm-ta"
                    rows={3}
                    maxLength={1200}
                    placeholder="What the ingredients bring — protein, fibre, warmth…"
                    value={draft.packBenefits}
                    onChange={(e) => set("packBenefits", e.target.value)}
                  />
                </div>
                <div className="adm-fg">
                  <label className="adm-fl" htmlFor="pf-pack-eat">
                    Who can eat <span className="p-pack-hint">one point per line</span>
                  </label>
                  <textarea
                    id="pf-pack-eat"
                    className="adm-ta"
                    rows={4}
                    placeholder="One point per line — e.g. Adults and older children."
                    value={draft.packWhoCanEat}
                    onChange={(e) => set("packWhoCanEat", e.target.value)}
                  />
                </div>
                <div className="adm-fg">
                  <label className="adm-fl" htmlFor="pf-pack-careful">
                    Who should be careful <span className="p-pack-hint">one point per line</span>
                  </label>
                  <textarea
                    id="pf-pack-careful"
                    className="adm-ta"
                    rows={4}
                    placeholder="One point per line — e.g. People with a chilli allergy."
                    value={draft.packWhoShouldBeCareful}
                    onChange={(e) => set("packWhoShouldBeCareful", e.target.value)}
                  />
                </div>
                <p className="p-pack-note">These appear under the description on the product page. Only boxes with text are shown, so leave a box empty to skip that card; clearing every box hides the section.</p>
              </div>
            ) : (
              <p className="p-pack-note">Hidden on the product page. Switch on to list the ingredients, benefits and who the pack suits.</p>
            )}
          </div>

          <div className="adm-fl">Barcode (auto-generated)</div>
          <div className="p-bc">
            {barcode ? <><BarcodeSvg value={barcode} /><span>{groupBarcode(barcode)}</span></> : <span>Assigned when you save</span>}
          </div>

          <div className="p-vis">
            <span>Visible on website</span>
            <Toggle checked={draft.visible} label="Visible on website" onChange={(v) => set("visible", v)} />
          </div>

          <div className="p-btns" style={{ marginTop: "auto" }}>
            <button className="adm-btn pri lg" onClick={save} disabled={busy || uploading}>{busy ? "Saving…" : isNew ? "Add product" : "Save changes"}</button>
            <button className="adm-btn lg" onClick={() => setModal("preview")} disabled={!draft.name.trim()}>Preview</button>
            {isNew ? (
              <button className="adm-btn lg sp" disabled={busy} onClick={closePanel}>Cancel</button>
            ) : (
              <button className="adm-btn dng lg sp" onClick={() => setModal("remove")}>Remove</button>
            )}
          </div>
        </section>
        )}
      </div>

      {modal === "remove" && product && (
        <ConfirmModal
          title={`Remove ${product.name}?`}
          body="This deletes the product and its photos. Past orders keep their line items. This can't be undone."
          confirmLabel="Remove product"
          onConfirm={async () => {
            const rest = data.products.filter((p) => p.id !== product.id);
            const res = await mutate(`/api/admin/products/${product.id}`, "DELETE", undefined, `${product.name} removed.`);
            if (res.ok) closePanel();
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "preview" && (
        <Modal title="Preview" onClose={() => setModal(null)} footer={<button className="adm-btn" onClick={() => setModal(null)}>Close</button>} noScroll>
          <ProductPreviewCard
            name={draft.name}
            tag={draft.tag}
            packSize={draft.packSizes.map((s) => s.trim()).filter(Boolean).join(" · ")}
            description={draft.description}
            price={draft.price}
            originalPrice={draft.originalPrice}
            images={draft.images}
            visible={draft.visible}
            color={tint}
          />
        </Modal>
      )}
      {stockTarget && (
        <PromptModal
          title={`Update stock · ${stockTarget.name} ${stockTarget.packSize}`}
          label={`Units to add (currently ${stockTarget.stock})`}
          placeholder="e.g. 40"
          confirmLabel="Add stock"
          validate={(v) => (/^\d+$/.test(v.trim()) && Number(v) > 0 ? null : "Enter a whole number greater than 0.")}
          onSubmit={(v) => mutate(`/api/admin/products/${stockTarget.id}/stock`, "POST", { qty: Number(v) }, `Added ${Number(v)} units to ${stockTarget.name}.`)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

