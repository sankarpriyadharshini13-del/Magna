import type { Metadata } from "next";
import Image from "next/image";
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
  title: "Global Exports | Magna Eco Bites",
  description: "Certified exporter of GI-tagged spices, cold-pressed oils, superfoods and wholesome grains from Chennai, India.",
};

const exportIconBase: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 48 48",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
};

const SpiceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...exportIconBase} {...props}>
    <path d="M12 24h24l-3 13a3 3 0 0 1-3 2.3H18a3 3 0 0 1-3-2.3L12 24Z" fill="currentColor" />
    <path d="M10 22a14 3.5 0 1 0 28 0 14 3.5 0 1 0-28 0Z" fill="#F2C66D" />
    <path d="m24 7 11 11M27 6l-7 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M18 18c1.7-4.1 5.4-6.1 11-6.1-.4 5.5-3.1 8.7-8.1 9.6" fill="#F2C66D" />
  </svg>
);

const OilIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...exportIconBase} {...props}>
    <path d="M19 7h10v6l4 4v22H15V17l4-4V7Z" fill="currentColor" />
    <path d="M20 7h8v5h-8z" fill="#F2C66D" />
    <path d="M19 24h14v10H19z" fill="#F2C66D" />
    <path d="M26 27c-2 2.7-3 4.1-3 5.4a3 3 0 0 0 6 0c0-1.3-1-2.7-3-5.4Z" fill="currentColor" />
    <path d="M9 34c1.3-2 2-3 2-4a2 2 0 0 0-4 0c0 1 .7 2 2 4Z" fill="#F2C66D" />
  </svg>
);

const GrainIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...exportIconBase} {...props}>
    <path d="M24 42V10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M24 20c-5.2 0-8.4-2.8-9.5-8 5.1 0 8.3 2.7 9.5 8ZM24 27c5.2 0 8.4-2.8 9.5-8-5.1 0-8.3 2.7-9.5 8ZM24 33c-4.6 0-7.4-2.5-8.4-7.1 4.5 0 7.4 2.4 8.4 7.1ZM24 38c4.6 0 7.4-2.5 8.4-7.1-4.5 0-7.4 2.4-8.4 7.1Z" fill="#F2C66D" />
    <path d="M17 42h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ConsolidatedCargoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...exportIconBase} {...props}>
    <path d="M7 35h34M11 39h26" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M10 20h12v13H10zM24 13h14v20H24z" fill="currentColor" />
    <path d="M13 24h6M27 18h8M27 23h8M27 28h8" stroke="#F2C66D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ShippingContainerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...exportIconBase} {...props}>
    <path d="M6 12h36v24H6z" fill="currentColor" />
    <path d="M12 15v18M19 15v18M26 15v18M33 15v18M39 15v18" stroke="#F2C66D" strokeWidth="2" />
    <path d="M5 39h38" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="13" cy="40" r="2" fill="#F2C66D" />
    <circle cx="35" cy="40" r="2" fill="#F2C66D" />
  </svg>
);

const CustomLabelIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...exportIconBase} {...props}>
    <path d="m8 19 16-8 16 8-16 8L8 19Z" fill="currentColor" />
    <path d="M8 19v17l16 8 16-8V19M24 27v17" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M28 7h12v10H28z" fill="#F2C66D" />
    <path d="M31 10h6M31 13h4" stroke="#3B5A3A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const portfolio = [
  {
    Icon: SpiceIcon,
    title: "GI-Tagged & Authentic Indian Spices",
    items: [
      "GI-Tagged Turmeric (Whole Fingers & High-Curcumin Powder): Sourced from renowned growing regions, celebrated for vibrant colour, rich aroma, and high natural curcumin content.",
      "Traditional Spices & Stone-Ground Podis: Pure chilli, coriander, cumin, black pepper, and signature South Indian spice blends crafted without artificial additives.",
    ],
  },
  {
    Icon: OilIcon,
    title: "Pure Cold-Pressed & Culinary Oils",
    items: [
      "Groundnut Oil: Rich, nutty, traditionally extracted cooking oil ideal for culinary and retail markets.",
      "Coconut Oil: Pure, aromatic oil pressed from select sun-dried coconuts.",
      "Mustard Oil: Pungent, authentic cold-pressed mustard oil for traditional kitchens.",
      "Sunflower Oil: Light, versatile, high-quality edible oil for everyday cooking.",
      "Olive Oil: Carefully sourced, food-grade olive oil meeting international purity benchmarks.",
    ],
  },
  {
    Icon: GrainIcon,
    title: "Superfoods, Millets & Agricultural Staples",
    items: [
      "Raw Moringa Powder: Shade-dried, finely milled nutrient-dense leaf powder retaining maximum natural vitamins and antioxidants.",
      "Millets & Ancient Grains: Finger millet (Ragi), pearl millet (Bajra), foxtail millet, and multi-grain blends.",
      "Pulses, Legumes & Oilseeds: Premium-grade groundnuts (peanuts), sesame seeds, lentils, and split pulses cleaned and graded for export.",
      "Unrefined Natural Sweeteners: Traditional country sugar (naatu sakkarai) and jaggery products.",
    ],
  },
];

