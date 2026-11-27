"use client";

import { useState } from "react";
import AddToCartButton from "@/components/product/AddToCartButton";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { ArrowIcon } from "@/components/ui/Icons";
import { defaultPackSize, packSizesOf, priceForPack } from "@/lib/pack";
import { availablePackStock } from "@/lib/stock";
import Price, { percentOff } from "@/components/ui/Price";
import type { Product } from "@/types";

export default function AddToCartPanel({ product, disabled = false, enquiryOnly = false }: { product: Product; disabled?: boolean; enquiryOnly?: boolean }) {
  const sizes = packSizesOf(product);
  const [packSize, setPackSize] = useState(() => defaultPackSize(product));
  const selectedPrice = priceForPack(product, packSize);
  const selectedStock = availablePackStock(product, packSize);
  const off = percentOff(selectedPrice.price, selectedPrice.originalPrice);
  const { lines, hydrated } = useCart();
  const { open } = useUI();
  const inCart = !enquiryOnly && hydrated && lines.some((l) => l.product.id === product.id);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-3">
        {enquiryOnly && selectedPrice.price == null ? (
          <span className="font-display text-2xl italic text-ink/55 sm:text-3xl">Price on request</span>
        ) : (
          <Price amount={selectedPrice.price} original={selectedPrice.originalPrice} className="!text-3xl sm:!text-4xl" originalClassName="text-lg sm:text-xl" />
        )}
        {off && <span className="rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold text-leaf">{off}% off · You save ₹{(selectedPrice.originalPrice! - selectedPrice.price!).toLocaleString("en-IN")}</span>}
      </div>
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
        {!enquiryOnly && <AddToCartButton productId={product.id} name={product.name} packSize={packSize} disabled={disabled || selectedPrice.price == null || (selectedStock != null && selectedStock <= 0)} className="sm:min-w-56" />}
      </div>
      {inCart && (
        <button type="button" onClick={() => open("cart")} className="btn-secondary">
          View cart <ArrowIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
