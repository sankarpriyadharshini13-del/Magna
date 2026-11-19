"use client";

import SiteShell from "@/components/layout/SiteShell";
import { ArrowIcon, CheckIcon, GlobeIcon, MapPinIcon, TruckIcon } from "@/components/ui/Icons";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

export default function DistributorsPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Distributors"
              title={<>Join our <span className="italic text-clay">distribution network</span></>}
              lead="Partner with us to bring authentic South Indian podis and country sugar to customers in your region."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Why distribute Magna Eco Bites"
              title="A growing brand with real demand"
              lead="Traditional products that customers love, backed by quality manufacturing."
            />
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Reveal delay={60} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf/10 text-leaf">
                <GlobeIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Growing Market</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Increasing demand for authentic, traditional food products. Customers are looking for real taste and natural ingredients.
              </p>
            </Reveal>

            <Reveal delay={120} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay/10 text-clay">
                <TruckIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Quality Products</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
   Carefully prepared with quality ingredients, no added preservatives, and authentic taste. Products that speak for themselves.              </p>
            </Reveal>

            <Reveal delay={180} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-honey/10 text-honey">
                <MapPinIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Regional Exclusivity</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Protect your investment with territorial rights. We work with one distributor per region.
              </p>
            </Reveal>

            <Reveal delay={240} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest/10 text-forest">
                <CheckIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Marketing Support</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Marketing materials, product displays, and promotional support to help you sell effectively.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-sand/45 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we look for"
              title="Distributor requirements"
              lead="We partner with distributors who share our commitment to quality."
            />
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Experience in food distribution and FMCG products",
              "Established distribution network in your region",
              "Storage facilities for food products (cool, dry)",
              "Sales team to reach retail stores and restaurants",
              "Financial stability to manage inventory",
              "Commitment to brand representation and quality",
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
                eyebrow="Apply now"
                title="Become a distributor"
                lead="Share your details and region. We'll review and get back to you within 3 business days."
              />
              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const body = `Company Name: ${d.get("company")}\nContact Person: ${d.get("name")}\nPhone: ${d.get("phone")}\nEmail: ${d.get("email")}\nRegion: ${d.get("region")}\nCurrent Distribution: ${d.get("current")}\n\n${d.get("message")}`;
                  window.location.href = `mailto:hello@magnaecobites.com?subject=${encodeURIComponent("Distributor enquiry")}&body=${encodeURIComponent(body)}`;
                }}
              >
                <div>
                  <label htmlFor="d-company" className="mb-2 block text-sm font-semibold text-forest">Company Name</label>
                  <input id="d-company" name="company" required type="text" placeholder="Your company name" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="d-name" className="mb-2 block text-sm font-semibold text-forest">Contact Person</label>
                    <input id="d-name" name="name" required type="text" placeholder="Your name" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                  <div>
                    <label htmlFor="d-phone" className="mb-2 block text-sm font-semibold text-forest">Phone</label>
                    <input id="d-phone" name="phone" required type="tel" placeholder="Your phone number" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                </div>
                <div>
                  <label htmlFor="d-email" className="mb-2 block text-sm font-semibold text-forest">Email</label>
                  <input id="d-email" name="email" required type="email" placeholder="your@email.com" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div>
                  <label htmlFor="d-region" className="mb-2 block text-sm font-semibold text-forest">Region / Territory</label>
                  <input id="d-region" name="region" required type="text" placeholder="City, district or state you want to cover" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div>
                  <label htmlFor="d-current" className="mb-2 block text-sm font-semibold text-forest">Current Distribution Experience</label>
                  <textarea id="d-current" name="current" required rows={3} placeholder="Briefly describe your current distribution business and products you handle" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15 resize-none" />
                </div>
                <div>
                  <label htmlFor="d-message" className="mb-2 block text-sm font-semibold text-forest">Additional Information</label>
                  <textarea id="d-message" name="message" rows={3} placeholder="Any other details you'd like to share" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15 resize-none" />
                </div>
                <button type="submit" className="btn-primary group">
                  Submit application <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
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