const logistics = [
  {
    Icon: ConsolidatedCargoIcon,
    title: "LCL (Less than Container Load)",
    body: "Consolidated, cost-effective palletized shipments ideal for medium-sized orders, multi-product trial consignments, and specialty retailers.",
  },
  {
    Icon: ShippingContainerIcon,
    title: "FCL (Full Container Load)",
    body: "Dedicated 20ft and 40ft container shipments engineered for bulk importers, wholesalers, and institutional buyers seeking maximum freight efficiency.",
  },
  {
    Icon: CustomLabelIcon,
    title: "Custom Packaging & Private Labelling",
    body: "Available in bulk food-service sacks (25 kg / 50 kg), food-grade drums/jerrycans for oils, and retail-ready pouches or jars customized to your market's labelling regulations.",
  },
];

const registrations = [
  {
    wordmark: "FSSAI",
    type: "Central Licence",
    authority: "Food Safety and Standards Authority of India",
    image: "/images/fssai-logo.png",
  },
  {
    wordmark: "MSME",
    type: "Udyam Registered",
    authority: "Ministry of Micro, Small & Medium Enterprises, Government of India",
    image: "/images/msme-logo.svg",
  },
] as const;

const certifications = [
  "Health Certificate: Officially issued food safety and hygiene certification validating suitability for international human consumption.",
  "IEC (Import Export Code): Directorate General of Foreign Trade (DGFT), Government of India.",
  "APEDA Registration: Agricultural and Processed Food Products Export Development Authority.",
  "Phytosanitary, Fumigation & Certificate of Origin (CoO): Issued per consignment as required by importing destination authorities.",
];

const trust = [
  "Direct Farm-to-Port Traceability: We procure directly from trusted farmers and FPOs across Tamil Nadu and India, eliminating unnecessary middlemen and ensuring consistent crop quality.",
  "100% Natural Integrity: Zero synthetic colours, zero chemical preservatives, and zero adulteration — every batch undergoes strict moisture, purity, and grading checks prior to stuffing.",
  "Strategic Port Connectivity: Located in Chennai, offering rapid access to major international sea ports and air cargo terminals for timely global dispatch.",
  "Dedicated Export Desk: End-to-end documentation support, transparent pricing (FOB, CIF, CNF), and responsive communication from sample approval to final delivery.",
];

