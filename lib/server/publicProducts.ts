import "server-only";
import { guidePackFor } from "@/data/dietary";
import { products as fallbackProducts, getProduct as fallbackProduct } from "@/data/products";
import { packHasContent } from "@/lib/pack";
import type { Product, ProductPack } from "@/types";
import { anonClient, supabaseConfigured } from "./supabase";

const BASE_COLUMNS = ["id", "name", "price", "stock", "pack_size", "tag", "description", "long_description", "images", "created_at"];
/** Columns that arrive with later migrations. Missing ones are dropped until the SQL is run. */
const OPTIONAL_COLUMNS = [
  "original_price",
  "pack_enabled",
  "pack_ingredients",
  "pack_benefits",
  "pack_who_can_eat",
  "pack_who_should_be_careful",
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

/** Saved copy when the admin wrote any, otherwise the built-in guide (unless the section was switched off). */
function packOf(r: any): ProductPack | null {
  const saved: ProductPack | null =
    r.pack_enabled === undefined && r.pack_ingredients === undefined
      ? null
      : {
          enabled: r.pack_enabled ?? true,
          ingredients: r.pack_ingredients ?? "",
          benefits: r.pack_benefits ?? "",
          whoCanEat: r.pack_who_can_eat ?? "",
          whoShouldBeCareful: r.pack_who_should_be_careful ?? "",
        };
  if (saved && packHasContent(saved)) return saved;
  const fallback = guidePackFor(r.id);
  if (!fallback) return saved;
  return { ...fallback, enabled: saved?.enabled ?? true };
}

function toProduct(r: any): Product {
  const image: string | null = r.images?.[0] ?? null;
  return {
    id: r.id,
    slug: r.id,
    name: r.name,
    tag: r.tag || undefined,
    description: r.description || "",
    longDescription: r.long_description || r.description || "",
    packSize: r.pack_size || null,
    priceInr: r.price ?? null,
    originalPriceInr: r.price != null && r.original_price != null && r.original_price > r.price ? r.original_price : null,
    image,
    images: r.images ?? [],
    imageAlt: r.name,
    featured: true,
    stock: r.stock ?? 0,
    pack: packOf(r),
  };
}

/**
 * Products shown on the storefront: only rows with visible = true (enforced by row-level security as
 * well). Falls back to the bundled catalogue only when the database can't be queried at all.
 */
export async function getPublicProducts(): Promise<Product[]> {
  if (!supabaseConfigured) return fallbackProducts;
  try {
    const data = (await selectRows((cols) =>
      anonClient().from("products").select(cols).eq("visible", true).order("created_at", { ascending: true }).order("name", { ascending: true }),
    )) as any[] | null;
    return (data ?? []).map(toProduct);
  } catch (e) {
    console.error("[products] falling back to the bundled catalogue:", (e as { message?: string })?.message);
    return fallbackProducts;
  }
}

export async function getPublicProduct(slug: string): Promise<Product | null> {
  if (!supabaseConfigured) return fallbackProduct(slug) ?? null;
  try {
    const data = (await selectRows((cols) =>
      anonClient().from("products").select(cols).eq("id", slug).eq("visible", true).maybeSingle(),
    )) as any | null;
    return data ? toProduct(data) : null;
  } catch (e) {
    console.error("[products] falling back to the bundled catalogue:", (e as { message?: string })?.message);
    return fallbackProduct(slug) ?? null;
  }
}
