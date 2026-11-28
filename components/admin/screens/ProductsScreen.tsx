"use client";

import { useRef, useState } from "react";
import { fmtDateTime, fmtTime, groupBarcode, initials } from "@/lib/admin/format";
import { compressImage } from "@/lib/admin/image";
import { LOW_STOCK, nextBarcode, productOrder, productStatus } from "@/lib/admin/logic";
import { PRODUCT_COLORS } from "@/lib/admin/defaults";
import { useAdminData } from "@/lib/admin/store";
import type { AdminProduct } from "@/lib/admin/types";
import { cleanPackSizes } from "@/lib/pack";
import { availableStock } from "@/lib/stock";
import { formatInr } from "@/lib/format";
import type { ProductPage } from "@/types";
import { Badge, BarcodeSvg, ConfirmModal, Modal, Toggle, Topbar } from "../ui";
import ProductPreviewCard from "./ProductPreviewCard";

const MAX_PHOTOS = 5;
const MAX_PACK_SIZES = 8;

const PAGES: { id: ProductPage; title: string; blurb: string }[] = [
  {
    id: "ecommerce",
    title: "Ecommerce",
    blurb: "The shop — sold online with stock and prices.",
  },
  {
    id: "distributors",
    title: "Distributors",
    blurb: "The distributor enquiry catalogue on /distributors.",
  },
  {
    id: "export",
    title: "Export",
    blurb: "The export enquiry catalogue on /export — no online checkout.",
  },
];

interface Draft {
  name: string;
  packPrices: Record<string, { price: string; originalPrice: string }>;
  /** Pages the product is shown on. One, two or all three. */
  pages: ProductPage[];
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
  const packPrices: Draft["packPrices"] = {};
  for (const size of sizes.length ? sizes : [""]) {
    const savedPrice = p?.packPrices?.[size] ?? { price: p?.price ?? null, originalPrice: p?.originalPrice ?? null };
    packPrices[size] = {
      price: savedPrice.price != null ? String(savedPrice.price) : "",
      originalPrice: savedPrice.originalPrice != null ? String(savedPrice.originalPrice) : "",
    };
  }
  return {
    name: p?.name ?? "",
    packPrices,
    pages: p?.channels?.length ? p.channels : p?.channel === "export" ? ["export"] : ["ecommerce", "distributors"],
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
  const [channel, setChannel] = useState<ProductPage>("ecommerce");
  const isNew = selectedId === "new";
  const product = data.products.find((p) => p.id === selectedId) ?? null;

  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [position, setPosition] = useState("");
  const [modal, setModal] = useState<null | "remove" | "preview">(null);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  /** Opens the Edit product panel for a product and brings it into view. */
  const openEdit = (id: string) => {
    const editing = data.products.find((p) => p.id === id) ?? null;
    setSelectedId(id);
    setDraft(toDraft(editing));
    if (editing) {
      const pages = editing.channels.length ? editing.channels : (["ecommerce"] as ProductPage[]);
      const target = pages.includes(channel) ? channel : pages[0];
      setChannel(target);
      const pos = data.products.filter((p) => p.channels.includes(target)).sort(productOrder).findIndex((p) => p.id === id) + 1;
      setPosition(String(pos));
    }
    setErrors({});
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  const closePanel = () => setSelectedId(null);

  const startNew = (target: ProductPage = channel) => {
    setSelectedId("new");
    setDraft({ ...toDraft(null), pages: [target] });
    setChannel(target);
    setErrors({});
    setPosition("");
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("pf-name")?.focus();
    });
  };

  // The panel refreshes its data every 60 s in the background. The draft is only filled when a
  // product is opened (or after a save), so typing and the Know your pack switch survive refreshes.

