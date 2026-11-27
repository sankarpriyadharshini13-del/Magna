import "server-only";
import { cleanPackSizes } from "@/lib/pack";
import type { Product, ProductChannel, ProductPack } from "@/types";
import { anonClient, supabaseConfigured } from "./supabase";

const BASE_COLUMNS = ["id", "name", "price", "stock", "pack_size", "tag", "description", "long_description", "images", "created_at"];
/** Columns that arrive with later migrations. Missing ones are dropped until the SQL is run. */
const OPTIONAL_COLUMNS = [
  "original_price",
  "pack_prices",
  "pack_sizes",
  "channel",
  "pack_enabled",
  "pack_ingredients",
  "pack_benefits",
  "pack_who_can_eat",
  "pack_who_should_be_careful",
  "pack_customized",
  "sort_order",
];
const missingColumn = (e: { code?: string } | null) => e?.code === "42703" || e?.code === "PGRST204";

interface QueryResult {
  data: unknown;
  error: { code?: string; message?: string } | null;
}

/** Selects every optional column, retrying without the ones whose migration hasn't been applied. */
async function selectRows(query: (cols: string) => PromiseLike<QueryResult>): Promise<unknown> {
  let cols = [...BASE_COLUMNS, ...OPTIONAL_COLUMNS];
  for (;;) {
    const { data, error } = await query(cols.join(", "));
    if (!error) return data;
    if (!missingColumn(error) || cols.length === BASE_COLUMNS.length) throw error;
    const named = OPTIONAL_COLUMNS.filter((c) => cols.includes(c) && (error.message ?? "").includes(c));
    cols = named.length ? cols.filter((c) => !named.includes(c)) : [...BASE_COLUMNS];
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Admin-saved "Know your pack" copy. Nothing is bundled with the code: the block appears only with
 * the text the admin saved in Admin → Products & Stock.
 */
function packOf(r: any): ProductPack | null {
  // Every pack column arrives with its own migration; if none of them is present there is no block.
  if (r.pack_enabled === undefined && r.pack_ingredients === undefined && r.pack_benefits === undefined) return null;
  return {
    enabled: r.pack_enabled ?? true,
    ingredients: r.pack_ingredients ?? "",
    benefits: r.pack_benefits ?? "",
    whoCanEat: r.pack_who_can_eat ?? "",
    whoShouldBeCareful: r.pack_who_should_be_careful ?? "",
    customized: r.pack_customized === true,
  };
}

function toProduct(r: any): Product {
  const image: string | null = r.images?.[0] ?? null;
  const packSizes = cleanPackSizes(r.pack_sizes, r.pack_size ?? "");
  const savedPackPrices = r.pack_prices && typeof r.pack_prices === "object" && !Array.isArray(r.pack_prices) ? r.pack_prices : {};
  const packPrices = Object.fromEntries(
    (packSizes.length ? packSizes : [""]).map((size) => {
      const saved = savedPackPrices[size];
      return [
        size,
        saved && typeof saved === "object"
          ? { price: saved.price ?? null, originalPrice: saved.originalPrice ?? null }
          : { price: r.price ?? null, originalPrice: r.original_price ?? null },
      ];
    }),
  );
  const primaryPrice = packPrices[packSizes[0] ?? ""] ?? { price: r.price ?? null, originalPrice: r.original_price ?? null };
  const channel: ProductChannel = r.channel === "export" ? "export" : "ecommerce";
  return {
    id: r.id,
    slug: r.id,
    name: r.name,
    tag: r.tag || undefined,
    description: r.description || "",
    longDescription: r.long_description || r.description || "",
    packSize: packSizes[0] ?? null,
    packSizes,
    channel,
    priceInr: primaryPrice.price,
    originalPriceInr:
      primaryPrice.price != null && primaryPrice.originalPrice != null && primaryPrice.originalPrice > primaryPrice.price
        ? primaryPrice.originalPrice
        : null,
    packPrices,
    image,
    images: r.images ?? [],
    imageAlt: r.name,
    featured: true,
    stock: r.stock ?? 0,
    pack: packOf(r),
  };
}

/**
 * Products shown on the storefront: only the rows the admin has made visible (`visible = true`, also
 * enforced by row-level security). There is no bundled catalogue — Admin → Products & Stock is the only
 * place a product (and its details) is created — so an unconfigured or unreachable database simply
 * yields an empty catalogue instead of stale hardcoded products.
 */
export async function getPublicProducts(): Promise<Product[]> {
  if (!supabaseConfigured) {
    console.warn("[products] Supabase is not configured — add products in Admin → Products & Stock.");
    return [];
  }
  try {
    const data = (await selectRows((cols) =>
      anonClient().from("products").select(cols).eq("visible", true).order("created_at", { ascending: true }).order("name", { ascending: true }),
    )) as any[] | null;
    const rows = data ?? [];
    // Products the admin has positioned (sort_order ≥ 1) lead the catalogue; the rest keep their
    // created/name order behind them until the admin moves them in Admin → Products & Stock.
    const positioned = rows.filter((r) => (r.sort_order ?? 0) > 0).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const unpositioned = rows.filter((r) => (r.sort_order ?? 0) <= 0);
    return [...positioned, ...unpositioned].map(toProduct);
  } catch (e) {
    console.error("[products] catalogue unavailable:", (e as { message?: string })?.message);
    return [];
  }
}

export async function getPublicProduct(slug: string): Promise<Product | null> {
  if (!supabaseConfigured) {
    console.warn("[products] Supabase is not configured — add products in Admin → Products & Stock.");
    return null;
  }
  try {
    const data = (await selectRows((cols) =>
      anonClient().from("products").select(cols).eq("id", slug).eq("visible", true).maybeSingle(),
    )) as any | null;
    return data ? toProduct(data) : null;
  } catch (e) {
    console.error("[products] product unavailable:", (e as { message?: string })?.message);
    return null;
  }
}
