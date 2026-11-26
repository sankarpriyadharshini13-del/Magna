"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ArrowIcon, ChevronIcon, CloseIcon, PlusIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { useUI } from "@/context/UIContext";
import { getSupabase } from "@/lib/supabase";
import { packSizesOf } from "@/lib/pack";

export type EnquiryType = "business" | "distributor" | "export";

const field =
  "w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15";

const label = "mb-2 block text-sm font-semibold text-forest";

/** Fields shown under the shared company / contact / email block, per enquiry type. */
function ExtraFields({ type }: { type: EnquiryType }) {
  if (type === "business") {
    return (
      <div>
        <label htmlFor="enq-message" className={label}>Your Requirements</label>
        <textarea id="enq-message" name="message" required rows={4} placeholder="Tell us about your business and what you need" className={`${field} resize-none`} />
      </div>
    );
  }
  if (type === "distributor") {
    return (
      <>
        <div>
          <label htmlFor="enq-region" className={label}>Region / Territory</label>
          <input id="enq-region" name="region" required type="text" placeholder="City, district or state you want to cover" className={field} />
        </div>
        <div>
          <label htmlFor="enq-current" className={label}>Current Distribution Experience</label>
          <textarea id="enq-current" name="current" required rows={3} placeholder="Briefly describe your current distribution business and products you handle" className={`${field} resize-none`} />
        </div>
        <div>
          <label htmlFor="enq-message" className={label}>Additional Information</label>
          <textarea id="enq-message" name="message" rows={3} placeholder="Any other details you'd like to share" className={`${field} resize-none`} />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-country" className={label}>Country</label>
          <input id="enq-country" name="country" required type="text" placeholder="Destination country" className={field} />
        </div>
        <div>
          <label htmlFor="enq-location" className={label}>Location</label>
          <input id="enq-location" name="location" required type="text" placeholder="City / port of destination" className={field} />
        </div>
      </div>
      <ProductPicker type={type} />
      <div>
        <label htmlFor="enq-message" className={label}>Additional Requirements</label>
        <textarea id="enq-message" name="message" rows={3} placeholder="Any specific packaging, labelling, or other requirements" className={`${field} resize-none`} />
      </div>
    </>
  );
}

const FALLBACK_EXPORT_PRODUCTS = [
  { id: "raw-moringa-powder", name: "Raw Moringa Powder", packSize: "100 g - 1 kg" },
  { id: "groundnut-oil", name: "Groundnut Oil (Wood-Pressed)", packSize: "1 L - 15 L" },
  { id: "coconut-oil", name: "Coconut Oil (Virgin Cold-Pressed)", packSize: "500 ml - 5 L" },
  { id: "sesame-oil", name: "Sesame Oil (Cold-Pressed)", packSize: "500 ml - 5 L" },
  { id: "sunflower-oil", name: "Sunflower Oil", packSize: "1 L - 15 L" },
  { id: "olive-oil", name: "Olive Oil (Extra-Virgin)", packSize: "500 ml - 5 L" },
  { id: "turmeric", name: "GI-Tagged Turmeric (Powder & Whole)", packSize: "100 g - 1 kg" },
  { id: "makhana", name: "Makhana (Fox Nuts)", packSize: "100 g - 250 g" },
  { id: "chilli", name: "Whole & Ground Chilli", packSize: "100 g - 1 kg" },
  { id: "spices-podis", name: "Traditional Spices & Stone-Ground Podis", packSize: "Bulk / Trial" },
  { id: "millets", name: "Millets & Ancient Grains (Ragi, Bajra, Foxtail)", packSize: "Bulk / Retail" },
  { id: "natural-sweeteners", name: "Unrefined Country Sugar & Jaggery", packSize: "Bulk / Retail" },
];

/**
 * Product rows for the export enquiry: every row pairs an export product with its own
 * pack size selection and estimated quantity. Only export-specific catalogue items are listed for export enquiries.
 */
function ProductPicker({ type = "export" }: { type?: EnquiryType }) {
  const { products } = useProducts();
  const [rows, setRows] = useState<number[]>([0]);
  const nextKey = useRef(1);

  const isExport = type === "export";
  const dbExportProducts = products.filter((p) => p.channel === "export");
  const availableProducts = isExport
    ? dbExportProducts.length > 0
      ? dbExportProducts
      : FALLBACK_EXPORT_PRODUCTS
    : products.filter((p) => p.channel !== "export");

  // Catalogue not loaded (or empty) — keep plain text fields so the enquiry still goes through.
  if (availableProducts.length === 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-products" className={label}>Products Interested</label>
          <input id="enq-products" name="products" required type="text" placeholder="Tell us which products you need" className={field} />
        </div>
        <div>
          <label htmlFor="enq-quantity" className={label}>Estimated Quantity</label>
          <input id="enq-quantity" name="quantity" required type="text" placeholder="e.g., 500 kg, 1000 units" className={field} />
        </div>
      </div>
    );
  }

  const full = rows.length >= availableProducts.length;
  const addRow = () => {
    if (full) return;
    const key = nextKey.current++;
    setRows((r) => [...r, key]);
  };

  return (
    <div>
      {/* Column headings line up with the fields from sm up; on phones the first row labels itself. */}
      <div className="mb-2 hidden gap-2 sm:flex sm:gap-3">
        <div className="grid flex-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <label htmlFor="enq-products" className="block text-sm font-semibold text-forest">Product</label>
          <label htmlFor="enq-pack-size" className="block text-sm font-semibold text-forest">Pack Size</label>
          <label htmlFor="enq-quantity" className="block text-sm font-semibold text-forest">Quantity</label>
        </div>
        <span aria-hidden="true" className="w-11 shrink-0" />
      </div>

      <div className="space-y-3 sm:space-y-2">
        {rows.map((key, i) => (
          <div key={key} className="flex items-end gap-2 sm:items-center sm:gap-3">
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <div className="min-w-0">
                {i === 0 && (
                  <label htmlFor="enq-products" className="mb-1.5 block text-sm font-semibold text-forest sm:hidden">Product</label>
                )}
                <div className="relative min-w-0">
                  <select
                    id={i === 0 ? "enq-products" : undefined}
                    name="products"
                    required
                    defaultValue=""
                    aria-label={i === 0 ? undefined : `Product ${i + 1}`}
                    className={`${field} cursor-pointer appearance-none pr-10 invalid:text-ink/35 [&>option]:text-ink`}
                  >
                    <option value="">Select a product</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronIcon width={16} height={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/50" />
                </div>
              </div>
              <div className="min-w-0">
                {i === 0 && (
                  <label htmlFor="enq-pack-size" className="mb-1.5 block text-sm font-semibold text-forest sm:hidden">Pack Size</label>
                )}
                <div className="relative min-w-0">
                  <select
                    id={i === 0 ? "enq-pack-size" : undefined}
                    name="packSize"
                    required
                    defaultValue=""
                    aria-label={i === 0 ? undefined : `Pack size for product ${i + 1}`}
                    className={`${field} cursor-pointer appearance-none pr-10 invalid:text-ink/35 [&>option]:text-ink`}
                  >
                    <option value="">Select pack size</option>
                    {availableProducts.map((p) => {
                      const sizes = packSizesOf(p).filter(Boolean);
                      return sizes.map((size) => (
                        <option key={`${p.id}-${size}`} value={size}>
                          {size}
                        </option>
                      ));
                    })}
                  </select>
                  <ChevronIcon width={16} height={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/50" />
                </div>
              </div>
              <div className="min-w-0">
                {i === 0 && (
                  <label htmlFor="enq-quantity" className="mb-1.5 block text-sm font-semibold text-forest sm:hidden">Quantity</label>
                )}
                <input
                  id={i === 0 ? "enq-quantity" : undefined}
                  name="quantity"
                  required
                  type="text"
                  placeholder="e.g., 500"
                  aria-label={i === 0 ? undefined : `Quantity for product ${i + 1}`}
                  className={field}
                />
              </div>
            </div>
            {i === 0 ? (
              <button
                type="button"
                onClick={addRow}
                disabled={full}
                aria-label="Add another product"
                title={full ? "All products already added" : "Add another product"}
                className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-forest/20 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-forest/20 disabled:hover:bg-transparent disabled:hover:text-forest"
              >
                <PlusIcon width={16} height={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((k) => k !== key))}
                aria-label={`Remove product ${i + 1}`}
                className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink/45 transition-colors hover:bg-forest/5 hover:text-forest"
              >
                <CloseIcon width={16} height={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Enquiry form for the Business, Distributors and Export pages. Posts to /api/enquiries,
 * which saves it as an enquiry order in Admin → Orders.
 */
export default function EnquiryForm({ type }: { type: EnquiryType }) {
  const { user } = useAuth();
  const { open: openPanel } = useUI();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    // Every product row posts one product, pack size, and quantity, in DOM order.
    const names = d.getAll("products").map((v) => String(v).trim());
    const packSizes = d.getAll("packSize").map((v) => String(v).trim());
    const quantities = d.getAll("quantity").map((v) => String(v).trim());
    const picks = names.map((product, i) => ({ product, packSize: packSizes[i] ?? "", quantity: quantities[i] ?? "" })).filter((p) => p.product);
    if (type === "export" && picks.length === 0) {
      setError("Please select at least one product.");
      return;
    }
    setState("sending");
    setError("");
    try {
      // When the visitor is signed in, send their session so the enquiry is linked to their
      // account and shows up in My orders. Business enquiries stay open to guests; distributor
      // and export enquiries require a signed-in account (enforced by the server too).
      const token = (await getSupabase()?.auth.getSession())?.data.session?.access_token;
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          type,
          website: d.get("website") ?? "",
          company: d.get("company"),
          name: d.get("name"),
          phone: d.get("phone"),
          email: d.get("email"),
          region: d.get("region"),
          current: d.get("current"),
          country: d.get("country"),
          location: d.get("location"),
          products: picks.length ? picks.map((p) => p.product).join(", ") : null,
          packSizes: picks.length ? picks.map((p) => p.packSize).join(", ") : null,
          quantity: picks.length ? picks.map((p) => `${p.quantity} (${p.product} - ${p.packSize})`).join("; ") : null,
          message: d.get("message"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  };

  // Distributor and export enquiries are for signed-in partners only (the server enforces this too).
  if (type !== "business" && !user) {
    return (
      <div className="rounded-xl border border-forest/10 bg-white p-6 text-center">
        <p className="font-display text-lg font-semibold text-forest">Sign in to continue</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          {type === "distributor" ? "Distributor applications are open to signed-in partners." : "Export enquiries are open to signed-in buyers."}
        </p>
        <button type="button" onClick={() => openPanel("account")} className="btn-primary mt-4">
          Sign in / Create account
        </button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-xl bg-leaf/10 p-6 text-center">
        <p className="font-display text-xl font-semibold text-forest">Thank you!</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          We've received your enquiry and will get back to you soon.
        </p>
        {user && (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              It&apos;s also listed in My orders, where you can follow its status.
            </p>
            <Link
              href="/orders"
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-deep"
            >
              View in My orders <ArrowIcon width={15} height={15} />
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      {/* Honeypot — hidden from people, bots fill it and the server drops the enquiry. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div>
        <label htmlFor="enq-company" className={label}>{type === "business" ? "Business Name" : "Company Name"}</label>
        <input id="enq-company" name="company" required type="text" placeholder={type === "business" ? "Your business name" : "Your company name"} className={field} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-name" className={label}>Contact Person</label>
          <input id="enq-name" name="name" required autoComplete="name" type="text" placeholder="Your name" className={field} />
        </div>
        <div>
          <label htmlFor="enq-phone" className={label}>Phone</label>
          <input id="enq-phone" name="phone" required autoComplete="tel" type="tel" placeholder="Your phone number" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="enq-email" className={label}>Email</label>
        <input id="enq-email" name="email" required autoComplete="email" type="email" placeholder="your@email.com" className={field} />
      </div>
      <ExtraFields type={type} />
      {error && <p className="text-sm font-semibold text-clay" role="alert">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary group disabled:opacity-60">
        {state === "sending" ? "Sending…" : type === "distributor" ? "Submit application" : "Send enquiry"}{" "}
        <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
