import { dbError, handle, HttpError, json } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";
import {
  mapCustomer,
  mapInvite,
  mapMember,
  mapOrder,
  mapProduct,
  mapRefund,
  mapStockLog,
  mergeSettings,
} from "@/lib/server/model";
import type { AdminData } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

const sections = ["all", "dashboard", "orders", "products", "barcodes", "customers", "payments", "reviews", "settings"] as const;
type DataSection = (typeof sections)[number];

/** Read only the datasets needed by the requested admin screen. */
export const GET = handle(async (req) => {
  const a = await requireAdmin(req);
  const c = a.client;
  const requestedSection = new URL(req.url).searchParams.get("section") ?? "all";
  if (!sections.includes(requestedSection as DataSection)) throw new HttpError(400, "Unknown admin data section.");
  const section = requestedSection as DataSection;
  const all = section === "all";
  const needs = (name: string) => all || section === name || (
    (section === "dashboard" && ["products", "orders", "customers"].includes(name)) ||
    (section === "orders" && ["orders", "customers"].includes(name)) ||
    (section === "products" && ["products", "stockLog"].includes(name)) ||
    (section === "barcodes" && ["products", "orders", "customers"].includes(name)) ||
    (section === "customers" && ["orders", "customers", "members", "invites"].includes(name)) ||
    (section === "payments" && ["orders", "customers", "refunds"].includes(name)) ||
    (section === "settings" && ["members", "invites"].includes(name))
  );
  const selectProducts = (columns: string) =>
    c.from("products").select(columns).order("created_at", { ascending: true }).order("name", { ascending: true });
  const loadProducts = async () => {
    let result = await selectProducts(
      "id,name,sku,price,original_price,pack_prices,stock,pack_size,pack_sizes,pack_stock,channel,show_ecommerce,show_distributors,show_export,sort_order,tag,description,barcode,visible,images,color,pack_enabled,pack_ingredients,pack_benefits,pack_who_can_eat,pack_who_should_be_careful,pack_customized",
    );
    if (result.error && ["42703", "PGRST204"].includes(result.error.code ?? "")) {
      result = await selectProducts("*");
    }
    return result;
  };
  const loadCustomers = async () => {
    const withNotes = all || section === "customers";
    let result = withNotes
      ? await c.from("customers").select("id,name,phone,email,area,city,state,since,user_id,customer_notes(id,text,at)").limit(5000)
      : await c.from("customers").select("id,name,phone,email,area,city,state,since,user_id").limit(5000);
    if (result.error && ["42703", "PGRST204"].includes(result.error.code ?? "")) {
      result = withNotes
        ? await c.from("customers").select("*, customer_notes(*)").limit(5000)
        : await c.from("customers").select("*").limit(5000);
    }
    return result;
  };
  const loadOrders = async () => {
    let result = await c.from("orders")
      .select("number,placed_at,customer_id,shipping,method,status,address,payment_id,payment_status,payment_refunded,email,ship_name,ship_phone,ship_city,ship_state,ship_pincode,ship_country,delivered_at,kind,source,business_name,gst_number,note,payment_mode,amount_paid,discount,delivery_charge,show_delivery_charge,boxes,total_weight,transporter,tracking_number,dispatch_date,tracking_status,tracking_url,cancel_reason,channel,order_items(product_id,name,pack_size,qty,price),order_events(label,note,at)")
      .order("number", { ascending: false })
      .limit(1000);
    if (result.error && ["42703", "PGRST204"].includes(result.error.code ?? "")) {
      result = await c.from("orders").select("*, order_items(*), order_events(label,note,at)").order("number", { ascending: false }).limit(1000);
    }
    return result;
  };
  const empty = { data: null, error: null };
  const [products, orders, customers, refunds, stock, settings, members, invites, reviews] = await Promise.all([
    needs("products") ? loadProducts() : Promise.resolve(empty),
    needs("orders") ? loadOrders() : Promise.resolve(empty),
    needs("customers") ? loadCustomers() : Promise.resolve(empty),
    needs("refunds") ? c.from("refunds").select("*").order("at", { ascending: false }).limit(500) : Promise.resolve(empty),
    needs("stockLog") ? c.from("stock_log").select("*").order("at", { ascending: false }).limit(200) : Promise.resolve(empty),
    c.from("app_settings").select("data").eq("id", 1).maybeSingle(),
    needs("members") ? c.from("admin_members").select("*").order("created_at", { ascending: true }) : Promise.resolve(empty),
    needs("invites") ? c.from("admin_invites").select("*").order("created_at", { ascending: false }).limit(100) : Promise.resolve(empty),
    needs("reviews") ? c.from("reviews").select("*, products(name)").order("created_at", { ascending: false }).limit(1000) : Promise.resolve(empty),
  ]);
  // Reviews arrive with their own migration; until it's applied the panel simply shows none.
  const reviewsMissing = needs("reviews") && ["PGRST205", "42P01", "PGRST200"].includes(reviews.error?.code ?? "");
  const results = [
    ...(needs("products") ? [products] : []),
    ...(needs("orders") ? [orders] : []),
    ...(needs("customers") ? [customers] : []),
    ...(needs("refunds") ? [refunds] : []),
    ...(needs("stockLog") ? [stock] : []),
    settings,
    ...(needs("members") ? [members] : []),
    ...(needs("invites") ? [invites] : []),
    ...(needs("reviews") && !reviewsMissing ? [reviews] : []),
  ];
  for (const r of results) if (r.error) throw dbError(r.error);
  // The owner, invited admins and pending invitees are staff, not customers.
  const teamIds = new Set((members.data ?? []).map((m) => m.user_id as string));
  const teamEmails = new Set(
    [
      ...(members.data ?? []).map((m) => m.email as string),
      ...(invites.data ?? []).map((i) => mapInvite(i)).filter((i) => i.status === "pending" || i.status === "accepted").map((i) => i.email),
    ].map((e) => (e ?? "").toLowerCase()),
  );
  const data: Partial<AdminData> = {
    me: { userId: a.userId, email: a.email, name: a.name, role: a.role },
    settings: mergeSettings(settings.data?.data),
  };
  if (needs("reviews")) data.reviews = (reviewsMissing ? [] : reviews.data ?? []).map((r) => ({
      id: r.id,
      orderNumber: Number(r.order_number),
      customerName: r.customer_name || "Customer",
      rating: r.rating,
      message: r.message ?? "",
      createdAt: r.created_at,
      published: Boolean(r.published),
      products: r.products?.name || "Unknown product",
    }));
  if (needs("members")) data.members = (members.data ?? []).map(mapMember);
  if (needs("invites")) data.invites = (invites.data ?? []).map((r) => mapInvite(r));
  if (needs("products")) data.products = (products.data ?? []).map(mapProduct);
  if (needs("orders")) data.orders = (orders.data ?? []).map(mapOrder);
  if (needs("customers")) data.customers = (customers.data ?? []).map((r) => ({
      ...mapCustomer(r),
      team: Boolean(r.user_id && teamIds.has(r.user_id)) || teamEmails.has(String(r.email ?? "").toLowerCase()),
    }));
  if (needs("refunds")) data.refunds = (refunds.data ?? []).map(mapRefund);
  if (needs("stockLog")) data.stockLog = (stock.data ?? []).map(mapStockLog);
  return json(data);
});
