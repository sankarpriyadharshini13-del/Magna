/**
 * Optional "Know your pack" copy shown under the description on a product page.
 * Managed from Admin → Products & Stock; stored as newline-separated points for the two lists.
 */
export interface ProductPack {
  /** Off hides the whole section on the product page, even when the fields have text. */
  enabled: boolean;
  ingredients: string;
  benefits: string;
  /** One bullet per line. */
  whoCanEat: string;
  /** One bullet per line. */
  whoShouldBeCareful: string;
  /**
   * True once the admin saved this block from the product form. Until then, products with built-in
   * guide copy keep showing it; afterwards a cleared box stays cleared. Not edited by hand.
   */
  customized?: boolean;
}

/** Which catalogue a product belongs to. Ecommerce items feed the shop; export items feed /export. */
export type ProductChannel = "ecommerce" | "export";
export const PRODUCT_CHANNELS: ProductChannel[] = ["ecommerce", "export"];

export interface ProductPackPrice {
  price: number | null;
  originalPrice: number | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tag?: string;
  /** Short card description. Keep to claims the founders can verify. */
  description: string;
  /** Longer copy for the product page. */
  longDescription: string;
  /** Pack size label, e.g. "200 g". Kept as the first entry of `packSizes` for older pages. */
  packSize: string | null;
  /** Every pack size the product is sold in, in display order. Falls back to `packSize`. */
  packSizes?: string[];
  /** Ecommerce (shop/distributors) or export catalogue. Missing = ecommerce for older data. */
  channel?: ProductChannel;
  /** Price in whole INR. null until confirmed — never guess. */
  priceInr: number | null;
  /** Optional "was" price (MRP) in whole INR. Shown struck through when higher than `priceInr`. */
  originalPriceInr: number | null;
  /** Prices by pack size. Missing entries fall back to the product's legacy price fields. */
  packPrices?: Record<string, ProductPackPrice>;
  /** Available units entered per pack size; when present, this caps product-level stock. */
  packStock?: Record<string, number>;
  /** Path under /public. null renders an honest "photo coming soon" tile. */
  image: string | null;
  /** All photos (first one = `image`). Optional for the bundled fallback catalogue. */
  images?: string[];
  imageAlt: string;
  featured: boolean;
  /** Units in stock. null when stock isn't tracked (static fallback catalogue). */
  stock: number | null;
  /** Admin-managed "Know your pack" block. Missing/null falls back to the built-in guide in data/dietary.ts. */
  pack?: ProductPack | null;
}

export interface CartItem {
  productId: string;
  quantity: number;
  /** Chosen pack size. Optional so carts saved before multi-size packs keep working. */
  packSize?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}
