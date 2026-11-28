/**
 * Brand story content for the home page and the About Us page.
 *
 * Everything here restates what the existing site already says about Magna Eco Bites
 * (data/site.ts, the original About/Sourcing/Usage sections and the product copy). Nothing adds
 * health benefits, certifications or dietary guarantees — keep it that way unless the owners
 * confirm a new claim in writing.
 */

export const story = {
  inspiration:
    "Magna Eco Bites draws inspiration from traditional South Indian cooking — authentic recipes, quality ingredients and the care that goes into every step.",
  roots:
    "We are family-run from Chennai, close to where our ingredients come from and to the people we cook for.",
  family:
    "Two founders run the show: Mageshwaran oversees sourcing and quality, and Sathish runs the kitchen. Small batches, made fresh.",
};

/**
 * The "Thoughtfully sourced" story on the home page: why ingredient quality matters, then the
 * three promises behind every pack — carefully chosen ingredients, preparation and packing close
 * to home, and the goodness that reaches everyday meals.
 *
 * Claims stay inside what the rest of the site already states — see the note at the top.
 */
export const sourcingPrinciples = [
  {
    key: "chosen",
    title: "Carefully chosen ingredients",
    body: "We source our ingredients from trusted suppliers, giving importance to quality, freshness, and the care taken in selecting each one.",
  },
  {
    key: "made",
    title: "Made close to home",
    body: "Our products are prepared and packed in Chennai. We pay attention to every step, from selecting the ingredients to carefully packing each product.",
  },
  {
    key: "goodness",
    title: "Goodness in every pack",
    body: "We carefully select quality ingredients to create wholesome food products that bring goodness to your everyday meals. Each product is prepared with care, keeping quality and everyday needs in mind.",
  },
] as const;

/**
 * The photograph beside that story: authentic South Indian raw ingredients — fresh moringa leaves,
 * sun-dried red chillies, golden split lentils, and stone-ground podi in a traditional granite mortar and pestle.
 */
export const sourcingPhoto = {
  src: "/images/thoughtfully-sourced.jpg",
  width: 896,
  height: 1200,
  alt: "Artisanal South Indian ingredients: fresh green moringa leaves, sun-dried red chillies, wholesome golden lentils, and traditional stone-ground podi",
  place: "Chennai",
  caption: "Thoughtfully prepared and carefully packed in Chennai, with attention to quality at every step.",
} as const;

export const team = [
  {
    name: "Mageshwaran",
    role: "Director & Export Sales",
    focus: "Oversees sourcing and quality.",
    founder: true,
  },
  {
    name: "Sathish",
    role: "Branch Manager",
    focus: "Oversees the kitchen and ensures quality in every product.",
    founder: true,
  },
  {
    name: "Dinesh Kumar",
    role: "Digital Marketing & E-commerce",
    focus: "Brings Magna Eco Bites to customers online.",
    founder: false,
  },
] as const;

export type FaqGroup = "products" | "kitchen" | "orders" | "business";

export interface Faq {
  q: string;
  a: string;
  /** Which filter the question sits under in the home page FAQ. */
  group: FaqGroup;
  /** Optional next step shown under the answer (shop, policy page, enquiry form…). */
  link?: { href: string; label: string };
}

/**
 * Customer questions, answered from what the rest of the site already states: the product copy,
 * the Shipping Policy, the Terms, the checkout (free India delivery, Razorpay payments) and the
 * review flow. No health, nutrition, certification or dietary claims — see the note at the top.
 */
export const faqs: Faq[] = [
  {
    q: "What products does Magna Eco Bites make?",
    group: "products",
    a: "Our range includes ABC Malt, Beetroot Malt, Carrot Malt, Moringa Powder, Jaggery Powder and Groundnut Oil, prepared and packed in our kitchen in Kolathur, Chennai. For export buyers we also supply Makhana, Raw Moringa Powder and Sunflower Oil. The shop always shows the current range, with live prices and pack sizes.",
    link: { href: "/shop", label: "Browse the shop" },
  },
  {
    q: "How do I know what is in each product?",
    group: "products",
    a: "Open any product page and look for the “Know your pack” section, where we publish the details for that pack. If something is not listed yet, write to hello@magnaecobites.com and we will confirm it before you order.",
    link: { href: "/shop", label: "Check a product page" },
  },
  {
    q: "How should I store the products?",
    group: "kitchen",
    a: "Keep every pack sealed until you open it. Store the malts, Moringa Powder and Jaggery Powder in an airtight container in a cool, dry place away from direct sunlight and the stove, and always use a dry spoon. Keep Groundnut Oil and Sunflower Oil tightly closed in a cool, dark place, away from heat.",
  },
  {
    q: "How do I use the malt mixes and Moringa Powder?",
    group: "kitchen",
    a: "Whisk a spoonful or two of ABC Malt, Beetroot Malt or Carrot Malt into hot or cold milk (or water) for an everyday drink, and adjust the amount to taste. Moringa Powder can be stirred into smoothies, juices, soups, dal or rice — start with a small amount and add more as you like.",
  },
  {
    q: "How do I place an order and pay for it?",
    group: "orders",
    a: "Add what you need to the cart, sign in with your email address, confirm the delivery address and pay online. Cards, UPI and net banking are handled securely by Razorpay, and a confirmation email is sent as soon as the order is placed. Website orders are paid online; we do not offer cash on delivery.",
    link: { href: "/shop", label: "Start shopping" },
  },
  {
    q: "How much does delivery cost?",
    group: "orders",
    a: "We offer free standard shipping on selected domestic orders, based on cart value. The free shipping option is applied automatically at checkout when your order meets the minimum threshold, and any charge is shown before you pay.",
  },
  {
    q: "When will my order arrive, and how do I track it?",
    group: "orders",
    a: "Orders are packed within 1–3 business days, and we do not pack on Sundays or national holidays. After dispatch, please allow 2–3 business days within Tamil Nadu, 3–5 business days for Kerala and Karnataka, and 3–9 business days for the rest of India. Tracking details are sent by email or SMS, and the latest status is always available on your My orders page.",
    link: { href: "/shipping", label: "Read the shipping policy" },
  },
  {
    q: "My pack arrived damaged or incorrect. What should I do?",
    group: "orders",
    a: "If an item is damaged, defective or not what you ordered, contact us with a photo of the pack and the outer box within 48 hours of delivery. We will review the issue and confirm whether a refund or replacement applies. Food items cannot be returned for a change of mind.",
    link: { href: "/terms", label: "Read the returns terms" },
  },
  {
    q: "Do you supply cafés, restaurants, stores and distributors?",
    group: "business",
    a: "Yes. We supply cafés, restaurants, retail stores, caterers and distributors with wholesale quantities and pricing — from a small test batch to regular bulk orders, with pan-India logistics. Tell us what your kitchen or shelf needs, and we will quote from there.",
    link: { href: "/distributors", label: "Business & wholesale" },
  },
  {
    q: "Do you ship outside India?",
    group: "business",
    a: "Yes. We ship to the US, Europe, the Middle East and the Far East. International shipping charges are calculated at checkout based on the package weight and destination country. Import duties, VAT and local taxes, where applicable, are paid by the recipient on arrival. Our export range includes Makhana, Raw Moringa Powder and Sunflower Oil.",
    link: { href: "/export", label: "Explore exports" },
  },
];
