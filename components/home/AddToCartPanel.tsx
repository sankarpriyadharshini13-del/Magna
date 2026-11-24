"use client";

import { useState } from "react";
import AddToCartButton from "@/components/product/AddToCartButton";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { ArrowIcon } from "@/components/ui/Icons";
import { defaultPackSize, packSizesOf } from "@/lib/pack";
import type { Product } from "@/types";

export default function AddToCartPanel({ product, disabled = false }: { product: Product; disabled?: boolean }) {
  const sizes = packSizesOf(product);
  const [packSize, setPackSize] = useState(() => defaultPackSize(product));
  const { lines, hydrated } = useCart();
  const { open } = useUI();
  const inCart = hydrated && lines.some((l) => l.product.id === product.id);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {sizes.length > 1 && (
        <div className="w-full sm:w-44">
          <label htmlFor="product-pack-size" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Pack size
          </label>
          <select
            id="product-pack-size"
            value={packSize}
            onChange={(e) => setPackSize(e.target.value)}
            className="focus-ring h-12 w-full rounded-full border border-forest/15 bg-white px-4 text-sm font-semibold text-forest shadow-sm transition-colors hover:border-forest/30"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}
      <AddToCartButton productId={product.id} name={product.name} packSize={packSize} disabled={disabled} className="sm:min-w-56" />
      {inCart && (
        <button type="button" onClick={() => open("cart")} className="btn-secondary">
          View cart <ArrowIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
