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
 * The sourcing story on the home page, read top to bottom as the life of one pack: bought small
 * from people we know, checked by hand before it is ground, then ground and sealed the same week.
 *
 * Each step answers the natural next question a customer has ("where is it from?", "who checks
 * it?", "how fresh is it?"), so the three cards build one story instead of repeating the same
 * promise. Claims stay inside what the rest of the site already states — see the note at the top.
 */
export const sourcingPrinciples = [
  {
    key: "sourcing",
    title: "Bought small, from people we know",
    body: "Our lentils, dried chillies and moringa leaf come from a short list of growers and suppliers we have bought from year after year — lots small enough to judge by hand, not whatever a commodity market happens to be clearing that week.",
  },
  {
    key: "checking",
    title: "Nothing is ground until it is checked",
    body: "Co-founder Mageshwaran opens every consignment before it reaches the kitchen: the colour of the chillies, the smell of the lentils, whether a sack has taken damp. A lot that fails goes back — careful grinding cannot rescue a poor ingredient.",
  },
  {
    key: "grinding",
    title: "Ground the week it is packed",
    body: "We stone-grind in our own kitchen in Kolathur in batches we can fill and seal within days, so a pack reaches you close to the day it was made. Nothing waits in a warehouse, and nothing is added to help it keep longer.",
  },
] as const;

/**
 * The photograph beside that story: the original Moringa Idli Podi product shot, kept as a static
 * file rather than reusing the hero artwork, so the section shows the real pack instead of the same
 * picture twice in a row. Dimensions are the file's own, so the image is never cropped or stretched.
 */
export const sourcingPhoto = {
  src: "/images/products/moringa-idli-podi.jpg",
  width: 358,
  height: 515,
  alt: "Kraft pack of Moringa Idli Podi standing behind a wooden bowl of the podi, with dried red chillies, curry leaves, moringa leaves and roasted lentils on a dark green surface",
  place: "Kolathur, Chennai",
  caption: "Ground, filled and sealed in our own kitchen, a batch at a time.",
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
    q: "What does Magna Eco Bites make?",
    group: "products",
    a: "Stone-ground South Indian pantry staples from our own kitchen in Kolathur, Chennai: Idli Podi, Moringa Idli Podi and minimally processed country sugar, plus whatever else is in the range at the moment. The shop always shows what is in stock, with live prices and pack sizes.",
    link: { href: "/shop", label: "Browse the shop" },
  },
  {
    q: "Are your podis vegetarian?",
    group: "products",
    a: "Yes — our podis are ground from lentils, spices and moringa leaf only, and our country sugar is made from cane. Nothing animal-derived goes into them. The full ingredient list for every pack is on its product page under “Know your pack”.",
    link: { href: "/shop", label: "Check a product page" },
  },
  {
    q: "How should I store the podi and country sugar?",
    group: "kitchen",
    a: "Keep the pack sealed until you open it, then store it in an airtight jar in a cool, dry place, away from direct sunlight and the stove. Always use a dry spoon — moisture is what spoils podi fastest. There are no preservatives, so a dry jar does most of the work.",
  },
  {
    q: "How do I serve idli podi?",
    group: "kitchen",
    a: "Mix a teaspoon or two with sesame oil or ghee to make a thick paste and serve it with idli or dosa; it is just as good sprinkled over hot rice. Start small and add more as you go — the podi is a condiment, so the amount is entirely up to your table.",
  },
  {
    q: "How do I place an order and pay?",
    group: "orders",
    a: "Add what you need to the cart, sign in with your email, confirm the delivery address and pay online. Cards, UPI and net banking are handled securely by Razorpay, and a confirmation email goes out as soon as the order is placed. Website orders are paid online — we do not offer cash on delivery.",
    link: { href: "/shop", label: "Start shopping" },
  },
  {
    q: "What does delivery cost?",
    group: "orders",
    a: "Nothing on website orders inside India — the checkout adds no delivery charge. Wholesale and export shipments are different: freight is quoted by weight and destination before dispatch, so there are no surprises later.",
  },
  {
    q: "When will my order arrive, and how do I track it?",
    group: "orders",
    a: "Orders are packed within 1–3 business days, and we do not pack on Sundays or national holidays. After dispatch, allow 2–3 business days within Tamil Nadu, 3–5 for Kerala and Karnataka, and 3–9 for the rest of India. Tracking details arrive by email or SMS, and the latest status is always on your My orders page.",
    link: { href: "/shipping", label: "Read the shipping policy" },
  },
  {
    q: "A pack arrived damaged or wrong — what now?",
    group: "orders",
    a: "Send us a photo of the pack and the outer box within 48 hours of delivery and we will replace the item or refund it. Because these are food products, we can only take back packs that are damaged, incorrect or unopened — so please check the parcel when it arrives.",
    link: { href: "/terms", label: "Read the returns terms" },
  },
  {
    q: "Do you supply cafés, restaurants, stores or distributors?",
    group: "business",
    a: "Yes. We supply restaurants, cafés, retail shelves, caterers and distributors with wholesale quantities and pricing — from a small test batch up to regular bulk orders, with pan-India logistics. Tell us what your kitchen or shelf needs and we will quote from there.",
    link: { href: "/business", label: "Business & wholesale" },
  },
  {
    q: "Do you ship outside India?",
    group: "business",
    a: "Yes — our export range travels by sea and air to the US, Europe, the Middle East and the Far East. Freight is quoted per shipment by weight and destination, and any import duty or local tax is paid by the recipient on arrival.",
    link: { href: "/export", label: "Explore exports" },
  },
];
