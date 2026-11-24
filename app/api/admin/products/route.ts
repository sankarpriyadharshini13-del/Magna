import { HttpError, dbError, handle, json, readJson } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/guard";
import { mapProduct, nextBarcode, parseProduct, skuFor, slugify } from "@/lib/server/model";
import { PRODUCT_COLORS } from "@/lib/admin/defaults";
import { packHasContent } from "@/lib/pack";

export const dynamic = "force-dynamic";

/** Create (no id) or update (with id) a product. Validated here, saved to the database. */
export const POST = handle(async (req) => {
  const { client } = await requireAdmin(req);
  const input = parseProduct(await readJson(req));

  let existing: Record<string, unknown> | null = null;
  if (input.id) {
    const { data, error } = await client.from("products").select("*").eq("id", input.id).maybeSingle();
    if (error) throw dbError(error);
    if (!data) throw new HttpError(404, "That product no longer exists.");
    existing = data;
  }

  const { data: all, error: allErr } = await client.from("products").select("id, barcode");
  if (allErr) throw dbError(allErr);
  const known = (all ?? []) as { id: string; barcode: string | null }[];

  let id = input.id;
  if (!id) {
    const base = slugify(input.name);
    const taken = new Set(known.map((p) => p.id));
    id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  }

  const row: Record<string, unknown> = {
    id,
    name: input.name,
    sku: skuFor(input.name, input.packSize, (existing?.sku as string) ?? ""),
    price: input.price,
    original_price: input.originalPrice,
    stock: input.stock,
    pack_size: input.packSize,
    pack_sizes: input.packSizes,
    channel: input.channel,
    tag: input.tag,
    description: input.description,
    visible: input.visible,
    images: input.images,
    pack_enabled: input.pack.enabled,
    pack_ingredients: input.pack.ingredients,
    pack_benefits: input.pack.benefits,
    pack_who_can_eat: input.pack.whoCanEat,
    pack_who_should_be_careful: input.pack.whoShouldBeCareful,
    // Sticky once set: quick actions (show/hide) never clear the admin's own copy.
    pack_customized: Boolean(existing?.pack_customized) || input.pack.customized === true,
  };

  /** Columns that arrived with their own migration. If one is missing, save the rest without it. */
  const OPTIONAL_COLUMNS = [
    "original_price",
    "pack_sizes",
    "channel",
    "pack_enabled",
    "pack_ingredients",
    "pack_benefits",
    "pack_who_can_eat",
    "pack_who_should_be_careful",
    "pack_customized",
  ];
  const packContent = packHasContent(input.pack);

  let saved: Record<string, unknown> | null = null;
  for (let attempt = 0; attempt < 3 && !saved; attempt++) {
    const barcode = (existing?.barcode as string | null) || nextBarcode(known.map((p) => p.barcode));
    const q = existing
      ? client
          .from("products")
          .update({
            ...row,
            barcode,
            // The storefront page falls back to `description` once the original long text is superseded.
            long_description: existing.description === input.description ? existing.long_description : "",
          })
          .eq("id", id)
      : client.from("products").insert({ ...row, barcode, color: PRODUCT_COLORS[known.length % PRODUCT_COLORS.length] });
    const { data, error } = await q.select("*").single();
    if (!error) {
      saved = data;
      break;
    }
    // A migration hasn't been applied yet: drop the missing optional columns and try again.
    if (["PGRST204", "42703"].includes(error.code ?? "")) {
      const named = OPTIONAL_COLUMNS.filter((c) => c in row && (error.message ?? "").includes(c));
      const missing = named.length ? named : OPTIONAL_COLUMNS.filter((c) => c in row);
      if (missing.length) {
        if (missing.includes("original_price") && input.originalPrice != null)
          throw new HttpError(503, "To save an original price, run supabase/migrations/20261029000000_original_price.sql in the Supabase SQL Editor first.", "SCHEMA_MISSING");
        if (missing.includes("pack_sizes") && input.packSizes.length > 1)
          throw new HttpError(503, "To save more than one pack size, run supabase/migrations/20261123000000_product_channels_pack_sizes.sql in the Supabase SQL Editor first.", "SCHEMA_MISSING");
        if (missing.includes("channel") && input.channel === "export")
          throw new HttpError(503, "To add a product to the Export catalogue, run supabase/migrations/20261123000000_product_channels_pack_sizes.sql in the Supabase SQL Editor first.", "SCHEMA_MISSING");
        // The pack columns are missing: saving the block's copy needs the SQL first.
        if (missing.some((c) => c.startsWith("pack_") && c !== "pack_customized") && packContent)
          throw new HttpError(503, "To save the Know your pack section, run supabase/migrations/20261120000000_product_pack_info.sql and supabase/migrations/20261120010000_product_pack_customized.sql in the Supabase SQL Editor first.", "SCHEMA_MISSING");
        for (const c of missing) delete row[c];
        attempt--;
        continue;
      }
    }
    // Two admins creating products at the same moment can race for a barcode; try the next one.
    if (error.code === "23505" && !existing && attempt < 2) {
      known.push({ id: "", barcode });
      continue;
    }
    throw dbError(error);
  }
  if (!saved) throw new HttpError(500, "The product couldn't be saved.");

  const before = (existing?.stock as number | undefined) ?? 0;
  if ((saved.stock as number) !== before) {
    await client.from("stock_log").insert({
      text: `${existing ? "Stock adjusted" : "Opening stock"} · ${saved.name}`,
      delta: (saved.stock as number) - before,
      product_id: saved.id,
    });
  }
  return json({ product: mapProduct(saved) }, existing ? 200 : 201);
});
