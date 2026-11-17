/**
 * "Know your pack" guide shown on the home page: one row per product with the
 * ingredients, what they bring to the plate, who can eat it and who should avoid it.
 *
 * Written at ingredient level only. `ingredients` is a summary — the printed pack
 * label stays the authoritative list (including allergens), which is what the UI
 * note under the table tells customers. Nothing here is medical advice.
 * Update this file whenever a recipe or the catalogue changes.
 */

export interface IngredientGuideRow {
  /** Product slug — used to link the row to its product page when it exists. */
  slug: string;
  /** Product name shown in the "Ingredient" column. */
  product: string;
  /** Short ingredient summary for that pack. */
  ingredients: string;
  /** What those ingredients bring — plain, everyday language. */
  benefits: string;
  /** Who can eat it — one line per bullet point. */
  eat: string[];
  /** Who should limit it or avoid it — one line per bullet point. */
  careful: string[];
}

export const ingredientGuide: IngredientGuideRow[] = [
  {
    slug: "idli-podi",
    product: "Idli Podi",
    ingredients: "Urad dal · chana dal · red chilli · curry leaves · asafoetida · salt",
    benefits:
      "The lentil base brings plant protein and fibre, curry leaves and asafoetida are the traditional digestive pair of a South Indian podi, and red chilli gives the warm kick.",
    eat: [
      "Adults and older children who enjoy spicy foods.",
      "People looking to add plant-based protein and fibre to their meals.",
      "Suitable as an accompaniment to idli, dosa and rice.",
    ],
    careful: [
      "People allergic to any of the ingredients should avoid it.",
      "People with acid reflux or sensitive stomachs may need to limit spicy portions.",
      "People following a low-sodium diet should monitor their salt intake.",
    ],
  },
  {
    slug: "moringa-idli-podi",
    product: "Moringa Idli Podi",
    ingredients: "Urad dal · chana dal · moringa (drumstick) leaf · red chilli · curry leaves · asafoetida · salt",
    benefits:
      "Moringa leaf is the iron- and calcium-rich green of South Indian kitchens, and the same lentil base adds protein and fibre on top of the classic podi.",
    eat: [
      "Adults and older children who enjoy leafy greens and spicy foods.",
      "People looking to include plant-based nutrients in their daily diet.",
      "Suitable for those wanting to add moringa leaves to everyday meals.",
    ],
    careful: [
      "People allergic to any listed ingredient should avoid it.",
      "People with sensitive stomachs may need to limit spicy portions.",
      "People with specific medical conditions should seek advice before consuming concentrated moringa products.",
    ],
  },
  {
    slug: "sesame-podi",
    product: "Sesame Podi",
    ingredients: "Sesame seeds · urad dal · chana dal · red chilli · curry leaves · salt",
    benefits:
      "Sesame is one of the richest plant sources of calcium and brings healthy fats, while the dals add protein and a nutty body to the mix.",
    eat: [
      "Adults and children without sesame allergies.",
      "People looking to include plant-based calcium and healthy fats in their diet.",
      "Suitable for those who enjoy sesame-based accompaniments with everyday meals.",
    ],
    careful: [
      "People with sesame allergies must completely avoid this product.",
      "People sensitive to chilli may need smaller portions.",
      "People following a low-sodium diet should check the salt content.",
    ],
  },
  {
    slug: "turmeric",
    product: "Turmeric",
    ingredients: "100% turmeric powder",
    benefits:
      "Curcumin is the natural pigment behind turmeric's golden colour. Traditionally used in Indian cooking for its earthy flavour and in home remedies for inflammation.",
    eat: [
      "Adults and children can generally consume normal cooking quantities.",
      "People looking to include natural spices in their everyday diet.",
      "Suitable for adding flavour and colour to curries, rasam and vegetables.",
    ],
    careful: [
      "People allergic to turmeric should avoid it.",
      "People with gallbladder problems should consult their doctor before using turmeric supplements.",
      "People taking blood-thinning medication should seek medical advice before consuming high-dose supplements.",
    ],
  },
  {
    slug: "country-sugar",
    product: "Country Sugar",
    ingredients: "Country sugar — cane sugar, less processed than white",
    benefits:
      "Less refining means it keeps more of the cane's molasses and trace minerals, with a deeper, rustic sweetness than white sugar.",
    eat: [
      "Adults and children without dietary restrictions can enjoy it in moderation.",
      "People who prefer a less-refined alternative to white sugar.",
      "Suitable for people who enjoy natural cane-sugar flavour in traditional recipes.",
    ],
    careful: [
      "People with diabetes should limit consumption as it can raise blood sugar.",
      "People with prediabetes should monitor their overall sugar intake.",
      "People following a low-sugar diet should use it sparingly.",
    ],
  },
  {
    slug: "groundnut-oil",
    product: "Groundnut Oil",
    ingredients: "Cold-pressed groundnut (peanut) oil",
    benefits:
      "High in monounsaturated fat and vitamin E, with a high smoke point, so it holds up to frying, tempering and everyday South Indian cooking.",
    eat: [
      "Most adults and children without peanut allergies.",
      "People looking to include unsaturated fats in their everyday diet.",
      "Suitable for regular cooking, frying and tempering in appropriate quantities.",
    ],
    careful: [
      "People with peanut allergies should avoid this product.",
      "People managing calorie intake should use measured quantities.",
      "People following specific medical diets should consult their healthcare professional.",
    ],
  },

  {
    slug: "multi-grain-mix",
    product: "Multi Grain Mix",
    ingredients: "A blend of grains and millets — the exact list is on the pack",
    benefits:
      "Millets and whole grains bring slow-release carbohydrates and fibre, and it is an easy way to add variety to porridge, dosa and idli batter.",
    eat: [
      "Adults and children who tolerate the grains in the mixture.",
      "People looking to include different grains and millets in their diet.",
      "Suitable for people looking for a fibre-containing breakfast option.",
    ],
    careful: [
      "People with coeliac disease should avoid it if it contains gluten-containing grains.",
      "People allergic to any of the grains should avoid it.",
      "People with digestive sensitivities may need to start with smaller portions.",
    ],
  },
  {
    slug: "roasted-channa",
    product: "Roasted Channa",
    ingredients: "Roasted bengal gram (chana) — check the pack for added salt",
    benefits:
      "One of the higher plant-protein snacks around, with good fibre; the crunch makes it a filling swap for fried snacks.",
    eat: [
      "Adults and older children who can safely chew hard foods.",
      "People looking for a plant-based source of protein and fibre.",
      "Suitable for people wanting a filling snack between meals.",
    ],
    careful: [
      "People allergic to chickpeas or relevant legumes should avoid it.",
      "People experiencing bloating from legumes may need smaller portions.",
      "Toddlers and young children should not be given whole roasted channa due to choking risk.",
    ],
  },
  {
    slug: "poha-mix",
    product: "Poha Mix",
    ingredients: "Flattened rice (poha / aval) with a ready seasoning mix",
    benefits:
      "Flattened rice is light and cooks in minutes, while the seasoning brings the curry leaf and spice notes of a traditional poha in one step.",
    eat: [
      "Adults and children who tolerate the listed ingredients.",
      "People looking for a quick and convenient breakfast option.",
      "Suitable for students and working professionals with busy mornings.",
    ],
    careful: [
      "People allergic to peanuts or seasoning ingredients should check the label carefully.",
      "People with coeliac disease should verify that the product is gluten-free.",
      "People following a low-sodium diet or managing blood sugar should monitor portions and seasoning.",
    ],
  },
];

