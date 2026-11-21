"use client";

import SiteShell from "@/components/layout/SiteShell";
import { CheckIcon, FactoryIcon, LeafIcon, StoreIcon } from "@/components/ui/Icons";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

const buyers = [
  {
    Icon: StoreIcon,
    title: "Restaurants & Cafés",
    body: "Idli Podi and Moringa Idli Podi for idli, dosa and hot rice, plus Country Sugar for payasam, tea and coffee. The same taste in every batch.",
  },
  {
    Icon: FactoryIcon,
    title: "Retail Stores",
    body: "Retail-ready packs of our full range — made in our Chennai kitchen, with clear labels your customers can trust.",
  },
  {
    Icon: LeafIcon,
    title: "Catering & Events",
    body: "Weddings, corporate events and festivals. Tell us your date and quantity, and we'll plan production and delivery around it.",
  },
];

const reasons = [
  "Stone-ground in our own Chennai kitchen — we control quality from grinding to packing",
  "Natural ingredients — no preservatives, no artificial colours",
  "Flexible quantities — start with a few packs and scale up to bulk orders",
  "Wholesale pricing that leaves room for your margin",
  "Sourced and packed locally — visit our kitchen and check the quality yourself",
  "A small, family-run team you can reach directly",
];

export default function BusinessPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="For Business"
              title={<>Quality ingredients for <span className="italic text-clay">your business</span></>}
              lead="We supply Idli Podi, Moringa Idli Podi and Country Sugar in wholesale quantities to restaurants, cafés, stores and caterers — made in our own kitchen in Chennai."
              action={{ href: "/shop", label: "See retail prices" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-sand/45 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Who we serve"
              title="Partner with us"
              lead="Tell us what your kitchen or shelf needs — we'll match it to our range."
            />
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {buyers.map((b, i) => (
              <Reveal key={b.title} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col rounded-[1.5rem] border border-forest/10 bg-white p-8 shadow-soft">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay/10 text-clay">
                    <b.Icon width={26} height={26} />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold text-forest">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{b.body}</p>
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
              eyebrow="Why choose us"
              title={<>Made the traditional way, <span className="italic text-honey">for your business</span></>}
            />
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {reasons.map((item, i) => (
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

      <section id="enquire" className="bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-lift md:p-10">
              <SectionHeading
                align="center"
                eyebrow="Get in touch"
                title="Ready to partner?"
                lead="Tell us the products and monthly quantity you need. We'll reply with wholesale pricing and lead times."
              />
              <EnquiryForm type="business" />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
