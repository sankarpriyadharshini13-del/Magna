import type { Product, ProductPage } from "@/types";

type ProductLike = Pick<Product, "channel" | "channels">;

/**
 * Pages a product is shown on. Products saved before the per-page switches only have `channel`:
 * ecommerce products fed the shop + distributor page, export products fed /export.
 */
export function productPages(product: ProductLike): ProductPage[] {
  if (product.channels?.length) return product.channels;
  return product.channel === "export" ? ["export"] : ["ecommerce", "distributors"];
}

/** True when the product can be bought online (shop, cart, search). */
export const sellsOnline = (product: ProductLike) => productPages(product).includes("ecommerce");
