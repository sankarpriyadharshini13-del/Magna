"use client";

import SiteShell from "@/components/layout/SiteShell";
import { ArrowIcon, CheckIcon, FactoryIcon, LeafIcon, StoreIcon } from "@/components/ui/Icons";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

export default function BusinessPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="For Business"
              title={<>Quality ingredients for <span className="italic text-clay">your business</span></>}
              lead="From restaurants to retail stores, we supply traditional South Indian podis and country sugar in bulk quantities."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Who we serve"
              title="Partner with us"
              lead="We work with businesses across India that value authentic, traditional ingredients."
            />
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Reveal delay={60} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf/10 text-leaf">
                <StoreIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Restaurants & Cafés</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Traditional idli podi, moringa podi and country sugar for your kitchen. Consistent quality, authentic taste.
              </p>
            </Reveal>

            <Reveal delay={120} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay/10 text-clay">
                <FactoryIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Retail Stores</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Stock our products on your shelves. Attractive packaging, competitive wholesale pricing, and reliable supply.
              </p>
            </Reveal>

            <Reveal delay={180} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-honey/10 text-honey">
                <LeafIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Catering & Events</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Wedding functions, corporate events, and special occasions. Bulk orders with custom packaging options.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-sand/45 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Why choose us"
              title="Quality you can trust"
              lead="What makes Magna Eco Bites the right partner for your business."
            />
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Carefully prepared with quality ingredients — authentic taste, consistent quality.",
              "Natural ingredients — no preservatives, no artificial colours",
              "Flexible order quantities — from trial packs to bulk orders",
              "Competitive wholesale pricing with volume discounts",
              "Reliable supply chain — timely delivery across India",
              "Custom packaging options available for bulk orders",
            ].map((item, i) => (
              <Reveal key={i} delay={i * 40} className="flex items-start gap-4 rounded-xl bg-white/60 p-5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-cream">
                  <CheckIcon width={12} height={12} />
                </span>
                <span className="text-sm leading-relaxed text-ink/80">{item}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-2xl border border-forest/10 bg-white p-6 shadow-lift md:p-8">
              <SectionHeading
                eyebrow="Get in touch"
                title="Ready to partner?"
                lead="Tell us about your business and requirements. We'll get back to you within 24 hours."
              />
              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const body = `Business Name: ${d.get("business")}\nContact Person: ${d.get("name")}\nPhone: ${d.get("phone")}\nEmail: ${d.get("email")}\n\n${d.get("message")}`;
                  window.location.href = `mailto:hello@magnaecobites.com?subject=${encodeURIComponent("Business enquiry")}&body=${encodeURIComponent(body)}`;
                }}
              >
                <div>
                  <label htmlFor="b-business" className="mb-2 block text-sm font-semibold text-forest">Business Name</label>
                  <input id="b-business" name="business" required type="text" placeholder="Your business name" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="b-name" className="mb-2 block text-sm font-semibold text-forest">Contact Person</label>
                    <input id="b-name" name="name" required type="text" placeholder="Your name" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                  <div>
                    <label htmlFor="b-phone" className="mb-2 block text-sm font-semibold text-forest">Phone</label>
                    <input id="b-phone" name="phone" required type="tel" placeholder="Your phone number" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                </div>
                <div>
                  <label htmlFor="b-email" className="mb-2 block text-sm font-semibold text-forest">Email</label>
                  <input id="b-email" name="email" required type="email" placeholder="your@email.com" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div>
                  <label htmlFor="b-message" className="mb-2 block text-sm font-semibold text-forest">Your Requirements</label>
                  <textarea id="b-message" name="message" required rows={4} placeholder="Tell us about your business and what you need" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15 resize-none" />
                </div>
                <button type="submit" className="btn-primary group">
                  Send enquiry <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-xs text-ink/50">Opens your email app with the message ready to send.</p>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