  const listed = data.products.filter((p) => p.channels.includes(channel)).sort(productOrder);
  const live = listed.filter((p) => p.visible);
  const drafts = listed.length - live.length;
  // Only products sold online carry stock alerts and stock KPIs.
  const shop = data.products.filter((p) => p.visible && p.channels.includes("ecommerce"));
  const stockOf = (p: AdminProduct) => availableStock(p) ?? 0;
  const low = shop.filter((p) => stockOf(p) > 0 && stockOf(p) <= LOW_STOCK);
  const out = shop.filter((p) => stockOf(p) <= 0);
  const units = shop.reduce((s, p) => s + stockOf(p), 0);
  const alerts = shop.filter((p) => stockOf(p) <= LOW_STOCK);
  const activeChannel = PAGES.find((c) => c.id === channel) ?? PAGES[0];
  /** Page-wide switch: off hides every product on this page without touching each product's choices. */
  const pageShown = data.settings.pages?.[channel] !== false;
  const setPageVisibility = (enabled: boolean) =>
    mutate(
      "/api/admin/settings/pages",
      "POST",
      { page: channel, enabled },
      enabled
        ? `All products are showing on ${activeChannel.title} again.`
        : `All products are hidden from ${activeChannel.title}. Switch it back on any time.`,
    );

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
    packPrices: p.packPrices,
    stock: p.stock,
    packSize: p.packSize,
    packSizes: p.packSizes,
    packStock: p.packStock,
    channels: p.channels,
    tag: p.tag,
    description: p.description,
    pack: p.pack,
    visible,
    images: p.images,
  });

  const toggleVisible = (p: AdminProduct, visible: boolean) =>
    mutate("/api/admin/products", "POST", payloadOf(p, visible), visible ? `${p.name} is now visible on every page.` : `${p.name} is now hidden from every page.`);

  const pageTitle = (page: ProductPage) => PAGES.find((entry) => entry.id === page)?.title ?? page;

  /** Per-page switch in the table: the master "Visible on website" toggle still hides it everywhere. */
  const togglePage = (p: AdminProduct, page: ProductPage, show: boolean) => {
    const pages = show ? Array.from(new Set([...p.channels, page])) : p.channels.filter((current) => current !== page);
    if (!pages.length) {
      return toast(
        `${p.name} has to stay on at least one page. Use “Visible on website” to hide it everywhere.`,
        "error",
      );
    }
    return mutate(
      "/api/admin/products",
      "POST",
      { ...payloadOf(p), channels: pages },
      show ? `${p.name} now shows on ${pageTitle(page)}.` : `${p.name} is hidden from ${pageTitle(page)}.`,
    );
  };

  const save = async () => {
    if (busy || uploading) return;
    const errs: typeof errors = {};
    if (!draft.name.trim()) errs.name = "Product name is required.";
    if (!draft.pages.length) errs.pages = "Choose at least one page for this product.";
    if (draft.packSizes.some((s) => s.trim().length > 40)) errs.packSizes = "Each pack size must be 40 characters or fewer.";
    const packSizes = cleanPackSizes(draft.packSizes);
    const packPrices: Record<string, { price: number | null; originalPrice: number | null }> = {};
    const pricingSizes = packSizes.length ? packSizes : [""];
    for (const size of pricingSizes) {
      const rawSize = draft.packSizes.find((candidate) => candidate.trim() === size) ?? size;
      const values = draft.packPrices[rawSize] ?? { price: "", originalPrice: "" };
      let price: number | null = null;
      if (values.price.trim()) {
        price = Number(values.price);
        if (!Number.isInteger(price) || price < 0) errs.packPrices = `Selling price for "${size || "pack"}" must be a whole number of rupees.`;
      } else if (draft.visible && draft.pages.includes("ecommerce")) {
        errs.packPrices = `Add a selling price for "${size || "pack"}" before making this product visible.`;
      }
      let originalPrice: number | null = null;
      if (values.originalPrice.trim()) {
        originalPrice = Number(values.originalPrice);
        if (!Number.isInteger(originalPrice) || originalPrice < 0) errs.packPrices = `Original price for "${size || "pack"}" must be a whole number of rupees.`;
        else if (price == null && !errs.packPrices) errs.packPrices = `Add the selling price for "${size || "pack"}" too.`;
        else if (price != null && originalPrice < price) errs.packPrices = `Original price for "${size || "pack"}" can't be lower than its selling price.`;
      }
      packPrices[size] = { price, originalPrice };
    }
    const primaryPrice = packPrices[packSizes[0] ?? ""] ?? { price: null, originalPrice: null };

    // Validate packStock quantities
    const packStock: Record<string, number> = {};
    for (const [size, qtyStr] of Object.entries(draft.packStock)) {
      if (!packSizes.includes(size)) continue;
      if (qtyStr.trim() !== "") {
        const qty = Number(qtyStr);
        if (!Number.isInteger(qty) || qty < 0) {
          errs.packStock = `Invalid quantity for "${size}". Use a whole number, 0 or more.`;
        } else {
          packStock[size] = qty;
        }
      }
    }
    const savedPackStock = product?.packStock ?? {};
    const packStockChanged =
      !product ||
      Object.keys(packStock).length !== Object.keys(savedPackStock).length ||
      Object.entries(packStock).some(([size, quantity]) => savedPackStock[size] !== quantity);
    const stock = packStockChanged
      ? Object.values(packStock).reduce((total, quantity) => total + quantity, 0)
      : product ? availableStock(product) ?? 0 : 0;
    if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
      errs.packStock = "Total stock across pack sizes must be 1,000,000 or fewer.";
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
        price: primaryPrice.price,
        originalPrice: primaryPrice.originalPrice,
        packPrices,
        stock,
        packSize: packSizes[0] ?? "",
        packSizes,
        packStock,
        channels: draft.pages,
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
            ? `“${r.product.name}” is now live on the website.`
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
      setPosition(String(data.products.filter((p) => p.channels.includes(saved.channels[0] ?? channel)).length + 1));
    }

    // Reposition the product when the admin typed a different display position.
    if (res.ok && !isNew && product) {
      const targetPos = parseInt(position, 10);
      if (Number.isInteger(targetPos) && targetPos >= 1) {
        const targetPage = channel;
        const ordered = data.products.filter((p) => p.channels.includes(targetPage)).sort(productOrder);
        const currentPos = ordered.findIndex((p) => p.id === product.id) + 1;
        if (currentPos !== targetPos) {
          const others = ordered.filter((p) => p.id !== product.id);
          const newIndex = Math.min(Math.max(targetPos - 1, 0), others.length);
          others.splice(newIndex, 0, product);
          await mutate("/api/admin/products/reorder", "POST", { channel: targetPage, ids: others.map((p) => p.id) }, "Product position updated.");
        }
      }
    }
  };

  const barcode = product?.barcode || (isNew ? nextBarcode(data.products) : "");
  const tint = product?.color ?? PRODUCT_COLORS[data.products.length % PRODUCT_COLORS.length];
  const status = product ? (product.visible ? { label: "Live on site", tone: "green" as const } : { label: "Hidden", tone: "gray" as const }) : { label: "New product", tone: "blue" as const };
  /** Stock is tracked for anything that isn't export-only (export items are quoted by enquiry). */
  const draftStock = draft.pages.some((page) => page !== "export");
  const previewSize = draft.packSizes.find((size) => size.trim()) ?? "";
  const previewPrices = draft.packPrices[previewSize] ?? { price: "", originalPrice: "" };

  const sizesLabel = (p: AdminProduct) => p.packSizes.filter(Boolean).join(" · ") || p.packSize || "No pack size";

  const subtitle = (p: AdminProduct) =>
    !p.visible ? "Draft · hidden from all pages" : [sizesLabel(p), p.tag].filter(Boolean).join(" · ") || "—";

  const tileStyle = (p: AdminProduct): React.CSSProperties =>
    p.images[0] ? { backgroundImage: `url(${p.images[0]})` } : { background: p.color };

  const recent = data.stockLog.slice(0, 5);

  return (
    <>
      <Topbar
        title={channel === "export" ? "Export Products" : channel === "distributors" ? "Distributor Products" : "Products & Stock"}
        subtitle={
          channel === "export"
            ? "Manage export products, pack sizes and prices"
            : channel === "distributors"
              ? "Manage the products shown on the distributor page"
              : "Add, edit or hide products — changes are saved instantly"
        }
      >
        <button type="button" className="adm-btn pri lg" onClick={() => startNew()}>+ Add new product</button>
      </Topbar>

      <div className="adm-kpis p-kpis">
        <div className="adm-kpi"><div className="l">Products</div><div className="v">{listed.length}</div><div className="d">{live.length} live · {drafts} draft</div></div>
        {channel !== "export" && (
          <>
            <div className="adm-kpi"><div className="l">Total shop units in stock</div><div className="v">{units}</div><div className="d">across {shop.length} shop items</div></div>
            <div className="adm-kpi"><div className="l">Low stock</div><div className="v">{low.length}</div><div className={`d ${low.length ? "warn" : ""}`}>{low.length ? "Reorder soon" : "All good"}</div></div>
            <div className="adm-kpi"><div className="l">Out of stock</div><div className="v">{out.length}</div><div className={`d ${out.length ? "bad" : ""}`}>{out.length ? "Restock now" : "All good"}</div></div>
          </>
        )}
      </div>

      <div className={`p-wrap ${selectedId ? "open" : "closed"}`}>
        <div className="p-col">
          <section className="adm-card" aria-label="Product catalogues">
            <div className="adm-card-h">
              <h2>Catalogues</h2>
              <span>choose a product list</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {PAGES.map((c) => {
                const active = c.id === channel;
                const count = data.products.filter((p) => p.channels.includes(c.id)).length;
                const liveCount = data.products.filter((p) => p.channels.includes(c.id) && p.visible).length;
                const pageOn = data.settings.pages?.[c.id] !== false;
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
                      <br />
                      {pageOn ? `${liveCount} live on the website` : "Hidden — page-wide switch is off"}
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

            {/* One-click page-wide switch: hide every product on this page, or bring them all back. */}
            <div className="adm-box plain" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 0 }}>
              <div style={{ minWidth: 240 }}>
                <b style={{ fontSize: 13.5, color: "var(--ink)" }}>Show products on {activeChannel.title}</b>
                <p className="adm-muted" style={{ margin: "2px 0 0", fontSize: 12, lineHeight: 1.45 }}>
                  One click hides every product on this page. Each product&apos;s own page choices are kept, so switching
                  it back on restores them.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge tone={pageShown ? "green" : "gray"}>{pageShown ? "Page live" : "Page hidden"}</Badge>
                <button type="button" className={`adm-btn sm ${pageShown ? "dng" : "pri"}`} onClick={() => setPageVisibility(!pageShown)}>
                  {pageShown ? "Disable all products" : "Enable all products"}
                </button>
              </div>
            </div>
            <div className="adm-scroll">
              <table className="adm-table adm-table-readable">
                <thead>
                  <tr>
                    <th style={{ width: 52 }}>Order</th><th>Product</th><th className="p-sku">SKU</th><th>Price</th>
                    {channel !== "export" && <th>Stock</th>}
                    <th>Pages</th><th>Status</th><th>All pages</th><th />
                  </tr>
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
                          {(p.packSizes.length ? p.packSizes : [p.packSize]).map((size) => {
                            const prices = p.packPrices[size] ?? { price: p.price, originalPrice: p.originalPrice };
                            return (
                              <div key={size || "pack"} style={{ marginBottom: 3 }}>
                                {size && <span style={{ fontSize: 11, fontWeight: 400 }}>{size}: </span>}
                                {prices.price != null ? formatInr(prices.price) : "—"}
                                {prices.price != null && prices.originalPrice != null && prices.originalPrice > prices.price && (
                                  <s style={{ display: "block", fontWeight: 400, fontSize: 11.5, color: "var(--muted)" }}>{formatInr(prices.originalPrice)}</s>
                                )}
                              </div>
                            );
                          })}
                        </td>
                        {channel !== "export" && (
                          <td>
                            <>
                              {stockOf(p)} units
                              <div className={`adm-meter${stockOf(p) <= LOW_STOCK ? " low" : ""}`}><i style={{ width: `${Math.min(100, stockOf(p))}%` }} /></div>
                            </>
                          </td>
                        )}
                        <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", gap: 4 }}>
                            {PAGES.map((page) => {
                              const on = p.channels.includes(page.id);
                              return (
                                <button
                                  key={page.id}
                                  type="button"
                                  aria-pressed={on}
                                  title={`${on ? "Hide" : "Show"} ${p.name} on ${page.title}`}
                                  onClick={() => togglePage(p, page.id, !on)}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    border: `1px solid ${on ? "rgba(59,90,58,.45)" : "rgba(0,0,0,.12)"}`,
                                    background: on ? "rgba(59,90,58,.1)" : "transparent",
                                    color: on ? "var(--forest, #3b5a3a)" : "var(--muted)",
                                  }}
                                >
                                  {page.id === "ecommerce" ? "Shop" : page.id === "distributors" ? "Dist." : "Export"}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td><Badge tone={st.tone}>{st.label}</Badge></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Toggle checked={p.visible} label={`Show ${p.name} on every page`} onChange={(v) => toggleVisible(p, v)} />
                        </td>
                        <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                          <button className="adm-btn sm" onClick={() => openEdit(p.id)}>Edit</button>
                        </td>
                      </tr>
                    );
                  })}
                  {!listed.length && <tr><td colSpan={channel === "export" ? 8 : 9}><div className="adm-empty">No {activeChannel.title} products yet. Click “+ Add new product”.</div></td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12 }}>
              <span className="adm-muted">Add a product to {activeChannel.title}.</span>
              <button type="button" className="adm-btn pri sm" onClick={() => startNew()}>+ Add new product</button>
            </div>
          </section>

          {channel !== "export" && <section className="adm-card">
            <div className="adm-card-h">
              <h2>Low-stock alerts</h2>
              <span className="p-live" title="Stock refreshes automatically every minute and after every sale">
                <i aria-hidden="true" />Live{lastSync ? ` · updated ${fmtTime(lastSync)}` : ""}
              </span>
            </div>
            <p className="adm-muted" style={{ margin: "-4px 0 8px" }}>Stock drops automatically with every purchase. You&apos;re emailed when a product reaches {LOW_STOCK} units or fewer.</p>
            {alerts.length ? [...alerts].sort((a, b) => stockOf(a) - stockOf(b)).map((p) => (
              <div className="p-alert" key={p.id}>
                <span><b style={{ color: "var(--ink)" }}>{p.name} {sizesLabel(p)}</b> — {stockOf(p) <= 0 ? <span className="out">out of stock</span> : `${stockOf(p)} left`}</span>
                <button className="adm-btn pri sm" onClick={() => openEdit(p.id)}>Update pack stock</button>
              </div>
            )) : <div className="adm-empty" style={{ padding: "10px 0" }}>Everything is well stocked.</div>}
          </section>}
          {channel !== "export" && <section className="adm-card">
            <div className="adm-card-h"><h2>Recent stock changes</h2><span>automatic + manual</span></div>
            {recent.map((l) => (
              <div className="p-log" key={l.id}>
                <span>{l.text}</span>
                <span className={l.delta > 0 ? "plus" : "minus"}>{l.delta > 0 ? "+" : "−"}{Math.abs(l.delta)} · {fmtDateTime(l.at)}</span>
              </div>
            ))}
            {!recent.length && <div className="adm-empty" style={{ padding: "10px 0" }}>No stock changes yet.</div>}
          </section>}
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
          <div className="adm-fg">
            <span className="adm-fl" id="pf-pages-label">Show on these pages</span>
            <div role="group" aria-labelledby="pf-pages-label" style={{ display: "grid", gap: 8 }}>
              {PAGES.map((page) => {
                const on = draft.pages.includes(page.id);
                return (
                  <label
                    key={page.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${on ? "rgba(59,90,58,.45)" : "rgba(0,0,0,.1)"}`,
                      background: on ? "rgba(59,90,58,.05)" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="adm-cb"
                      checked={on}
                      aria-label={`Show on ${page.title}`}
                      style={{ marginTop: 2 }}
                      onChange={(e) =>
                        set(
                          "pages",
                          e.target.checked ? [...draft.pages, page.id] : draft.pages.filter((current) => current !== page.id),
                        )
                      }
                    />
                    <span>
                      <b style={{ display: "block", fontSize: 13.5, color: "var(--ink)" }}>{page.title}</b>
                      <small style={{ display: "block", fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{page.blurb}</small>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.pages && <p className="adm-err">{errors.pages}</p>}
            <p className="adm-muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
              Add the product to one page, two or all three. “Visible on website” below hides it everywhere without
              changing these choices.
            </p>
          </div>
          <div className="adm-fg">
            <span className="adm-fl" id="pf-packs-label">{draftStock ? "Pack sizes, stock & prices" : "Pack sizes & prices"}</span>
            <div aria-hidden="true" className="adm-muted p-pack-head" style={{ display: "grid", gridTemplateColumns: draftStock ? "minmax(0, 1.6fr) minmax(0, .7fr) repeat(2, minmax(0, 1fr)) auto" : "minmax(0, 1.6fr) repeat(2, minmax(0, 1fr)) auto", gap: 8, fontSize: 11 }}>
              <span>Pack size</span>{draftStock && <span>Stock qty</span>}<span>Original price (₹)</span><span>Selling price (₹)</span><span />
            </div>
            <div role="group" aria-labelledby="pf-packs-label" style={{ display: "grid", gap: 8 }}>
              {draft.packSizes.map((size, i) => (
                <div key={i} className={`p-pack-row${draftStock ? "" : " export"}`} style={{ display: "grid", gridTemplateColumns: draftStock ? "minmax(0, 1.6fr) minmax(0, .7fr) repeat(2, minmax(0, 1fr)) auto" : "minmax(0, 1.6fr) repeat(2, minmax(0, 1fr)) auto", gap: 8, alignItems: "center" }}>
                  <input
                    className={`adm-in p-pack-size-field${errors.packSizes ? " err" : ""}`}
                    value={size}
                    maxLength={40}
                    placeholder={i === 0 ? "e.g. 200 g (default)" : "e.g. 500 g"}
                    aria-label={`Pack size ${i + 1}${i === 0 ? " (default)" : ""}`}
                    onChange={(e) => {
                      const newSizes = draft.packSizes.map((s, j) => (j === i ? e.target.value : s));
                      set("packSizes", newSizes);
                      const oldSize = draft.packSizes[i];
                      if (oldSize !== e.target.value && Object.prototype.hasOwnProperty.call(draft.packStock, oldSize)) {
                        const newStock = { ...draft.packStock };
                        newStock[e.target.value] = newStock[oldSize];
                        delete newStock[oldSize];
                        set("packStock", newStock);
                      }
                      if (oldSize !== e.target.value && draft.packPrices[oldSize]) {
                        const newPrices = { ...draft.packPrices, [e.target.value]: draft.packPrices[oldSize] };
                        delete newPrices[oldSize];
                        set("packPrices", newPrices);
                      }
                    }}
                  />
                  {draftStock && (
                    <input
                      className={`adm-in p-pack-stock-field${errors.packStock ? " err" : ""}`}
                      inputMode="numeric"
                      value={draft.packStock[size] || ""}
                      placeholder="Stock qty"
                      aria-label={`Stock quantity for ${size || "pack size"}`}
                      onChange={(e) => set("packStock", { ...draft.packStock, [size]: e.target.value })}
                    />
                  )}
                  <input
                    className={`adm-in p-pack-original-field${errors.packPrices ? " err" : ""}`}
                    inputMode="numeric"
                    value={draft.packPrices[size]?.originalPrice ?? ""}
                    placeholder="Original price (₹)"
                    aria-label={`Original price for ${size || "pack"} in rupees`}
                    onChange={(e) => set("packPrices", { ...draft.packPrices, [size]: { ...draft.packPrices[size], originalPrice: e.target.value, price: draft.packPrices[size]?.price ?? "" } })}
                  />
                  <input
                    className={`adm-in p-pack-selling-field${errors.packPrices ? " err" : ""}`}
                    inputMode="numeric"
                    value={draft.packPrices[size]?.price ?? ""}
                    placeholder="Selling price"
                    aria-label={`Selling price for ${size || "pack"} in rupees`}
                    onChange={(e) => set("packPrices", { ...draft.packPrices, [size]: { ...draft.packPrices[size], price: e.target.value, originalPrice: draft.packPrices[size]?.originalPrice ?? "" } })}
                  />
                  {draft.packSizes.length > 1 && (
                    <button
                      type="button"
                      className="adm-btn sm p-pack-remove"
                      aria-label={`Remove pack size ${i + 1}`}
                      title="Remove this pack size"
                      onClick={() => {
                        const removedSize = draft.packSizes[i];
                        const newStock = { ...draft.packStock };
                        delete newStock[removedSize];
                        set("packStock", newStock);
                        const newPrices = { ...draft.packPrices };
                        delete newPrices[removedSize];
                        set("packPrices", newPrices);
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
            {errors.packSizes && <p className="adm-err">{errors.packSizes}</p>}
            {draftStock && errors.packStock && <p className="adm-err">{errors.packStock}</p>}
            {errors.packPrices && <p className="adm-err">{errors.packPrices}</p>}
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
            <span>
              Visible on website
              <small className="adm-muted" style={{ display: "block", fontSize: 11.5, fontWeight: 400 }}>
                Master switch — off hides it from every page.
              </small>
            </span>
            <Toggle checked={draft.visible} label="Visible on every page" onChange={(v) => set("visible", v)} />
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
            price={previewPrices.price}
            originalPrice={previewPrices.originalPrice}
            images={draft.images}
            visible={draft.visible}
            color={tint}
          />
        </Modal>
      )}
    </>
  );
}

