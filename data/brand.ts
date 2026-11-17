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
    "Magna Eco Bites draws inspiration from traditional South Indian cooking — stone-ground podis, slow methods and the care that goes into every step.",
  roots:
    "We are family-run from Kolathur, Chennai, close to where our ingredients come from and to the people we cook for.",
  family:
    "Two founders run the show: Mageshwaran oversees sourcing and quality, and Sathish runs the kitchen. Small batches, made fresh.",
};

/** Natural cultivation, ingredient sourcing and thoughtful food choices. */
export const sourcingPrinciples = [
  {
    key: "cultivation",
    title: "Natural cultivation",
    body: "We favour naturally grown ingredients from trusted farms in Tamil Nadu, chosen for flavour and freshness.",
  },
  {
    key: "sourcing",
    title: "Ingredient sourcing",
    body: "Every pack is sourced and packed locally in Kolathur, Chennai — close enough that the founders can trace what goes in.",
  },
  {
    key: "choices",
    title: "Thoughtful food choices",
    body: "Simple, traditional recipes — lentils, spices, moringa leaf and minimally processed country sugar — so you know what is on your plate.",
  },
] as const;

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
    focus: "Runs the kitchen where every batch is stone-ground.",
    founder: true,
  },
  {
    name: "Dinesh Kumar",
    role: "Digital Marketing & E-commerce",
    focus: "Brings Magna Eco Bites to customers online.",
    founder: false,
  },
] as const;

export interface ServingIdea {
  dish: string;
  /** Product this idea is built around (matched against the live catalogue). */
  productSlug: string;
  productName: string;
  summary: string;
  steps: string[];
  tip: string;
}

/** Serving suggestions with South Indian dishes. Product links resolve against the database. */
export const servingIdeas: ServingIdea[] = [
  {
    dish: "Idli with podi & sesame oil",
    productSlug: "idli-podi",
    productName: "Idli Podi",
    summary: "The classic South Indian breakfast: soft, steamed idlis with a spoon of stone-ground podi.",
    steps: [
      "Spoon one or two teaspoons of idli podi onto your plate.",
      "Make a small well and pour in sesame (gingelly) oil or a little ghee.",
      "Mix into a paste and dip hot idlis straight in.",
    ],
    tip: "Best with sesame oil or ghee",
  },
  {
    dish: "Dosa with moringa podi",
    productSlug: "moringa-idli-podi",
    productName: "Moringa Idli Podi",
    summary: "Crisp dosa with our moringa-leaf podi blend — for breakfast or an evening tiffin.",
    steps: [
      "Spread the dosa batter thin on a hot tawa.",
      "Sprinkle moringa idli podi over it and drizzle a few drops of oil.",
      "Fold and serve hot, with chutney on the side.",
    ],
    tip: "Also great mixed into hot rice",
  },
  {
    dish: "Payasam & sweets",
    productSlug: "country-sugar",
    productName: "Country Sugar",
    summary: "Minimally processed country sugar brings a rich, rustic sweetness to traditional desserts.",
    steps: [
      "Use it in payasam, kesari or halwa as you would regular sugar.",
      "Stir it into tea or coffee for an everyday rustic note.",
      "Store in an airtight jar to keep it free-flowing.",
    ],
    tip: "Ideal for desserts, tea and coffee",
  },
];

export const faqs = [
  {
    q: "Is this 100% vegetarian?",
    a: "Yes, all our products are 100% vegetarian. We use only lentils, spices, moringa leaf and country sugar — no non-veg ingredients at all.",
  },
  {
    q: "Does it contain any preservatives or added colours?",
    a: "No preservatives, no artificial colours, no additives. We grind and pack our podis fresh in small batches, just like homemade.",
  },
  {
    q: "How long will the product stay fresh?",
    a: "When stored in an airtight container in a cool, dry place, our podis stay fresh for 3–4 months. Country sugar can last 6–8 months if kept dry.",
  },
  {
    q: "Is the country sugar real or just coloured white sugar?",
    a: "This is authentic country sugar (naatu sakkarai) — minimally processed from sugarcane, not coloured white sugar. It has a natural golden colour and rich flavour.",
  },
  {
    q: "Is the podi too spicy? Can kids eat it?",
    a: "Our idli podi has a balanced spice level — not too hot, not too mild. Many families give it to kids. If you prefer less spicy, mix with more oil or ghee.",
  },
  {
    q: "How much podi should I use per serving?",
    a: "Usually 1–2 teaspoons per idli or dosa is enough. Mix with sesame oil or ghee to make a paste. Adjust based on your taste.",
  },
  {
    q: "Do you deliver to my area?",
    a: "We deliver across India. Delivery time depends on your location — usually 3–7 business days after order. Enter your pincode at checkout to confirm.",
  },
  {
    q: "Can I order by phone or WhatsApp?",
    a: "You can order directly on our website. For bulk orders or special requests, WhatsApp us at your convenience — we're happy to help.",
  },
  {
    q: "What if I receive a damaged or wrong product?",
    a: "Please send us a photo of the damaged or wrong item within 48 hours of delivery. We'll replace it or refund you — no questions asked.",
  },
  {
    q: "Is moringa podi good for health?",
    a: "Moringa leaf is naturally rich in nutrients. Our moringa idli podi blends moringa with traditional spices for flavour — but we don't make health claims. Consult your doctor for dietary advice.",
  },
  {
    q: "Can I use this for dosa and rice too?",
    a: "Absolutely! Our podis work with idli, dosa, upma and even mixed with hot rice. Just add oil or ghee and enjoy.",
  },
  {
    q: "Do you offer discounts for bulk orders?",
    a: "Yes, we offer special pricing for restaurants, cafés, wedding functions and retail stores. Contact us with your requirements.",
  },
];
