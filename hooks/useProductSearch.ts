import { useMemo } from "react";
import { useProducts } from "@/context/ProductsContext";
import { sellsOnline } from "@/lib/channels";

export function useProductSearch(query: string) {
  const { products } = useProducts();
  return useMemo(() => {
    // The header search is for the shop; export / distributor-only items are enquiry-only.
    const catalogue = products.filter(sellsOnline);
    const q = query.trim().toLowerCase();
    if (!q) return catalogue;
    const terms = q.split(/\s+/);
    return catalogue.filter((p) => {
      const hay = `${p.name} ${p.description} ${p.tag ?? ""}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [query, products]);
}
