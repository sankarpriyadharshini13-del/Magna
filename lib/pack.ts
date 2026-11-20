import type { ProductPack } from "@/types";

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
