import type { Metadata } from "next";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import type { SVGProps } from "react";
import SiteShell from "@/components/layout/SiteShell";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { ArrowIcon, CheckIcon, GlobeIcon, MailIcon, PinIcon } from "@/components/ui/Icons";
import { getPublicProducts } from "@/lib/server/publicProducts";

const ProductCard = nextDynamic(() => import("@/components/product/ProductCard"), {
  loading: () => <div className="aspect-[4/5] rounded-[2rem] bg-sand animate-pulse" />,
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Distribution Partners | Magna Eco Bites",
  description: "Become a pan-India distribution partner for Magna Eco Bites' stone-ground podis, cold-pressed oils and natural pantry staples.",
};

const featureIconBase: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 48 48",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
};

const PurityIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <path d="m24 3.5 15 5.6v12.1c0 10-6.2 18.5-15 23.3-8.8-4.8-15-13.3-15-23.3V9.1L24 3.5Z" fill="currentColor" />
    <path d="M32.1 14.2c-8.2.7-13.8 5-14.8 11.8-.2 1.8.4 3.4 1.6 4.7 7-1.1 11.8-7 13.2-16.5Z" fill="#F2C66D" />
    <path d="M15.9 35c3-4.8 6.3-8.3 10.4-11.1" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
  </svg>
);

const RepeatIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <path d="M37.7 18A14.5 14.5 0 0 0 12 12.5L9 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m7.5 10.5 1 6.5 6.5-1" fill="currentColor" />
    <path d="M10.3 30A14.5 14.5 0 0 0 36 35.5L39 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m40.5 37.5-1-6.5-6.5 1" fill="currentColor" />
    <path d="M24 31.5s-7.2-4.5-7.2-9.2a4.2 4.2 0 0 1 7.2-2.9 4.2 4.2 0 0 1 7.2 2.9c0 4.7-7.2 9.2-7.2 9.2Z" fill="#F2C66D" />
  </svg>
);

const MarginIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <ellipse cx="17" cy="33" rx="10" ry="4.5" fill="currentColor" />
    <path d="M7 27v6c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5v-6" fill="currentColor" />
    <ellipse cx="17" cy="27" rx="10" ry="4.5" fill="#F2C66D" />
    <path d="M17 20v2M17 32v2m3-10.5c-.6-.9-1.7-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2c-1.3 0-2.4-.6-3-1.5" stroke="#3B5A3A" strokeWidth="1.7" strokeLinecap="round" />
    <path d="m27 19 5-5 4 3 7-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M37 9h6v6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeliveryIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <path d="M4 13a2 2 0 0 1 2-2h19v19H6a2 2 0 0 1-2-2V13Z" fill="currentColor" />
    <path d="M25 17h8l8 8v5H25V17Z" fill="currentColor" />
    <path d="M29 20v5h8l-5-5h-3Z" fill="#F2C66D" />
    <circle cx="13" cy="32" r="4" fill="#3B5A3A" stroke="white" strokeWidth="2" />
    <circle cx="34" cy="32" r="4" fill="#3B5A3A" stroke="white" strokeWidth="2" />
    <path d="M10 17h8M10 22h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const whyPartner = [
  {
    Icon: PurityIcon,
    title: "Uncompromised Quality & Purity",
    bullets: [
      "100% Natural Ingredients: Zero artificial preservatives, zero synthetic colors, zero chemical additives, and zero hidden fillers.",
      "Traditional Stone-Ground Craftsmanship: Processed slowly to retain maximum natural oils, vitamins, aroma, and authentic homemade taste.",
      "Direct Farm Traceability: Ingredients sourced directly from vetted agricultural farms across Tamil Nadu and India.",
    ],
  },
  {
    Icon: RepeatIcon,
    title: "High Customer Repeat & Brand Loyalty",
    bullets: [
      "South Indian pantry staples — especially stone-ground podis, pure country sugar, and cold-pressed oils — are high-frequency daily consumption items. Your customers come back regularly for the unmatched homemade flavor.",
    ],
  },
  {
    Icon: MarginIcon,
    title: "Attractive Commercials & Distributor Margins",
    bullets: [
      "We offer competitive wholesale pricing structures and healthy profit margins designed to support sustainable growth for our trade partners, distributors, and bulk purchasers.",
    ],
  },
  {
    Icon: DeliveryIcon,
    title: "Pan-India Logistics & Supply Chain Security",
    bullets: [
      "No matter where your business is located — Metro cities, Tier 1, Tier 2, or Tier 3 hubs across South, North, East, West, and Central India — we have reliable logistics partners to deliver your consignments safely and on schedule.",
    ],
  },
];

const ShoppingCartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <path d="M7 9h4l4.2 21.3h19.3l4.2-14.5H13" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.2 30.3 13 16h26l-4.3 14.3H15.2Z" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" />
    <path d="M16 20h21M17 25h18M21 16l2 14M30 16l-1.5 14" stroke="#F2C66D" strokeWidth="2" strokeLinecap="round" />
    <circle cx="19" cy="37" r="2.7" fill="#F2C66D" />
    <circle cx="33" cy="37" r="2.7" fill="#F2C66D" />
  </svg>
);

const RestaurantUtensilsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <circle cx="24" cy="24" r="10.5" stroke="currentColor" strokeWidth="2.6" />
    <circle cx="24" cy="24" r="6.5" stroke="#F2C66D" strokeWidth="2.2" />
    <path d="M7 9v8m4-8v8m4-8v8M7 17h8m-4 0v22M38 9c0 6-1.3 9-4 11v17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GiftBoxIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...featureIconBase} {...props}>
    <path d="M10 22h28v19H10V22Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M8 16h32v7H8v-7Z" fill="currentColor" />
    <path d="M21 16h6v25h-6z" fill="#F2C66D" />
    <path d="M24 16c-7 0-10-2-10-5a3 3 0 0 1 3-3c3 0 5 4 7 8Zm0 0c7 0 10-2 10-5a3 3 0 0 0-3-3c-3 0-5 4-7 8Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

const solutions = [
  {
    Icon: ShoppingCartIcon,
    title: "Retail Distributors & Supermarket Chains",
    body: "Expand your shelves with premium, eye-catching retail pouches and glass/pet bottles that stand out in the natural food and ethnic staple segments.",
    bullets: [
      "Retail-Ready Packs: 50g, 100g, 200g, 500g, 800g, and 1kg options.",
      "High Shelf-Life & Safe Packaging: Sealed food-grade packaging designed to maintain fresh aroma during transit and shelf storage.",
    ],
  },
  {
    Icon: RestaurantUtensilsIcon,
    title: "HoReCa (Hotels, Restaurants, Cafés & Caterers)",
    body: "Elevate your culinary offerings with authentic traditional tastes. We supply commercial kitchens with consistent, high-yield spice powders, podis, and cold-pressed oils.",
    bullets: [
      "Bulk packaging available in 5 kg, 10 kg, 25 kg bags/sacks, and 10L / 20L food-grade cans/drums for oils.",
    ],
  },
  {
    Icon: GiftBoxIcon,
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
  const enquiryProducts = range.map(({ id, name, packSize, packSizes }) => ({ id, name, packSize, packSizes }));

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

      {/* Why partner: Editorial benefit list */}
      <section className="bg-sand/40 py-16 sm:py-20 md:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Why Partner With Magna Eco Bites?"
              title={<>Built for <span className="italic text-clay">long-term</span> trade partnerships</>}
            />
          </Reveal>

          <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-soft">
            {whyPartner.map((w, i) => (
              <Reveal key={w.title} delay={i * 70}>
                <article className="grid gap-5 p-6 transition-colors duration-300 hover:bg-sand/30 sm:p-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-10">
                  <div className="flex items-start gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-clay/10 to-honey/20 text-forest ring-1 ring-clay/10">
                      <w.Icon width={28} height={28} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay">Benefit 0{i + 1}</p>
                      <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-forest sm:text-xl">{w.title}</h3>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {w.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75 sm:text-[15px]">
                        <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
                          <CheckIcon width={10} height={10} />
                        </span>
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
            <EnquiryForm type="distributor" products={enquiryProducts} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
