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
  /** Pack size label, e.g. "200 g". null until confirmed by Magna Eco Bites. */
  packSize: string | null;
  /** Price in whole INR. null until confirmed — never guess. */
  priceInr: number | null;
  /** Optional "was" price (MRP) in whole INR. Shown struck through when higher than `priceInr`. */
  originalPriceInr: number | null;
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
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}
