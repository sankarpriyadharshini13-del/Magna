import type { Product, ProductPack, ProductPackPrice } from "@/types";

/** Empty "Know your pack" block — every product starts here. */
export const emptyPack = (): ProductPack => ({
  enabled: true,
  ingredients: "",
  benefits: "",
  whoCanEat: "",
  whoShouldBeCareful: "",
});

/** One point per line. Blank lines and a leading -, • or * (typed as a bullet) are ignored. */
export function packPoints(text: string | null | undefined): string[] {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** True when the admin has written anything in the block (the on/off switch alone doesn't count). */
export function packHasContent(pack: ProductPack | null | undefined): boolean {
  if (!pack) return false;
  return [pack.ingredients, pack.benefits, pack.whoCanEat, pack.whoShouldBeCareful].some((text) => text.trim() !== "");
}

/**
 * True once the admin owns this block: either it was saved from the product form, or it already has
 * copy from before the "customized" flag existed. Before that, the built-in guide is only a starting point.
 */
export function packEdited(pack: ProductPack | null | undefined): boolean {
  return !!pack && (pack.customized === true || packHasContent(pack));
}

/** Clean a list of pack sizes: trim, drop blanks, de-duplicate (case-insensitive), cap at 8 entries. */
export function cleanPackSizes(sizes: readonly string[] | null | undefined, fallback = ""): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...(sizes ?? []), fallback]) {
    const size = String(raw ?? "").trim().slice(0, 40);
    const key = size.toLowerCase();
    if (!size || seen.has(key)) continue;
    seen.add(key);
    out.push(size);
    if (out.length === 8) break;
  }
  return out;
}

/** Every pack size for a product, always at least one entry (`[""]` when none is set yet). */
export function packSizesOf(product: Pick<Product, "packSize" | "packSizes"> | null | undefined): string[] {
  const sizes = cleanPackSizes(product?.packSizes, product?.packSize ?? "");
  return sizes.length ? sizes : [""];
}

/** The size to preselect on shop cards / product pages. */
export function defaultPackSize(product: Pick<Product, "packSize" | "packSizes"> | null | undefined): string {
  return packSizesOf(product)[0];
}

/** The selected pack's price, with legacy product-level prices as a fallback. */
export function priceForPack(
  product: Pick<Product, "priceInr" | "originalPriceInr" | "packPrices"> | null | undefined,
  packSize = "",
): ProductPackPrice {
  return product?.packPrices?.[packSize] ?? {
    price: product?.priceInr ?? null,
    originalPrice: product?.originalPriceInr ?? null,
  };
}
