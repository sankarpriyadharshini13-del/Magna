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

  // Enquiries are public — signing in is optional. When a session is sent, remember who sent it so
  // the enquiry is attached to their customer record and shows up in My orders, like a normal order.
  // Distributor and export enquiries, however, need a signed-in account.
  const channel = body.type === "export" ? "export" : body.type === "distributor" ? "distributors" : "ecommerce";
  let userId: string | null = null;
  const token = bearer(req);
  if (token && supabaseConfigured) {
    const { data } = await anonClient().auth.getUser(token);
    userId = data.user?.id ?? null;
  }
  if ((body.type === "distributor" || body.type === "export") && !userId) {
    throw new HttpError(401, "Please sign in to submit this enquiry.");
  }

  const company = str(body.company, "Company name", 120, { required: true });
  const name = str(body.name, "Contact person", 120, { required: true });
  const phone = str(body.phone, "Phone", 20, { required: true });
  if (phone.replace(/\D/g, "").length < 10) throw new HttpError(400, "Enter a valid phone number (at least 10 digits).");
  const email = str(body.email, "Email", 160).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Enter a valid email address.");

  // Type-specific details, kept inside the order's 500-char note.
  const extra = (field: string, label: string, max: number, required = false) => {
    const v = str(body[field], label, max, { required });
    return v ? `${label}: ${v}` : "";
  };
  const location = body.type === "export" ? str(body.location, "Location", 120, { required: true }) : "";
  const lines =
    body.type === "business"
      ? [extra("message", "Requirements", 300, true)]
      : body.type === "distributor"
        ? [extra("region", "Region", 120, true), extra("current", "Current distribution", 300, true), extra("message", "Note", 300)]
        : [
            extra("country", "Country", 80, true),
            `Location: ${location}`,
            extra("products", "Products interested", 200, true),
            extra("packSizes", "Pack sizes", 200),
            extra("quantity", "Estimated quantity", 300, true),
            extra("message", "Additional requirements", 300),
          ];
  const note = [`${t.label} · ${company}`, ...lines].filter(Boolean).join("\n").slice(0, 500);

  // Parse product details for order items
  const productNames = (body.products as string)?.split(", ") ?? [];
  const packSizes = (body.packSizes as string)?.split(", ") ?? [];
  const quantities = (body.quantity as string)?.split("; ") ?? [];
  const enquiryItems = productNames.map((name, i) => ({
    product_id: null,
    name: name.trim(),
    pack_size: packSizes[i]?.trim() ?? "",
    qty: 1,
    price: 0,
  }));

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
    if (data && (!userId || !data.user_id || data.user_id === userId)) {
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
        if (userId && c.user_id && c.user_id !== userId) return false;
        const cp = String(c.phone ?? "").replace(/\D/g, "").slice(-10);
        return cp === phoneKey;
      })?.id ?? null;
  }
  if (!customerId) {
    const { data, error } = await sb.from("customers").insert({ name: company, phone, email, user_id: userId }).select("id").single();
    if (error) throw dbError(error);
    customerId = data.id as string;
  }

  const insertOrder = (withChannel: boolean) =>
    sb
      .from("orders")
      .insert({
        customer_id: customerId,
        status: "New",
        source: "enquiry",
        kind: "bulk",
        ...(withChannel ? { channel } : {}),
        address: "",
        email,
        ship_name: name,
        ship_phone: phone,
        ship_city: location,
        business_name: company,
        note,
        shipping: 0,
        payment_mode: "pending",
        method: "Other",
        payment_status: "pending",
      })
      .select("number")
      .single();

  // The channel column arrives with its own migration; without it the enquiry still saves fine.
  let orderRes = await insertOrder(true);
  if (orderRes.error && ["42703", "PGRST204"].includes(orderRes.error.code ?? "")) {
    orderRes = await insertOrder(false);
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
