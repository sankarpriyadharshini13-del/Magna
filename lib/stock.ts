import type { Product } from "@/types";

const LOW_STOCK = 10;

export function availableStock(
  product: Pick<Product, "stock"> & { packStock?: Record<string, number> | null; packSizes?: string[] | null },
): number | null {
  if (product.stock == null) return null;
  const entries = Object.entries(product.packStock ?? {});
  const packSizes = product.packSizes;
  const packQuantities = packSizes?.length
    ? entries.filter(([size]) => packSizes.includes(size)).map(([, quantity]) => quantity)
    : entries.map(([, quantity]) => quantity);
  if (entries.length === 0) return product.stock;
  if (packQuantities.length === 0) return 0;
  const packTotal = packQuantities.reduce(
    (total, quantity) => total + (Number.isFinite(quantity) ? Math.max(0, quantity) : 0),
    0,
  );
  return Math.min(product.stock, packTotal);
}

export function availablePackStock(
  product: Pick<Product, "stock"> & { packStock?: Record<string, number> | null; packSizes?: string[] | null },
  packSize: string,
): number | null {
  if (product.stock == null) return null;
  const packStock = product.packStock ?? {};
  if (Object.keys(packStock).length === 0) return availableStock(product);
  if (product.packSizes?.length && !product.packSizes.includes(packSize)) return 0;
  if (!Object.prototype.hasOwnProperty.call(packStock, packSize)) return 0;
  const quantity = packStock[packSize];
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(Math.max(0, product.stock), Math.max(0, quantity));
}

export function stockState(
  product: Pick<Product, "stock"> & { packStock?: Record<string, number> | null; packSizes?: string[] | null },
  packSize?: string,
): { label: string; tone: "out" | "low" } | null {
  const stock = packSize ? availablePackStock(product, packSize) : availableStock(product);
  if (stock == null) return null;
  if (stock <= 0) return { label: "Out of stock", tone: "out" };
  if (stock <= LOW_STOCK) return { label: `Only ${stock} left`, tone: "low" };
  return null;
}
