import { useMemo } from "react";
import { useProducts } from "@/context/ProductsContext";

export function useProductSearch(query: string) {
  const { products } = useProducts();
  return useMemo(() => {
    // The header search is for the shop; export items are enquiry-only.
    const catalogue = products.filter((p) => p.channel !== "export");
    const q = query.trim().toLowerCase();
    if (!q) return catalogue;
    const terms = q.split(/\s+/);
    return catalogue.filter((p) => {
      const hay = `${p.name} ${p.description} ${p.tag ?? ""}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [query, products]);
}
