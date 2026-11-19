"use client";

import SiteShell from "@/components/layout/SiteShell";
import { ArrowIcon, CheckIcon, GlobeIcon, PackageIcon } from "@/components/ui/Icons";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

export default function ExportPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Export"
              title={<>Traditional taste, <span className="italic text-clay">global reach</span></>}
              lead="Bringing authentic South Indian podis and country sugar to international markets."
            />
          </Reveal>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our products"
              title="What we export"
              lead="Traditional South Indian food products with authentic taste and quality."
            />
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Reveal delay={60} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf/10 text-leaf">
                <PackageIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Idli Podi</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
    Made with traditional lentils and spices, bringing the goodness of South Indian cooking to homes around the world.              </p>
            </Reveal>

            <Reveal delay={120} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay/10 text-clay">
                <PackageIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Moringa Idli Podi</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Classic idli podi blended with moringa leaf. Traditional taste with natural goodness.
              </p>
            </Reveal>

            <Reveal delay={180} className="rounded-2xl border border-forest/10 bg-white p-8 shadow-soft">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-honey/10 text-honey">
                <PackageIcon width={28} height={28} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-forest">Country Sugar</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Minimally processed country sugar from Tamil Nadu. Authentic golden colour and rich flavour.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-sand/45 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Export advantages"
              title="Why import from us"
              lead="Quality, authenticity, and reliable supply from Chennai, India."
            />
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Made with quality ingredients — authentic traditional taste",
              "Natural ingredients — no preservatives, no artificial colours",
              "International packaging standards — shelf-stable for export",
              "FSSAI certified — meets food safety regulations",
              "Reliable supply chain — consistent quality and timely delivery",
              "Custom labelling and packaging options available",
              "Competitive pricing with volume discounts",
              "Experience in export documentation and logistics",
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Export process"
              title="How it works"
              lead="Simple, transparent process from enquiry to delivery."
            />
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              { step: "01", title: "Enquiry", desc: "Share your requirements, quantity, and destination country." },
              { step: "02", title: "Quote", desc: "We provide pricing, MOQ, and shipping terms within 3 days." },
              { step: "03", title: "Sample", desc: "We can arrange samples for quality approval before bulk order." },
              { step: "04", title: "Shipment", desc: "Production, quality check, and export documentation." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 60} className="relative rounded-2xl border border-forest/10 bg-white p-6 shadow-soft">
                <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-clay text-[11px] font-bold text-cream">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-semibold text-forest">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand/45 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-2xl border border-forest/10 bg-white p-6 shadow-lift md:p-8">
              <SectionHeading
                eyebrow="Get started"
                title="Export enquiry"
                lead="Tell us about your requirements. We'll respond within 3 business days."
              />
              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const body = `Company Name: ${d.get("company")}\nContact Person: ${d.get("name")}\nPhone: ${d.get("phone")}\nEmail: ${d.get("email")}\nCountry: ${d.get("country")}\nProducts Interested: ${d.get("products")}\nQuantity: ${d.get("quantity")}\n\n${d.get("message")}`;
                  window.location.href = `mailto:hello@magnaecobites.com?subject=${encodeURIComponent("Export enquiry")}&body=${encodeURIComponent(body)}`;
                }}
              >
                <div>
                  <label htmlFor="e-company" className="mb-2 block text-sm font-semibold text-forest">Company Name</label>
                  <input id="e-company" name="company" required type="text" placeholder="Your company name" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="e-name" className="mb-2 block text-sm font-semibold text-forest">Contact Person</label>
                    <input id="e-name" name="name" required type="text" placeholder="Your name" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                  <div>
                    <label htmlFor="e-phone" className="mb-2 block text-sm font-semibold text-forest">Phone</label>
                    <input id="e-phone" name="phone" required type="tel" placeholder="Your phone number" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                </div>
                <div>
                  <label htmlFor="e-email" className="mb-2 block text-sm font-semibold text-forest">Email</label>
                  <input id="e-email" name="email" required type="email" placeholder="your@email.com" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div>
                  <label htmlFor="e-country" className="mb-2 block text-sm font-semibold text-forest">Country</label>
                  <input id="e-country" name="country" required type="text" placeholder="Destination country" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="e-products" className="mb-2 block text-sm font-semibold text-forest">Products Interested</label>
                    <input id="e-products" name="products" required type="text" placeholder="Idli Podi, Moringa Podi, Country Sugar" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                  <div>
                    <label htmlFor="e-quantity" className="mb-2 block text-sm font-semibold text-forest">Estimated Quantity</label>
                    <input id="e-quantity" name="quantity" required type="text" placeholder="e.g., 500 kg, 1000 units" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15" />
                  </div>
                </div>
                <div>
                  <label htmlFor="e-message" className="mb-2 block text-sm font-semibold text-forest">Additional Requirements</label>
                  <textarea id="e-message" name="message" rows={3} placeholder="Any specific packaging, labelling, or other requirements" className="w-full rounded-xl border border-forest/10 bg-cream/60 px-4 py-3 text-ink outline-none transition-all placeholder:text-ink/35 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/15 resize-none" />
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
