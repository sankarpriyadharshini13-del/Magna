import type { Metadata } from "next";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import SiteShell from "@/components/layout/SiteShell";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { ArrowIcon, CheckIcon, FactoryIcon, GlobeIcon, HeartIcon, LeafIcon, MailIcon, PackageIcon, PinIcon, StoreIcon, TruckIcon } from "@/components/ui/Icons";
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
      {/* Hero: High-Impact Editorial Banner */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-honey/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-white/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-clay shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-clay" aria-hidden="true" />
                Partner With Magna Eco Bites
              </span>

              <h1 className="mt-6 font-display text-3xl font-medium tracking-tight text-forest sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.1]">
                Pan-India <span className="italic text-clay">distribution &amp; bulk supply</span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg sm:leading-relaxed">
                Bring Authentic, Stone-Ground & 100% Natural South Indian Pantry Staples to Your Region. At Magna Eco Bites, we are expanding our distribution network across India. Whether you are a regional distributor, retail store chain, organic & natural products retailer, or a HoReCa (Hotels, Restaurants, & Caterers) partner, we supply our complete range of stone-ground podis, cold-pressed oils, unrefined sweeteners, spices, millets, and health mixes anywhere in India. We manufacture in small batches in Chennai, ensuring your customers receive fresh, aromatic, and pure products every single time.
              </p>

              {/* Quick Actions & Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#enquire"
                  className="btn-primary"
                >
                  Become a Partner
                  <ArrowIcon width={16} height={16} />
                </a>
                <a
                  href="#catalogue"
                  className="btn-secondary"
                >
                  Explore Stockable SKUs
                </a>
              </div>

              {/* Trust badges strip */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                {[
                  { label: "100% Natural Purity", sub: "Zero preservatives" },
                  { label: "Direct Freight", sub: "Pan-India delivery" },
                  { label: "Wholesale Margins", sub: "Sustainable trade growth" },
                  { label: "Fresh Batches", sub: "Milled in Chennai" },
                ].map((pill) => (
                  <div key={pill.label} className="rounded-2xl border border-forest/10 bg-white/60 p-3.5 text-center shadow-soft backdrop-blur-sm">
                    <p className="font-display text-sm font-bold text-forest">{pill.label}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{pill.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Live product range */}
      <section id="catalogue" className="scroll-mt-20 bg-cream pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Our live range"
                title={<>Products you can <span className="italic text-clay">stock &amp; sell</span></>}
                lead="Everything customers buy from our shop is available to our distributor partners — tell us the products, pack sizes and quantities you need, and we'll share wholesale pricing."
              />
              <span className="self-start rounded-full bg-forest/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-forest sm:self-end">
                {range.length} Active SKUs
              </span>
            </div>
          </Reveal>
          {range.length === 0 ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/60 p-8 text-center text-ink/65">Our range is being updated — check back soon.</p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {range.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} enquiryOnly />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Why partner: Luxury 2x2 Feature Grid */}
      <section className="relative overflow-hidden bg-sand/40 py-16 sm:py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Why Partner With Magna Eco Bites?"
              title={<>Built for <span className="italic text-clay">long-term</span> trade partnerships</>}
            />
          </Reveal>
          
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
            {whyPartner.map((w, i) => (
              <Reveal key={w.title} delay={i * 80} className="h-full">
                <article className="group flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <w.Icon width={26} height={26} />
                    </span>
                    <h3 className="font-display text-xl font-bold text-forest sm:text-2xl">{w.title}</h3>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3.5 border-t border-forest/[0.08] pt-6">
                    {w.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75 sm:text-[15px]">
                        <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-clay" />
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

      {/* Solutions: Channel Specific Offerings */}
      <section className="bg-cream py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Solutions tailored to Your Business Model"
              title={<>A partner for every <span className="italic text-clay">channel</span></>}
            />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {solutions.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="h-full">
                <article className="group flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest text-cream shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <s.Icon width={24} height={24} />
                    </span>
                    <span className="font-display text-xs font-bold tracking-[0.2em] text-forest/30">
                      Channel 0{i + 1}
                    </span>
                  </div>
                  
                  <h3 className="mt-5 font-display text-xl font-bold text-forest sm:text-2xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-[15px]">{s.body}</p>
                  
                  {s.bullets.length > 0 && (
                    <ul className="mt-6 flex-1 space-y-3 border-t border-forest/[0.08] pt-5">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/75">
                          <span aria-hidden="true" className="mt-1.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
                            <CheckIcon width={9} height={9} />
                          </span>
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

      {/* Product range: Numbered Artisanal Cards */}
      <section className="relative overflow-hidden bg-sand/40 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Product Range Available for Bulk & Wholesale Order"
              title={<>Our full range, <span className="italic text-clay">ready to stock</span></>}
            />
          </Reveal>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productRange.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} className="h-full">
                <div className="group flex h-full flex-col justify-between rounded-[1.75rem] border border-forest/10 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-forest/5 px-3 py-1 font-display text-xs font-bold text-forest">
                        Category 0{i + 1}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-honey" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold text-forest">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink/70">{p.body}</p>
                  </div>
                  <div className="mt-5 border-t border-forest/[0.06] pt-3 text-xs font-semibold text-clay">
                    Bulk & Custom Pack Sizes
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Flexible order quantities: Reassuring Support Grid */}
      <section className="bg-cream py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Flexible Order Quantities & Support"
              title={<>Start small, <span className="italic text-clay">scale with ease</span></>}
              lead="Whether you want to start with a sample test batch or place full truckload wholesale orders, we provide full support to help you introduce Magna Eco Bites to your market."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {flexibleOrder.map((f, i) => (
              <Reveal key={f} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col items-center rounded-[1.75rem] border border-forest/10 bg-white p-6 text-center shadow-soft sm:p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf/10 text-leaf">
                    <CheckIcon width={20} height={20} />
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-forest sm:text-base">
                    {f}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Become a partner: High-End Dark Portal */}
      <section id="enquire" className="scroll-mt-20 relative overflow-hidden bg-forest py-16 text-cream sm:py-20 md:py-24">
        {/* Decorative background glow rings */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-clay/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-leaf/25 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="Become a Partner Today"
              title={<>Join our growing <span className="italic text-honey">trade network</span></>}
              lead="Join our growing network of trade partners bringing authentic, natural nourishment to homes across India. Send us your business details, location, and product requirements — our B2B sales team will get back to you with our wholesale catalog and price list within 24 hours."
            />
          </Reveal>

          {/* Quick Contact Chips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-4 py-2 backdrop-blur-sm">
              <MailIcon width={16} height={16} className="text-honey" />
              <span>bulk@magnaecobites.com</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-4 py-2 backdrop-blur-sm">
              <GlobeIcon width={16} height={16} className="text-honey" />
              <span>www.magnaecobites.com</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-4 py-2 backdrop-blur-sm">
              <PinIcon width={16} height={16} className="text-honey" />
              <span>Kolathur, Chennai, Tamil Nadu, India</span>
            </div>
          </div>

          {/* Form Card Container */}
          <div className="mt-10 rounded-[2.25rem] bg-white p-7 text-ink shadow-lift sm:p-10 md:p-12">
            <EnquiryForm type="distributor" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
