import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import type { SVGProps } from "react";
import SiteShell from "@/components/layout/SiteShell";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { ArrowIcon, CheckIcon, GlobeIcon, MailIcon, PinIcon } from "@/components/ui/Icons";
import { productPages } from "@/lib/channels";
import { getPageVisibility } from "@/lib/server/pageVisibility";
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

const trust = [
  "Direct Farm-to-Port Traceability: We procure directly from trusted farmers and FPOs across Tamil Nadu and India, eliminating unnecessary middlemen and ensuring consistent crop quality.",
  "100% Natural Integrity: Zero synthetic colours, zero chemical preservatives, and zero adulteration — every batch undergoes strict moisture, purity, and grading checks prior to stuffing.",
  "Strategic Port Connectivity: Located in Chennai, offering rapid access to major international sea ports and air cargo terminals for timely global dispatch.",
  "Dedicated Export Desk: End-to-end documentation support, transparent pricing (FOB, CIF, CNF), and responsive communication from sample approval to final delivery.",
];

const certifications = [
  "Health Certificate: Officially issued food safety and hygiene certification validating suitability for international human consumption.",
  "IEC (Import Export Code): Directorate General of Foreign Trade (DGFT), Government of India.",
  "APEDA Registration: Agricultural and Processed Food Products Export Development Authority.",
  "FSSAI Central License: Food Safety and Standards Authority of India.",
  "MSME Udyam Certified: Ministry of Micro, Small & Medium Enterprises.",
  "Phytosanitary, Fumigation & Certificate of Origin (CoO): Issued per consignment as required by importing destination authorities.",
];

export default async function ExportPage() {
  const [allProducts, visibility] = await Promise.all([getPublicProducts(), getPageVisibility()]);
  const catalogueOpen = visibility.export !== false;
  const exportItems = catalogueOpen ? allProducts.filter((p) => productPages(p).includes("export")) : [];
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
                Delivering India&apos;s finest <span className="italic text-clay">GI-tagged &amp; natural agricultural treasures</span> to the world
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg sm:leading-relaxed">
                At <strong>Magna Eco Bites</strong>, we bridge the gap between India&apos;s richest agricultural heartlands and international markets. Based in Chennai, Tamil Nadu — one of India&apos;s premier maritime trade hubs — we are a trusted, certified exporter of authentic Geographical Indication (GI) products, cold-pressed oils, traditional spices, superfoods, and wholesome grains.
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg sm:leading-relaxed">
                Every shipment reflects our unwavering commitment to purity, farm-level traceability, and international quality standards — 100% natural, unrefined, and packed to preserve peak freshness across global transit.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a href="#enquire" className="btn-primary">
                  Request an Export Quote
                  <ArrowIcon width={16} height={16} />
                </a>
                <a href="#catalogue" className="btn-secondary">
                  Browse products
                </a>
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
          {!catalogueOpen ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/60 p-8 text-center text-ink/65">
              Our export catalogue is being updated — send an enquiry below and we&apos;ll share the current range.
            </p>
          ) : exportItems.length === 0 ? (
            <p className="mt-8 rounded-[1.5rem] bg-sand/60 p-8 text-center text-ink/65">Our export catalogue is being updated — send an enquiry and we&apos;ll share the current range.</p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exportItems.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} enquiryOnly page="export" />
                </li>
              ))}
            </ul>
          )}
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
              lead="Whether you are a boutique specialty store testing new SKUs or a large-scale importer stocking regional distribution centres, we tailor our logistics to your exact volume requirements:"
            />
          </Reveal>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {logistics.map((l, i) => (
              <Reveal key={l.title} delay={i * 90} className="h-full">
                <article className="group flex h-full flex-col rounded-[2rem] border border-forest/10 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:p-8">
                  <div className="flex items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest text-cream shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <l.Icon width={24} height={24} />
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

      {/* Certified Quality & Regulatory Compliance */}
      <section className="relative overflow-hidden bg-sand/40 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Registrations and consignment documents"
              title={<>Certified Quality &amp; <span className="italic text-clay">Regulatory Compliance</span></>}
              lead="Global trade demands complete transparency and strict adherence to statutory standards. Magna Eco Bites operates with full regulatory compliance to ensure smooth customs clearance at destination ports worldwide:"
            />
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {certifications.map((certification) => (
              <li key={certification} className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 text-sm leading-relaxed text-ink/75 shadow-soft">
                <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-cream">
                  <CheckIcon width={10} height={10} />
                </span>
                <span>{certification}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Global Importers Trust Us */}
      <section className="bg-cream py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Export partnerships"
              title={<>Why Global Importers Trust <span className="italic text-clay">Magna Eco Bites</span></>}
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
              eyebrow="Export enquiry"
              title={<>Request an Export Quote or <span className="italic text-honey">Product Sample</span></>}
              lead="Partner with a reliable Indian exporter committed to long-term business relationships and uncompromised quality. Share your required product specifications, packaging preferences, and destination port — our export team will respond within 24 hours with competitive FOB/CIF quotations."
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
