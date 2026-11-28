import { HttpError, dbError, handle, json, readJson } from "@/lib/server/http";
import { bearer } from "@/lib/server/guard";
import { str } from "@/lib/server/model";
import { anonClient, supabaseConfigured, serviceClient, serviceConfigured } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

const TYPES = {
  business: { label: "Business enquiry", item: "Business enquiry" },
  distributor: { label: "Distributor application", item: "Distributor application" },
  export: { label: "Export enquiry", item: "Export enquiry" },
} as const;
type EnquiryType = keyof typeof TYPES;
const MAX_ENQUIRY_ITEMS = 20;

const isType = (v: unknown): v is EnquiryType => typeof v === "string" && v in TYPES;

/**
 * Public: a Business / Distributors / Export page enquiry. Saved as an order with
 * source 'enquiry' (kind 'bulk', one ₹0 line, details in the note) so it appears in
 * Admin → Orders. No stock moves and no payment is involved.
 */
export const POST = handle(async (req) => {
  const body = await readJson(req, 20_000);
  // Honeypot: bots fill the hidden "website" field; pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });

  if (!serviceConfigured) throw new HttpError(503, "Enquiries aren't set up yet. Please email us instead.");
  if (!isType(body.type)) throw new HttpError(400, "Unknown enquiry type.");
  const t = TYPES[body.type];

  // Enquiries are public. When a session is sent, link the enquiry to the customer's account.
  const channel = body.type === "export" ? "export" : body.type === "distributor" ? "distributors" : "ecommerce";
  let userId: string | null = null;
  const token = bearer(req);
  if (token && supabaseConfigured) {
    const { data } = await anonClient().auth.getUser(token);
    userId = data.user?.id ?? null;
  }
  const company = str(body.company, "Company name", 120, { required: true });
  const name = str(body.name, "Contact person", 120, { required: true });
  const phone = str(body.phone, "Contact", 20, { required: true });
  if (phone.replace(/\D/g, "").length < 10) throw new HttpError(400, "Enter a valid phone number (at least 10 digits).");
  const email = str(body.email, "Email", 160, { required: true }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");

  // Distributors and exports give a full destination. It is stored on the order itself
  // (ship_country / ship_state / ship_city / ship_pincode) so Admin → Orders shows it properly.
  const needsLocation = body.type !== "business";
  const country = needsLocation ? str(body.country, "Country", 80, { required: true }) : "";
  const countryCode = needsLocation ? str(body.countryCode, "Country code", 2).toUpperCase() : "";
  const state = needsLocation ? str(body.state, "State / province", 80, { required: true }) : "";
  const city = needsLocation ? str(body.city, "City", 80, { required: true }) : "";
  const pincode = needsLocation ? str(body.pincode, "Postal / PIN code", 12, { required: true }) : "";
  if (pincode && !/^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(pincode)) {
    throw new HttpError(400, "Enter a valid postal / PIN code.");
  }
  if (pincode && (countryCode === "IN" || country === "India") && !/^[1-9]\d{5}$/.test(pincode)) {
    throw new HttpError(400, "Enter a valid 6-digit PIN code.");
  }
  const place = [city, state].filter(Boolean).join(", ");
  const address = place + (pincode ? `${place ? " – " : ""}${pincode}` : "");

  // Type-specific free-text details, kept inside the order's 500-char note. Products, pack
  // sizes and quantities become order items, so they no longer need room in the note.
  const extra = (field: string, label: string, max: number, required = false) => {
    const v = str(body[field], label, max, { required });
    return v ? `${label}: ${v}` : "";
  };
  const lines =
    body.type === "business"
      ? [extra("message", "Requirements", 300, true)]
      : [
          extra(
            "message",
            body.type === "distributor" ? "Additional information" : "Additional requirements",
            300,
          ),
        ];
  const note = [`${t.label} · ${company}`, ...lines].filter(Boolean).join("\n").slice(0, 500);

  // Parse product details for order items
  const rawItems = Array.isArray(body.items) ? body.items : null;
  if (rawItems && rawItems.length > MAX_ENQUIRY_ITEMS) {
    throw new HttpError(400, `An enquiry can include up to ${MAX_ENQUIRY_ITEMS} product entries.`);
  }
  const productNames = typeof body.products === "string" ? body.products.split(", ") : [];
  const packSizes = typeof body.packSizes === "string" ? body.packSizes.split(", ") : [];
  const quantities = typeof body.quantity === "string" ? body.quantity.split("; ") : [];
  const enquiryItems = (rawItems
    ? rawItems.map((item, index) => {
        if (typeof item !== "object" || item === null || Array.isArray(item)) throw new HttpError(400, `Product ${index + 1} isn't valid.`);
        const values = item as Record<string, unknown>;
        return {
          name: str(values.product, `Product ${index + 1}`, 120, { required: true }),
          packSize: str(values.packSize, `Pack size for product ${index + 1}`, 40),
          quantityText: str(values.quantity, `Quantity for product ${index + 1}`, 300, { required: true }),
        };
      })
    : productNames.filter((name) => name.trim()).map((name, i) => ({
        name: name.trim(),
        packSize: packSizes[i]?.trim() ?? "",
        quantityText: quantities[i] ?? "",
      })))
    .map(({ name, packSize, quantityText }) => {
    const numericQuantity = Number(quantityText.replace(/,/g, "").match(/^\s*(\d+)/)?.[1]);
    return {
      product_id: null,
      name,
      pack_size: packSize,
      qty: Number.isSafeInteger(numericQuantity) && numericQuantity > 0 ? numericQuantity : 1,
      price: 0,
    };
  });

  // Distributor and export enquiries must name at least one product (the form also checks this
  // and outlines the row in red, but the API must not depend on the browser).
  if (body.type !== "business" && enquiryItems.length === 0) {
    throw new HttpError(400, "Select at least one product.");
  }

  const sb = serviceClient();

  // Reuse the signed-in customer's own record first: My orders reads orders through customers.user_id.
  let customerId: string | null = null;
  if (userId) {
    const { data } = await sb.from("customers").select("id").eq("user_id", userId).maybeSingle();
    customerId = data?.id ?? null;
  }
  // Otherwise reuse the customer with this email (or the same name + phone), else add a new one — same rule as admin orders.
  if (!customerId && email) {
    const { data } = await sb.from("customers").select("id, user_id").ilike("email", email).order("created_at").limit(1).maybeSingle();
    // Never attach an enquiry to a customer record that belongs to a different account.
    if (data && (!data.user_id || data.user_id === userId)) {
      customerId = data.id;
      // A walk-in record for this email: claim it for the signed-in account so the enquiry shows in My orders.
      if (userId && !data.user_id) {
        const { error: claimErr } = await sb.from("customers").update({ user_id: userId }).eq("id", data.id).is("user_id", null);
        if (claimErr) customerId = null;
      }
    }
  }
  if (!customerId) {
    const { data } = await sb
      .from("customers")
      .select("id, phone, user_id")
      .ilike("name", company)
      .order("created_at")
      .limit(5);
    const phoneKey = phone.replace(/\D/g, "").slice(-10);
    customerId =
      (data ?? []).find((c) => {
        if (c.user_id && c.user_id !== userId) return false;
        const cp = String(c.phone ?? "").replace(/\D/g, "").slice(-10);
        return cp === phoneKey;
      })?.id ?? null;
  }
  if (!customerId) {
    const { data, error } = await sb.from("customers").insert({ name: company, phone, email, user_id: userId }).select("id").single();
    if (error) throw dbError(error);
    customerId = data.id as string;
  }

  const insertOrder = (withChannel: boolean, withCountry: boolean) =>
    sb
      .from("orders")
      .insert({
        customer_id: customerId,
        status: "New",
        source: "enquiry",
        kind: "bulk",
        ...(withChannel ? { channel } : {}),
        address,
        email,
        ship_name: name,
        ship_phone: phone,
        ship_city: city,
        ship_state: state,
        ship_pincode: pincode,
        ...(withCountry ? { ship_country: country } : {}),
        business_name: company,
        note,
        shipping: 0,
        payment_mode: "pending",
        method: "Other",
        payment_status: "pending",
      })
      .select("number")
      .single();

  // ship_country and channel each arrive with their own migration; without them the enquiry still saves
  // (just without that one detail) instead of failing.
  let orderRes = await insertOrder(true, true);
  if (orderRes.error && ["42703", "PGRST204"].includes(orderRes.error.code ?? "")) {
    orderRes = await insertOrder(true, false);
    if (orderRes.error && ["42703", "PGRST204"].includes(orderRes.error.code ?? "")) {
      orderRes = await insertOrder(false, false);
    }
  }
  if (orderRes.error) throw dbError(orderRes.error);
  const number = Number(orderRes.data.number);

  // Insert order items for each product in the enquiry
  const { error: iErr } = await sb.from("order_items").insert(
    enquiryItems.map((item) => ({ order_number: number, ...item }))
  );
  if (iErr) throw dbError(iErr);
  const { error: eErr } = await sb.from("order_events").insert({ order_number: number, label: "Enquiry received", note: "Website enquiry — no payment or stock involved" });
  if (eErr) throw dbError(eErr);

  return json({ ok: true, number }, 201);
});
