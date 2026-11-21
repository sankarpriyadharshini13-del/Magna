"use client";

import SiteShell from "@/components/layout/SiteShell";
import { CheckIcon, ShipIcon } from "@/components/ui/Icons";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

const advantages = [
  "No preservatives or artificial colours — just lentils, spices, moringa leaf and country sugar",
  "Made in small batches in our own kitchen — not a mass-produced line",
  "Packed in Chennai, India — behind every pack is a kitchen we run ourselves",
  "Traditional recipes with authentic South Indian taste",
  "Flexible quantities — from samples to bulk shipments",
  "Direct contact with the team that makes your order — no agents in between",
];

const steps = [
  { step: "01", title: "Enquiry", desc: "Tell us the products, quantity and destination country." },
  { step: "02", title: "Quote", desc: "We send pricing, minimum order quantity and shipping terms." },
  { step: "03", title: "Sample", desc: "We arrange samples so you can approve the quality before ordering." },
  { step: "04", title: "Shipment", desc: "We produce, pack and dispatch once you approve the order." },
];

export default function ExportPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Export"
              title={<>Traditional taste, <span className="italic text-clay">global reach</span></>}
              lead="We supply Idli Podi, Moringa Idli Podi and Country Sugar to international buyers — made in our own kitchen in Chennai, India."
              action={{ href: "#enquire", label: "Send an enquiry" }}
            />
          </Reveal>
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
              eyebrow="Why import from us"
              title={<>Made in Chennai, <span className="italic text-honey">India</span></>}
              lead="Quality ingredients, traditional recipes and a family-run kitchen behind every pack."
            />
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {advantages.map((item, i) => (
              <Reveal key={i} delay={i * 50} className="flex items-start gap-4 rounded-2xl bg-cream/[0.05] p-5 ring-1 ring-cream/10">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-honey text-forest">
                  <CheckIcon width={12} height={12} />
                </span>
                <span className="text-sm leading-relaxed text-cream/80">{item}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand/45 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Export process"
              title="How it works"
              lead="Simple steps from enquiry to shipment."
            />
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 80} className="relative">
                <div className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-forest text-cream">
                    <ShipIcon width={22} height={22} />
                  </span>
                  <span className="mt-4 block font-display text-sm font-bold text-clay">Step {s.step}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-forest">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-24 bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-lift md:p-10">
              <SectionHeading
                align="center"
                eyebrow="Get started"
                title="Export enquiry"
                lead="Share the products, quantity and destination country — we'll reply with pricing and shipping options."
              />
              <EnquiryForm type="export" />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
