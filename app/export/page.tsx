import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import SiteShell from "@/components/layout/SiteShell";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { FssaiMark, MsmeMark } from "@/components/ui/CertificationMarks";
import { CheckIcon, GlobeIcon, LeafIcon, PackageIcon, ShipIcon } from "@/components/ui/Icons";
import { getPublicProducts } from "@/lib/server/publicProducts";

const ProductCard = nextDynamic(() => import("@/components/product/ProductCard"), {
  loading: () => <div className="aspect-[4/5] rounded-[2rem] bg-sand animate-pulse" />,
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global Exports | Magna Eco Bites",
  description: "Certified exporter of GI-tagged spices, cold-pressed oils, superfoods and wholesome grains from Chennai, India.",
};

const portfolio = [
  {
    Icon: LeafIcon,
    title: "GI-Tagged & Authentic Indian Spices",
    items: [
      "GI-Tagged Turmeric (Whole Fingers & High-Curcumin Powder): Sourced from renowned growing regions, celebrated for vibrant colour, rich aroma, and high natural curcumin content.",
      "Traditional Spices & Stone-Ground Podis: Pure chilli, coriander, cumin, black pepper, and signature South Indian spice blends crafted without artificial additives.",
    ],
  },
  {
    Icon: ShipIcon,
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
    Icon: GlobeIcon,
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
    Icon: PackageIcon,
    title: "LCL (Less than Container Load)",
    body: "Consolidated, cost-effective palletized shipments ideal for medium-sized orders, multi-product trial consignments, and specialty retailers.",
  },
  {
    Icon: ShipIcon,
    title: "FCL (Full Container Load)",
    body: "Dedicated 20ft and 40ft container shipments engineered for bulk importers, wholesalers, and institutional buyers seeking maximum freight efficiency.",
  },
  {
    Icon: PackageIcon,
    title: "Custom Packaging & Private Labelling",
    body: "Available in bulk food-service sacks (25 kg / 50 kg), food-grade drums/jerrycans for oils, and retail-ready pouches or jars customized to your market's labelling regulations.",
  },
];

/**
 * The two registrations buyers check first. Kept separate from the per-consignment document list
 * below because these are standing registrations, not paperwork raised for a single shipment.
 */
const registrations = [
  {
    wordmark: "FSSAI",
    type: "Central Licence",
    authority: "Food Safety and Standards Authority of India",
    body: "The licence covers the kitchen where every pack is filled, and its details travel with each consignment's documents.",
    Mark: FssaiMark,
  },
  {
    wordmark: "MSME",
    type: "Udyam Registered",
    authority: "Ministry of Micro, Small & Medium Enterprises, Government of India",
    body: "A registered Indian micro-enterprise, so importers can keep our Udyam credentials on file beside the invoice and packing list.",
    Mark: MsmeMark,
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
              eyebrow="Global Exports"
              title={<>Delivering India&apos;s finest <span className="italic text-clay">GI-tagged &amp; natural</span> treasures</>}
              lead="At Magna Eco Bites, we bridge the gap between India's richest agricultural heartlands and international markets. Based in Chennai, Tamil Nadu — one of India's premier maritime trade hubs — we are a trusted, certified exporter of authentic Geographical Indication (GI) products, cold-pressed oils, traditional spices, superfoods, and wholesome grains. Every shipment reflects our unwavering commitment to purity, farm-level traceability, and international quality standards — 100% natural, unrefined, and packed to preserve peak freshness across global transit."
            />
          </Reveal>
        </div>
      </section>

      {/* Live export catalogue */}
      <section className="bg-cream pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Live export catalogue"
              title={<>Products ready to <span className="italic text-clay">ship</span></>}
              lead="Every item below is available for export enquiries. Tell us the pack size, quantity and destination — we'll quote from there."
            />
          </Reveal>
          {exportItems.length === 0 ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/60 p-8 text-center text-ink/65">Our export catalogue is being updated — send an enquiry and we'll share the current range.</p>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exportItems.map((p, i) => (
                <li key={p.id}><ProductCard product={p} priority={i < 3} /></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-sand/45 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Our Export Product Portfolio"
              title={<>A complete range of <span className="italic text-clay">authentic Indian</span> staples</>}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {portfolio.map((g, i) => (
              <Reveal key={g.title} delay={i * 80} className="h-full">
                <article className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft transition-shadow hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-clay/10 text-clay">
                    <g.Icon width={22} height={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest">{g.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink/70">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
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

      {/* Logistics */}
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Flexible Logistics"
              title={<>LCL &amp; FCL <span className="italic text-clay">shipment solutions</span></>}
              lead="Whether you are a boutique specialty store testing new SKUs or a large-scale importer stocking regional distribution centres, we tailor our logistics to your exact volume requirements."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {logistics.map((l, i) => (
              <Reveal key={l.title} delay={i * 80} className="h-full">
                <article className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft transition-shadow hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-forest text-cream">
                    <l.Icon width={22} height={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest">{l.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{l.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-sand/45 py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Certified Quality & Regulatory Compliance"
              title={<>Transparent, <span className="italic text-clay">fully compliant</span> trade</>}
              lead="Global trade demands complete transparency and strict adherence to statutory standards. Magna Eco Bites operates with full regulatory compliance to ensure smooth customs clearance at destination ports worldwide."
            />
          </Reveal>
          <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {registrations.map((r) => (
              <li
                key={r.wordmark}
                className="flex flex-col rounded-[1.5rem] border border-forest/10 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-leaf/10 text-leaf">
                    <r.Mark width={44} height={44} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl font-semibold leading-none tracking-[0.16em] text-forest">{r.wordmark}</p>
                    <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-clay">{r.type}</p>
                    <p className="mt-1 text-xs leading-snug text-ink/60">{r.authority}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <p className="border-t border-forest/10 pt-3 text-sm leading-relaxed text-ink/70">{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/45">
            Also issued with each consignment
          </p>
          <ul className="mt-4 space-y-3">
            {certifications.map((c) => (
              <li key={c} className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 text-sm leading-relaxed text-ink/75">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-cream">
                  <CheckIcon width={10} height={10} />
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why trust us */}
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Why Global Importers Trust Us"
              title={<>Reliable, <span className="italic text-clay">end-to-end</span> export partner</>}
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {trust.map((t) => (
              <Reveal key={t} className="h-full">
                <div className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift">
                  <p className="text-sm leading-relaxed text-ink/70">{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Request a quote */}
      <section id="enquire" className="scroll-mt-24 bg-forest py-14 text-cream md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="Request an Export Quote or Product Sample"
              title={<>Partner with a <span className="italic text-honey">reliable exporter</span></>}
              lead="Partner with a reliable Indian exporter committed to long-term business relationships and uncompromised quality. Share your required product specifications, packaging preferences, and destination port — our export team will respond within 24 business hours."
            />
          </Reveal>
          <ul className="mt-8 space-y-2 text-center text-sm text-cream/80">
            <li>Export Desk Email: hello@magnaecobites.com</li>
            <li>Website: www.magnaecobites.com</li>
            <li>Headquarters: Kolathur, Chennai, Tamil Nadu, India</li>
          </ul>
          <div className="mt-8 rounded-[2rem] bg-white p-6 text-ink shadow-lift md:p-8">
            <EnquiryForm type="export" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
