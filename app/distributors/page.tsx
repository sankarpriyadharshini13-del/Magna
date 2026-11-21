"use client";

import SiteShell from "@/components/layout/SiteShell";
import { CheckIcon, GlobeIcon, MapPinIcon, PackageIcon, TruckIcon } from "@/components/ui/Icons";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

const perks = [
  {
    Icon: GlobeIcon,
    title: "Growing Demand",
    body: "More customers are choosing authentic, traditional food products over mass-produced alternatives.",
  },
  {
    Icon: TruckIcon,
    title: "Quality You Can Stand Behind",
    body: "Clear labels and honest ingredients — a range your retailers can stock and sell with confidence.",
  },
  {
    Icon: MapPinIcon,
    title: "Made in Chennai",
    body: "Sourced and packed in Chennai — short lead times and a local team you can visit.",
  },
  {
    Icon: PackageIcon,
    title: "Direct Partnership",
    body: "You deal directly with the team that makes the products — clear pricing, quick answers and no layers in between.",
  },
];

const steps = [
  { step: "01", title: "Apply", desc: "Tell us about your business and the area you want to cover." },
  { step: "02", title: "We review", desc: "We review your details and agree on products, pricing and delivery terms." },
  { step: "03", title: "You stock & sell", desc: "We supply at wholesale rates; you place the products in stores and restaurant kitchens across your area." },
  { step: "04", title: "Reorder", desc: "Reorder whenever stocks run low — we pack and dispatch from our Chennai kitchen." },
];

const requirements = [
  "Experience in food distribution",
  "Established customer base in your region",
  "Proper storage for food products",
  "Ability to reach retail stores and restaurants",
  "Commitment to brand representation and quality",
];

export default function DistributorsPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Distributors"
              title={<>Join our <span className="italic text-clay">distribution network</span></>}
              lead="Bring Idli Podi, Moringa Idli Podi and Country Sugar to your region — supplied directly from our kitchen in Chennai."
              action={{ href: "#enquire", label: "Apply now" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-sand/45 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Why distribute Magna Eco Bites"
              title="A range that's easy to stock and sell"
              lead="Traditional podis and country sugar, made in our own kitchen in Chennai, with clear labels and retail-friendly pricing."
            />
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="h-full">
                <div className="flex h-full items-start gap-5 rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay">
                    <p.Icon width={24} height={24} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-forest">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest py-14 text-cream md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-clay/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-leaf/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="How it works"
              title={<>From application to <span className="italic text-honey">your shelf</span></>}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 100} className="relative rounded-[1.5rem] border border-cream/10 bg-cream/[0.04] p-6">
                <span className="absolute -right-2 -top-3 grid h-9 w-9 place-items-center rounded-full bg-clay font-display text-sm font-bold text-cream">{s.step}</span>
                <h3 className="font-display text-lg font-semibold text-cream">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/65">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                eyebrow="What we look for"
                title="Distributor requirements"
                lead="We partner with distributors who share our commitment to quality."
              />
              <ul className="mt-8 space-y-3">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-cream">
                      <CheckIcon width={10} height={10} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <div id="enquire" className="scroll-mt-24 rounded-[2rem] border border-forest/10 bg-white p-6 shadow-lift md:p-8">
                <SectionHeading
                  align="center"
                  eyebrow="Apply now"
                  title="Become a distributor"
                  lead="Share your business details and the area you want to cover. We'll review your application and get back to you."
                />
                <EnquiryForm type="distributor" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
