"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowIcon, ChevronIcon, CloseIcon, PlusIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { packSizesOf } from "@/lib/pack";
import type { Product } from "@/types";
import CountrySelect, { DEFAULT_COUNTRY_CODE, type Country } from "./CountrySelect";
import Combobox from "./Combobox";
import { INDIA_STATES } from "@/data/india-states";

export type EnquiryType = "business" | "distributor" | "export";

const field =
  "w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15";

/** Red outline for a required field that was submitted empty. */
const invalidField = "border-red-500 bg-red-50/60 focus:border-red-500 focus:ring-red-500/15";

const label = "mb-2 block text-sm font-semibold text-forest";
const hint = "mt-1.5 text-xs leading-relaxed text-ink/50";
const errorText = "mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-red-600";

type EnquiryProduct = Pick<Product, "id" | "name" | "packSize" | "packSizes">;
const MAX_PRODUCT_ROWS = 20;

const INITIAL_COUNTRY: Country = { code: DEFAULT_COUNTRY_CODE, name: "India" };

interface ProductRow {
  key: number;
  /** Catalogue product id, or the typed product name when the catalogue isn't loaded. */
  productId: string;
  packSize: string;
  quantity: string;
}

const blankRow = (key: number): ProductRow => ({ key, productId: "", packSize: "", quantity: "" });

type Errors = Record<string, string>;

/** Maps an error key ("product-2", "packSize-2", "quantity-2", "company") to the control's DOM id. */
function controlId(key: string) {
  const dash = key.indexOf("-");
  if (dash === -1) return `enq-${key}`;
  const name = key.slice(0, dash);
  const rowKey = key.slice(dash + 1);
  if (name === "product") return `enq-product-${rowKey}`;
  if (name === "packSize") return `enq-pack-${rowKey}`;
  return `enq-qty-${rowKey}`;
}

/** India PINs are six digits; other countries allow letters, digits, spaces and dashes. */
const postalOk = (value: string, countryCode: string) =>
  countryCode === "IN"
    ? /^[1-9]\d{5}$/.test(value.trim())
    : /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(value.trim());

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className={errorText} role="alert">
      <span aria-hidden="true">•</span>
      <span>{message}</span>
    </p>
  ) : null;

/**
 * Enquiry form for the Business, Distributors and Export pages. Posts to /api/enquiries,
 * which saves it as an enquiry order in Admin → Orders.
 *
 * Distributors and Export enquiries collect a full destination (country, state, city and
 * PIN / postal code) plus one or more product rows (product + pack size + quantity).
 * Every required field is checked here, so a missing product, pack size or quantity is
 * outlined in red and scrolled into view instead of silently blocking the submit.
 */