export default async function ExportPage() {
  const exportItems = (await getPublicProducts()).filter((p) => p.channel === "export");
  const enquiryProducts = exportItems.map(({ id, name, packSize, packSizes }) => ({ id, name, packSize, packSizes }));

  return (
    <SiteShell>
      {/* Hero: Global Maritime Trade Banner */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-honey/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-clay/30 bg-white/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-clay shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-clay" aria-hidden="true" />
                Global Exports
              </span>

              <h1 className="mt-6 font-display text-3xl font-medium tracking-tight text-forest sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.1]">
                Delivering India&apos;s finest <span className="italic text-clay">GI-tagged &amp; natural</span> treasures
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg sm:leading-relaxed">
                At Magna Eco Bites, we bridge the gap between India&apos;s richest agricultural heartlands and international markets. Based in Chennai, Tamil Nadu — one of India&apos;s premier maritime trade hubs — we are a trusted, certified exporter of authentic Geographical Indication (GI) products, cold-pressed oils, traditional spices, superfoods, and wholesome grains. Every shipment reflects our unwavering commitment to purity, farm-level traceability, and international quality standards — 100% natural, unrefined, and packed to preserve peak freshness across global transit.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a href="#enquire" className="btn-primary">
                  Request an Export Quote
                  <ArrowIcon width={16} height={16} />
                </a>
                <a href="#catalogue" className="btn-secondary">
                  Browse Export SKUs
                </a>
              </div>

              {/* Trade badges strip */}
              <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:gap-4">
                {[
                  { label: "Port of Chennai", sub: "Sea & Air Freight Hub" },
                  { label: "GI-Tagged Sourcing", sub: "Traceable single-origin" },
                  { label: "FCL & LCL Ready", sub: "Flexible container loads" },
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

      {/* Live export catalogue */}
      <section id="catalogue" className="scroll-mt-20 bg-cream pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Live export catalogue"
                title={<>Products ready to <span className="italic text-clay">ship</span></>}
                lead="Every item below is available for export enquiries. Tell us the pack size, quantity and destination — we'll quote from there."
              />
              <span className="self-start rounded-full bg-forest/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-forest sm:self-end">
                {exportItems.length} Export SKUs
              </span>
            </div>
          </Reveal>
          {exportItems.length === 0 ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/60 p-8 text-center text-ink/65">Our export catalogue is being updated — send an enquiry and we&apos;ll share the current range.</p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exportItems.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Portfolio: Categorized Export Staples */}
      <section className="relative overflow-hidden bg-sand/40 py-16 sm:py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Our Export Product Portfolio"
              title={<>A complete range of <span className="italic text-clay">authentic Indian</span> staples</>}
            />
          </Reveal>
          
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {portfolio.map((g, i) => (
              <Reveal key={g.title} delay={i * 80} className="h-full">
                <article className="group flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-clay/10 text-forest shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <g.Icon width={28} height={28} />
                    </span>
                    <h3 className="font-display text-xl font-bold text-forest sm:text-2xl">{g.title}</h3>
                  </div>

                  <ul className="mt-6 flex-1 space-y-4 border-t border-forest/[0.08] pt-6">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75 sm:text-[15px]">
                        <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-clay" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics: Container & Freight Solutions */}
      <section className="bg-cream py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Flexible Logistics"
              title={<>LCL &amp; FCL <span className="italic text-clay">shipment solutions</span></>}
              lead="Whether you are a boutique specialty store testing new SKUs or a large-scale importer stocking regional distribution centres, we tailor our logistics to your exact volume requirements."
            />
          </Reveal>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {logistics.map((l, i) => (
              <Reveal key={l.title} delay={i * 90} className="h-full">
                <article className="group flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest text-cream shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <l.Icon width={24} height={24} />
                    </span>
                    <span className="font-display text-xs font-bold tracking-[0.2em] text-forest/30">
                      Solution 0{i + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-forest sm:text-2xl">{l.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-[15px]">{l.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications: Official Compliance with FSSAI & MSME Badges */}
      <section className="relative overflow-hidden bg-sand/40 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Official registrations"
              title={<>Transparent, <span className="italic text-clay">fully compliant</span> trade</>}
              lead="Global trade demands complete transparency and strict adherence to statutory standards. Magna Eco Bites operates with full regulatory compliance to ensure smooth customs clearance at destination ports worldwide."
            />
          </Reveal>

          {/* Official Registration Badges */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {registrations.map((r) => (
              <Reveal key={r.wordmark} className="h-full">
                <article className="flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-cream/70 p-2.5 shadow-inner ring-1 ring-forest/10">
                      <Image
                        src={r.image}
                        alt={`${r.wordmark} Official Logo`}
                        width={84}
                        height={50}
                        className="max-h-14 max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-2xl font-bold leading-none tracking-[0.16em] text-forest">{r.wordmark}</p>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-clay">{r.type}</p>
                      <p className="mt-1 text-xs leading-snug text-ink/65">{r.authority}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Consignment Document List */}
          <div className="mt-12">
            <p className="text-center font-display text-xs font-bold uppercase tracking-[0.2em] text-forest/50">
              Also Issued with Each Consignment
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {certifications.map((c) => (
                <li key={c} className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 text-sm leading-relaxed text-ink/75 shadow-soft">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-cream">
                    <CheckIcon width={10} height={10} />
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Global Importers Trust Us */}
      <section className="bg-cream py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Why Global Importers Trust Us"
              title={<>Reliable, <span className="italic text-clay">end-to-end</span> export partner</>}
            />
          </Reveal>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {trust.map((t, i) => (
              <Reveal key={t} delay={i * 80} className="h-full">
                <div className="flex h-full items-start gap-4 rounded-[1.75rem] border border-forest/10 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest/10 font-display text-xs font-bold text-forest">
                    0{i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink/75 sm:text-[15px]">{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Request a quote: High-End Dark Portal */}
      <section id="enquire" className="scroll-mt-20 relative overflow-hidden bg-forest py-16 text-cream sm:py-20 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-clay/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-leaf/25 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="Request an Export Quote or Product Sample"
              title={<>Partner with a <span className="italic text-honey">reliable exporter</span></>}
              lead="Partner with a reliable Indian exporter committed to long-term business relationships and uncompromised quality. Share your required product specifications, packaging preferences, and destination port — our export team will respond within 24 business hours."
            />
          </Reveal>

          {/* Quick Contact Chips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-4 py-2 backdrop-blur-sm">
              <MailIcon width={16} height={16} className="text-honey" />
              <span>hello@magnaecobites.com</span>
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
            <EnquiryForm type="export" products={enquiryProducts} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
