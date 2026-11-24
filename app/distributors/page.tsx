import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import SiteShell from "@/components/layout/SiteShell";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { CheckIcon, FactoryIcon, HeartIcon, LeafIcon, PackageIcon, StoreIcon, TruckIcon } from "@/components/ui/Icons";
import { getPublicProducts } from "@/lib/server/publicProducts";

const ProductCard = nextDynamic(() => import("@/components/product/ProductCard"), {
  loading: () => <div className="aspect-[4/5] rounded-[2rem] bg-sand animate-pulse" />,
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Distribution Partners | Magna Eco Bites",
  description: "Become a pan-India distribution partner for Magna Eco Bites' stone-ground podis, cold-pressed oils and natural pantry staples.",
};

const whyPartner = [
  {
    Icon: LeafIcon,
    title: "Uncompromised Quality & Purity",
    bullets: [
      "100% Natural Ingredients: Zero artificial preservatives, zero synthetic colors, zero chemical additives, and zero hidden fillers.",
      "Traditional Stone-Ground Craftsmanship: Processed slowly to retain maximum natural oils, vitamins, aroma, and authentic homemade taste.",
      "Direct Farm Traceability: Ingredients sourced directly from vetted agricultural farms across Tamil Nadu and India.",
    ],
  },
  {
    Icon: HeartIcon,
    title: "High Customer Repeat & Brand Loyalty",
    bullets: [
      "South Indian pantry staples — especially stone-ground podis, pure country sugar, and cold-pressed oils — are high-frequency daily consumption items. Your customers come back regularly for the unmatched homemade flavor.",
    ],
  },
  {
    Icon: StoreIcon,
    title: "Attractive Commercials & Distributor Margins",
    bullets: [
      "We offer competitive wholesale pricing structures and healthy profit margins designed to support sustainable growth for our trade partners, distributors, and bulk purchasers.",
    ],
  },
  {
    Icon: TruckIcon,
    title: "Pan-India Logistics & Supply Chain Security",
    bullets: [
      "No matter where your business is located — Metro cities, Tier 1, Tier 2, or Tier 3 hubs across South, North, East, West, and Central India — we have reliable logistics partners to deliver your consignments safely and on schedule.",
    ],
  },
];

const solutions = [
  {
    Icon: StoreIcon,
    title: "Retail Distributors & Supermarket Chains",
    body: "Expand your shelves with premium, eye-catching retail pouches and glass/pet bottles that stand out in the natural food and ethnic staple segments.",
    bullets: [
      "Retail-Ready Packs: 50g, 100g, 200g, 500g, 800g, and 1kg options.",
      "High Shelf-Life & Safe Packaging: Sealed food-grade packaging designed to maintain fresh aroma during transit and shelf storage.",
    ],
  },
  {
    Icon: FactoryIcon,
    title: "HoReCa (Hotels, Restaurants, Cafés & Caterers)",
    body: "Elevate your culinary offerings with authentic traditional tastes. We supply commercial kitchens with consistent, high-yield spice powders, podis, and cold-pressed oils.",
    bullets: [
      "Bulk packaging available in 5 kg, 10 kg, 25 kg bags/sacks, and 10L / 20L food-grade cans/drums for oils.",
    ],
  },
  {
    Icon: PackageIcon,
    title: "Corporate Gifting & Event Supply",
    body: "Looking for wholesome, culturally rich corporate gift hampers or festive wedding packages? We curate custom natural food gift boxes featuring our best-selling podis, country sugar, and superfood mixes.",
    bullets: [],
  },
];

const productRange = [
  { title: "Stone-Ground Podis", body: "Classic Idli Podi, Moringa Idli Podi, Sesame (Ellu) Podi, Curry Leaf Podi, Garlic Podi, and regional spice mixes." },
  { title: "Pure Cold-Pressed Oils", body: "Groundnut Oil, Sesame / Gingelly Oil, Coconut Oil, Mustard Oil, Sunflower Oil, and Food-Grade Olive Oil." },
  { title: "Unrefined Sweeteners", body: "Pure Naatu Sakkarai (Country Sugar), Palm Jaggery, and Jaggery Powder." },
  { title: "Superfoods & Health Mixes", body: "Raw Moringa Powder, Multi-Grain Health Mix, Quick Poha Mix, and Roasted Channa." },
  { title: "Grains, Pulses & Spices", body: "High-curcumin GI-tagged Turmeric Powder, premium Millets, Pulses, and whole oilseeds." },
];

const flexibleOrder = [
  "Low Minimum Order Quantities (MOQ) for new regional distributors.",
  "Sample Kits Available for quality evaluation prior to bulk contract.",
  "Dedicated B2B Account Representative for hassle-free order placement and tracking.",
];

export default async function DistributorsPage() {
  const range = (await getPublicProducts()).filter((p) => p.channel !== "export");
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream py-16 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-honey/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              as="h1"
              eyebrow="Partner With Magna Eco Bites"
              title={<>Pan-India <span className="italic text-clay">distribution &amp; bulk supply</span></>}
              lead="Bring Authentic, Stone-Ground & 100% Natural South Indian Pantry Staples to Your Region. At Magna Eco Bites, we are expanding our distribution network across India. Whether you are a regional distributor, retail store chain, organic & natural products retailer, or a HoReCa (Hotels, Restaurants, & Caterers) partner, we supply our complete range of stone-ground podis, cold-pressed oils, unrefined sweeteners, spices, millets, and health mixes anywhere in India. We manufacture in small batches in Chennai, ensuring your customers receive fresh, aromatic, and pure products every single time."
            />
          </Reveal>
        </div>
      </section>

      {/* Live product range */}
      <section className="bg-cream pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our live range"
              title={<>Products you can <span className="italic text-clay">stock &amp; sell</span></>}
              lead="Everything customers buy from our shop is available to our distributor partners — tell us the products, pack sizes and quantities you need, and we'll share wholesale pricing."
            />
          </Reveal>
          {range.length === 0 ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/60 p-8 text-center text-ink/65">Our range is being updated — check back soon.</p>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {range.map((p, i) => (
                <li key={p.id}><ProductCard product={p} priority={i < 3} /></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Why partner */}
      <section className="bg-sand/45 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Why Partner With Magna Eco Bites?"
              title={<>Built for <span className="italic text-clay">long-term</span> trade partnerships</>}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {whyPartner.map((w, i) => (
              <Reveal key={w.title} delay={i * 70} className="h-full">
                <article className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft transition-shadow hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-clay/10 text-clay">
                    <w.Icon width={22} height={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest">{w.title}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {w.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ink/70">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Solutions tailored to Your Business Model"
              title={<>A partner for every <span className="italic text-clay">channel</span></>}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {solutions.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} className="h-full">
                <article className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft transition-shadow hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-forest text-cream">
                    <s.Icon width={22} height={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
                  {s.bullets.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ink/70">
                          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product range */}
      <section className="bg-sand/45 py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Product Range Available for Bulk & Wholesale Order"
              title={<>Our full range, <span className="italic text-clay">ready to stock</span></>}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productRange.map((p, i) => (
              <Reveal key={p.title} delay={i * 60} className="h-full">
                <div className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
                  <h3 className="font-display text-lg font-semibold text-forest">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Flexible order quantities */}
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Flexible Order Quantities & Support"
              title={<>Start small, <span className="italic text-clay">scale with ease</span></>}
              lead="Whether you want to start with a sample test batch or place full truckload wholesale orders, we provide full support to help you introduce Magna Eco Bites to your market."
            />
          </Reveal>
          <ul className="mt-10 space-y-3">
            {flexibleOrder.map((f) => (
              <li key={f} className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 text-sm leading-relaxed text-ink/75">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-cream">
                  <CheckIcon width={10} height={10} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Become a partner */}
      <section id="enquire" className="scroll-mt-24 bg-forest py-14 text-cream md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="Become a Partner Today"
              title={<>Join our growing <span className="italic text-honey">trade network</span></>}
              lead="Join our growing network of trade partners bringing authentic, natural nourishment to homes across India. Send us your business details, location, and product requirements — our B2B sales team will get back to you with our wholesale catalog and price list within 24 hours."
            />
          </Reveal>
          <ul className="mt-8 space-y-2 text-center text-sm text-cream/80">
            <li>Email: bulk@magnaecobites.com / hello@magnaecobites.com</li>
            <li>Official Website: www.magnaecobites.com</li>
            <li>Head Office & Production Hub: Kolathur, Chennai, Tamil Nadu, India</li>
          </ul>
          <div className="mt-8 rounded-[2rem] bg-white p-6 text-ink shadow-lift md:p-8">
            <EnquiryForm type="distributor" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