export default function EnquiryForm({ type, products = [] }: { type: EnquiryType; products?: EnquiryProduct[] }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [country, setCountry] = useState<Country>(INITIAL_COUNTRY);
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [lookup, setLookup] = useState<"" | "loading" | "found" | "missing">("");
  /** Suggestions for the State / City type-ahead fields (nothing here locks free text). */
  const [stateOptions, setStateOptions] = useState<string[]>(INDIA_STATES);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [rows, setRows] = useState<ProductRow[]>(() => [blankRow(0)]);
  const nextRowKey = useRef(1);

  const exporting = type === "export";
  const needsLocation = type !== "business";
  const hasCatalogue = products.length > 0;
  const full = rows.length >= MAX_PRODUCT_ROWS;
  const fieldClass = (key: string) => `${field} ${errors[key] ? invalidField : ""}`;

  const clearError = (key: string) =>
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });

  const addRow = () => {
    if (full) return;
    const key = nextRowKey.current++;
    setRows((current) => [...current, blankRow(key)]);
  };

  const removeRow = (key: number) => {
    setRows((current) => current.filter((row) => row.key !== key));
    setErrors((current) => {
      const next = { ...current };
      delete next[`product-${key}`];
      delete next[`packSize-${key}`];
      delete next[`quantity-${key}`];
      return next;
    });
  };

  const updateRow = (key: number, patch: Partial<ProductRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  // States for the chosen country. India is instant (bundled list); other countries ask our API,
  // which is debounced so typing “Canada” doesn’t fire a request per key.
  useEffect(() => {
    if (!needsLocation) return;
    const countryName = country.name.trim();
    if (!countryName) {
      setStateOptions(INDIA_STATES);
      return;
    }
    const timer = setTimeout(async () => {
      setStatesLoading(true);
      try {
        const params = new URLSearchParams({ country: countryName });
        if (country.code) params.set("code", country.code);
        const res = await fetch(`/api/locations/states?${params.toString()}`);
        const data = (await res.json().catch(() => null)) as { states?: string[] } | null;
        setStateOptions(res.ok && Array.isArray(data?.states) ? data.states : []);
      } catch {
        setStateOptions([]);
      } finally {
        setStatesLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [country.name, needsLocation]);

  // Cities for the chosen country + state, debounced the same way.
  useEffect(() => {
    if (!needsLocation) return;
    const countryName = country.name.trim();
    const state = stateName.trim();
    if (!countryName || state.length < 2) {
      setCityOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCitiesLoading(true);
      try {
        const params = new URLSearchParams({ country: countryName, state });
        if (country.code) params.set("code", country.code);
        const res = await fetch(`/api/locations/cities?${params.toString()}`);
        const data = (await res.json().catch(() => null)) as { cities?: string[] } | null;
        setCityOptions(res.ok && Array.isArray(data?.cities) ? data.cities : []);
      } catch {
        setCityOptions([]);
      } finally {
        setCitiesLoading(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [country.name, stateName, needsLocation]);

  /** Fills City and State from the PIN / postal code (India Post or zippopotam.us via our API). */
  const findCity = async () => {
    const pin = pincode.trim();
    if (!pin || !country.code || !postalOk(pin, country.code)) return;
    setLookup("loading");
    try {
      const params = new URLSearchParams({ country: country.code, pin });
      const res = await fetch(`/api/locations/pincode?${params.toString()}`);
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; city?: string; state?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setLookup("missing");
        return;
      }
      if (data.city) {
        setCity(data.city);
        setCityOptions((current) => (data.city && !current.includes(data.city) ? [data.city, ...current] : current));
      }
      if (data.state) {
        setStateName(data.state);
        setStateOptions((current) => (data.state && !current.includes(data.state) ? [data.state, ...current] : current));
      }
      setLookup("found");
    } catch {
      setLookup("missing");
    }
  };

  // A complete Indian PIN is looked up automatically, so the city and state fill in as you type.
  useEffect(() => {
    if (!needsLocation || country.code !== "IN" || !/^\d{6}$/.test(pincode.trim())) return;
    const timer = setTimeout(findCity, 400);
    return () => clearTimeout(timer);
    // findCity reads the current pincode/country — those are the fields listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode, country.code, needsLocation]);

  const validate = (data: FormData): Errors => {
    const next: Errors = {};
    if (!String(data.get("company") ?? "").trim()) {
      next.company = `Enter your ${type === "business" ? "business" : "company"} name.`;
    }
    if (!String(data.get("name") ?? "").trim()) next.name = "Enter the contact person's name.";

    const phone = String(data.get("phone") ?? "").trim();
    if (!phone) next.phone = "Enter a phone number we can reach you on.";
    else if (phone.replace(/\D/g, "").length < 10) next.phone = "Enter at least 10 digits.";

    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";

    if (type === "business" && !String(data.get("message") ?? "").trim()) {
      next.message = "Tell us what you need.";
    }

    if (needsLocation) {
      if (!country.code) next.country = "Select your country.";
      if (!stateName.trim()) next.state = exporting ? "Enter your state or province." : "Enter your state.";
      if (!city.trim()) next.city = exporting ? "Enter your city." : "Enter your city or district.";
      if (!pincode.trim()) {
        next.pincode = exporting ? "Enter your postal / ZIP code." : "Enter your PIN code.";
      } else if (!postalOk(pincode, country.code)) {
        next.pincode = country.code === "IN" ? "Enter a valid 6-digit PIN code." : "Enter a valid postal / ZIP code.";
      }

      for (const row of rows) {
        if (!row.productId.trim()) {
          next[`product-${row.key}`] = hasCatalogue ? "Please select a product." : "Enter the product name.";
        } else {
          const product = products.find((p) => p.id === row.productId);
          if (product && packSizesOf(product).filter(Boolean).length > 0 && !row.packSize) {
            next[`packSize-${row.key}`] = "Please select a pack size.";
          }
        }
        if (!row.quantity.trim()) next[`quantity-${row.key}`] = "Please enter a quantity.";
      }
    }
    return next;
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setError("Please complete the highlighted fields before sending.");
      const target = document.getElementById(controlId(Object.keys(found)[0]));
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      (target as HTMLElement | null)?.focus({ preventScroll: true });
      return;
    }
    setError("");

    const picks = rows
      .map((row) => {
        const product = products.find((p) => p.id === row.productId);
        return {
          product: hasCatalogue ? product?.name ?? "" : row.productId.trim(),
          packSize: row.packSize,
          quantity: row.quantity.trim(),
        };
      })
      .filter((pick) => pick.product);

    setStatus("sending");
    try {
      // When the visitor is signed in, link the enquiry to their account and My orders.
      const token = (await getSupabase()?.auth.getSession())?.data.session?.access_token;
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          type,
          website: data.get("website") ?? "",
          company: data.get("company"),
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          country: needsLocation ? country.name : "",
          countryCode: needsLocation ? country.code : "",
          state: needsLocation ? stateName : "",
          city: needsLocation ? city : "",
          pincode: needsLocation ? pincode : "",
          items: picks,
          products: picks.length ? picks.map((pick) => pick.product).join(", ") : null,
          packSizes: picks.length ? picks.map((pick) => pick.packSize).join(", ") : null,
          quantity: picks.length ? picks.map((pick) => `${pick.quantity} (${pick.product} - ${pick.packSize})`).join("; ") : null,
          message: data.get("message"),
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-xl bg-leaf/10 p-6 text-center">
        <p className="font-display text-xl font-semibold text-forest">Thank you!</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          We&apos;ve received your enquiry and will get back to you soon.
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
    <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
      {/* Honeypot — hidden from people, bots fill it and the server drops the enquiry. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div>
        <label htmlFor="enq-company" className={label}>
          {type === "business" ? "Business Name" : "Company Name"}
        </label>
        <input
          id="enq-company"
          name="company"
          required
          type="text"
          autoComplete="organization"
          placeholder={type === "business" ? "Your business name" : "Your company name"}
          aria-invalid={Boolean(errors.company) || undefined}
          onChange={() => clearError("company")}
          className={fieldClass("company")}
        />
        <FieldError message={errors.company} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="enq-name" className={label}>Contact Person</label>
          <input
            id="enq-name"
            name="name"
            required
            autoComplete="name"
            type="text"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name) || undefined}
            onChange={() => clearError("name")}
            className={fieldClass("name")}
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <label htmlFor="enq-phone" className={label}>{type === "distributor" ? "Contact" : "Phone"}</label>
          <input
            id="enq-phone"
            name="phone"
            required
            autoComplete="tel"
            type="tel"
            inputMode="tel"
            placeholder={type === "distributor" ? "Phone or WhatsApp number" : "Your phone number"}
            aria-invalid={Boolean(errors.phone) || undefined}
            onChange={() => clearError("phone")}
            className={fieldClass("phone")}
          />
          <FieldError message={errors.phone} />
        </div>
      </div>

      <div>
        <label htmlFor="enq-email" className={label}>Email</label>
        <input
          id="enq-email"
          name="email"
          required
          autoComplete="email"
          type="email"
          placeholder="your@email.com"
          aria-invalid={Boolean(errors.email) || undefined}
          onChange={() => clearError("email")}
          className={fieldClass("email")}
        />
        <FieldError message={errors.email} />
      </div>

      {type === "business" && (
        <div>
          <label htmlFor="enq-message" className={label}>Your Requirements</label>
          <textarea
            id="enq-message"
            name="message"
            rows={4}
            placeholder="Tell us about your business and what you need"
            aria-invalid={Boolean(errors.message) || undefined}
            onChange={() => clearError("message")}
            className={`${fieldClass("message")} resize-none`}
          />
          <FieldError message={errors.message} />
        </div>
      )}

      {needsLocation && (
        <>
          <fieldset className="rounded-2xl border border-forest/10 bg-sand/25 p-4 sm:p-5">
            <legend className="px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-clay">
              {exporting ? "Destination details" : "Business location"}
            </legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="enq-country" className={label}>Country</label>
                <CountrySelect
                  id="enq-country"
                  value={country}
                  invalid={Boolean(errors.country)}
                  onChange={(picked) => {
                    setCountry(picked);
                    setLookup("");
                    setStateName("");
                    setCity("");
                    setCityOptions([]);
                    setStateOptions(picked.name.trim().toLowerCase() === "india" ? INDIA_STATES : []);
                    clearError("country");
                    clearError("state");
                    clearError("city");
                    clearError("pincode");
                  }}
                />
                <FieldError message={errors.country} />
                <p className={hint}>Type to search the full country list, then pick a suggestion.</p>
              </div>
              <div>
                <label htmlFor="enq-state" className={label}>
                  {exporting ? "State / Province" : "State"}
                </label>
                <Combobox
                  id="enq-state"
                  value={stateName}
                  options={stateOptions}
                  loading={statesLoading}
                  placeholder={exporting ? "Start typing a state or province" : "Start typing a state or union territory"}
                  autoComplete="address-level1"
                  invalid={Boolean(errors.state)}
                  onChange={(text) => {
                    setStateName(text);
                    clearError("state");
                  }}
                />
                <FieldError message={errors.state} />
              </div>
              <div>
                <label htmlFor="enq-city" className={label}>
                  {exporting ? "City" : "City / District"}
                </label>
                <Combobox
                  id="enq-city"
                  value={city}
                  options={cityOptions}
                  loading={citiesLoading}
                  placeholder={exporting ? "Start typing a city" : "Start typing a city or district"}
                  autoComplete="address-level2"
                  invalid={Boolean(errors.city)}
                  onChange={(text) => {
                    setCity(text);
                    clearError("city");
                  }}
                />
                <FieldError message={errors.city} />
              </div>
              <div>
                <label htmlFor="enq-pincode" className={label}>
                  {exporting ? "Postal / ZIP Code" : "PIN Code"}
                </label>
                <input
                  id="enq-pincode"
                  name="pincode"
                  type="text"
                  inputMode={country.code === "IN" ? "numeric" : "text"}
                  maxLength={12}
                  value={pincode}
                  placeholder={country.code === "IN" ? "6-digit PIN code" : "Postal / ZIP code"}
                  aria-invalid={Boolean(errors.pincode) || undefined}
                  onChange={(event) => {
                    setPincode(event.target.value);
                    setLookup("");
                    clearError("pincode");
                  }}
                  onBlur={findCity}
                  className={fieldClass("pincode")}
                />
                {lookup === "loading" && <p className={hint}>Looking up your city…</p>}
                {lookup === "found" && <p className={hint}>City and state filled in — change them if needed.</p>}
                {lookup === "missing" && <p className={hint}>No match found. Please enter the city and state yourself.</p>}
                <FieldError message={errors.pincode} />
              </div>
            </div>
          </fieldset>


          <ProductPicker
            products={products}
            rows={rows}
            errors={errors}
            hasCatalogue={hasCatalogue}
            full={full}
            onAdd={addRow}
            onRemove={removeRow}
            onChange={updateRow}
            onClearError={clearError}
          />

          <div>
            <label htmlFor="enq-message" className={label}>
              {exporting ? "Additional Requirements" : "Additional Information"}{" "}
              <span className="font-normal text-ink/45">(optional)</span>
            </label>
            <textarea
              id="enq-message"
              name="message"
              rows={3}
              placeholder={
                exporting
                  ? "Any specific packaging, labelling, or other requirements"
                  : "Any other details you'd like to share"
              }
              onChange={() => clearError("message")}
              className={`${fieldClass("message")} resize-none`}
            />
          </div>
        </>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary group disabled:opacity-60">
        {status === "sending" ? "Sending…" : type === "distributor" ? "Submit application" : "Send enquiry"}{" "}
        <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}


/**
 * One row per product, each with its own pack size and quantity. The first row has an
 * "add" button; every extra row can be removed. A missing product, pack size or quantity
 * gets the red outline plus a short message under the field.
 */
function ProductPicker({
  products,
  rows,
  errors,
  hasCatalogue,
  full,
  onAdd,
  onRemove,
  onChange,
  onClearError,
}: {
  products: EnquiryProduct[];
  rows: ProductRow[];
  errors: Errors;
  hasCatalogue: boolean;
  full: boolean;
  onAdd: () => void;
  onRemove: (key: number) => void;
  onChange: (key: number, patch: Partial<ProductRow>) => void;
  onClearError: (key: string) => void;
}) {
  const addButton = (
    <button
      type="button"
      onClick={onAdd}
      disabled={full}
      aria-label="Add another product"
      title={full ? `Maximum ${MAX_PRODUCT_ROWS} product entries` : "Add another product"}
      className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-forest/20 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-forest/20 disabled:hover:bg-transparent disabled:hover:text-forest"
    >
      <PlusIcon width={16} height={16} />
    </button>
  );

  const removeButton = (key: number, index: number) => (
    <button
      type="button"
      onClick={() => onRemove(key)}
      aria-label={`Remove product ${index + 1}`}
      className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink/45 transition-colors hover:bg-forest/5 hover:text-forest"
    >
      <CloseIcon width={16} height={16} />
    </button>
  );

  // Catalogue not loaded (or empty) — keep plain text fields so the enquiry still goes through.
  if (!hasCatalogue) {
    return (
      <div className="space-y-3">
        {rows.map(({ key, productId, quantity }, i) => (
          <div key={key} className="flex items-start gap-2 sm:gap-3">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor={`enq-product-${key}`} className={label}>Products Interested</label>
                <input
                  id={`enq-product-${key}`}
                  type="text"
                  value={productId}
                  placeholder="Product name"
                  aria-label={i === 0 ? undefined : `Product ${i + 1}`}
                  aria-invalid={Boolean(errors[`product-${key}`]) || undefined}
                  onChange={(event) => {
                    onChange(key, { productId: event.target.value });
                    onClearError(`product-${key}`);
                  }}
                  className={`${field} ${errors[`product-${key}`] ? invalidField : ""}`}
                />
                <FieldError message={errors[`product-${key}`]} />
              </div>
              <div className="min-w-0">
                <label htmlFor={`enq-qty-${key}`} className={label}>Estimated Quantity</label>
                <input
                  id={`enq-qty-${key}`}
                  type="text"
                  value={quantity}
                  placeholder="e.g., 500 kg, 1000 units"
                  aria-label={i === 0 ? undefined : `Quantity for product ${i + 1}`}
                  aria-invalid={Boolean(errors[`quantity-${key}`]) || undefined}
                  onChange={(event) => {
                    onChange(key, { quantity: event.target.value });
                    onClearError(`quantity-${key}`);
                  }}
                  className={`${field} ${errors[`quantity-${key}`] ? invalidField : ""}`}
                />
                <FieldError message={errors[`quantity-${key}`]} />
              </div>
            </div>
            {i === 0 ? addButton : removeButton(key, i)}
          </div>
        ))}
        {full && <p className="text-xs text-ink/55">Maximum {MAX_PRODUCT_ROWS} product entries per enquiry.</p>}
      </div>
    );
  }

  return (
    <div>
      {/* Column headings line up with the fields from sm up; on phones each row labels itself. */}
      <div className="mb-2 hidden gap-2 sm:flex sm:gap-3">
        <div className="grid flex-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <span className="block text-sm font-semibold text-forest">Product</span>
          <span className="block text-sm font-semibold text-forest">Pack Size</span>
          <span className="block text-sm font-semibold text-forest">Quantity</span>
        </div>
        <span aria-hidden="true" className="w-11 shrink-0" />
      </div>

      <div className="space-y-3 sm:space-y-2">
        {rows.map(({ key, productId, packSize, quantity }, i) => {
          const selectedProduct = products.find((product) => product.id === productId);
          const packSizes = selectedProduct ? packSizesOf(selectedProduct).filter(Boolean) : [];
          const packSizePlaceholder = !selectedProduct
            ? "Select a product first"
            : packSizes.length
              ? "Select pack size"
              : "No pack sizes available";
          return (
            <div key={key} className="flex items-start gap-2 sm:gap-3">
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="min-w-0">
                  <label htmlFor={`enq-product-${key}`} className="mb-1.5 block text-sm font-semibold text-forest sm:hidden">
                    Product
                  </label>
                  <div className="relative min-w-0">
                    <select
                      id={`enq-product-${key}`}
                      value={productId}
                      aria-label={i === 0 ? undefined : `Product ${i + 1}`}
                      aria-invalid={Boolean(errors[`product-${key}`]) || undefined}
                      onChange={(event) => {
                        onChange(key, { productId: event.target.value, packSize: "" });
                        onClearError(`product-${key}`);
                        onClearError(`packSize-${key}`);
                      }}
                      className={`${field} cursor-pointer appearance-none pr-10 [&>option]:text-ink ${
                        errors[`product-${key}`] ? invalidField : ""
                      }`}
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon width={16} height={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/50" />
                  </div>
                  <FieldError message={errors[`product-${key}`]} />
                </div>

                <div className="min-w-0">
                  <label htmlFor={`enq-pack-${key}`} className="mb-1.5 block text-sm font-semibold text-forest sm:hidden">
                    Pack Size
                  </label>
                  <div className="relative min-w-0">
                    <select
                      id={`enq-pack-${key}`}
                      value={packSize}
                      aria-label={i === 0 ? undefined : `Pack size for product ${i + 1}`}
                      aria-invalid={Boolean(errors[`packSize-${key}`]) || undefined}
                      onChange={(event) => {
                        onChange(key, { packSize: event.target.value });
                        onClearError(`packSize-${key}`);
                      }}
                      className={`${field} cursor-pointer appearance-none pr-10 [&>option]:text-ink ${
                        errors[`packSize-${key}`] ? invalidField : ""
                      }`}
                    >
                      <option value="">{packSizePlaceholder}</option>
                      {packSizes.map((size) => (
                        <option key={`${selectedProduct?.id}-${size}`} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <ChevronIcon width={16} height={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/50" />
                  </div>
                  <FieldError message={errors[`packSize-${key}`]} />
                </div>

                <div className="min-w-0">
                  <label htmlFor={`enq-qty-${key}`} className="mb-1.5 block text-sm font-semibold text-forest sm:hidden">
                    Quantity
                  </label>
                  <input
                    id={`enq-qty-${key}`}
                    type="text"
                    value={quantity}
                    placeholder="e.g., 500"
                    aria-label={i === 0 ? undefined : `Quantity for product ${i + 1}`}
                    aria-invalid={Boolean(errors[`quantity-${key}`]) || undefined}
                    onChange={(event) => {
                      onChange(key, { quantity: event.target.value });
                      onClearError(`quantity-${key}`);
                    }}
                    className={`${field} ${errors[`quantity-${key}`] ? invalidField : ""}`}
                  />
                  <FieldError message={errors[`quantity-${key}`]} />
                </div>
              </div>
              {i === 0 ? addButton : removeButton(key, i)}
            </div>
          );
        })}
      </div>
      {full && <p className="mt-2 text-xs text-ink/55">Maximum {MAX_PRODUCT_ROWS} product entries per enquiry.</p>}
    </div>
  );
}

