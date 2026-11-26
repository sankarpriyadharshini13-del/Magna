import type { Product } from "@/types";

const LOW_STOCK = 10;

export function stockState(
  product: Pick<Product, "stock">,
): { label: string; tone: "out" | "low" } | null {
  if (product.stock == null) return null;
  if (product.stock <= 0) return { label: "Out of stock", tone: "out" };
  if (product.stock <= LOW_STOCK) return { label: `Only ${product.stock} left`, tone: "low" };
  return null;
}
