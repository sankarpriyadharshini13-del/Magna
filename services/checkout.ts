import { site } from "@/data/site";
import { formatInr } from "@/lib/format";
import type { CartItem, Product, UserProfile } from "@/types";
import { defaultPackSize, priceForPack } from "@/lib/pack";

/**
 * CHECKOUT SERVICE — integration point.
 * No payment gateway / order backend exists in the project. Until one is added
 * (Razorpay/Stripe + order API), "checkout" opens a pre-filled order enquiry
 * email to the shop so no order is lost. Replace `startCheckout` to integrate.
 */
export function buildOrderMailto(items: CartItem[], user: UserProfile | null, lookup: (id: string) => Product | undefined) {
  const lines = items.map((i) => {
    const p = lookup(i.productId);
    if (!p) return "";
    const packSize = i.packSize || defaultPackSize(p);
    const packPrice = priceForPack(p, packSize);
    const price = packPrice.price != null ? ` — ${formatInr(packPrice.price * i.quantity)}` : "";
    const size = packSize ? ` (${packSize})` : "";
    return `• ${p.name}${size} × ${i.quantity}${price}`;
  });
  const body = [
    "Hello Magna Eco Bites, I'd like to order:",
    "",
    ...lines,
    "",
    user ? `Name: ${user.name}\nEmail: ${user.email}` : "Name:\nPhone / address:",
  ].join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent("Order enquiry")}&body=${encodeURIComponent(body)}`;
}

export function startCheckout(items: CartItem[], user: UserProfile | null, lookup: (id: string) => Product | undefined) {
  window.location.href = buildOrderMailto(items, user, lookup);
}
