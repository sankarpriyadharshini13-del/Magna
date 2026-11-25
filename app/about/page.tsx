import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import { LeafIcon, SproutIcon, StoneIcon } from "@/components/ui/Icons";
import { team } from "@/data/brand";

const AVATAR = ["from-clay to-honey", "from-leaf to-forest", "from-honey to-clay"];

export const metadata: Metadata = {
  title: "About Us | Magna Eco Bites",
  description: "Magna Eco Bites crafts authentic, stone-ground South Indian pantry staples in small batches in Kolathur, Chennai — pure, natural and made the traditional way.",
};

const principles = [
  {
    Icon: SproutIcon,
    title: "Direct Farm Sourcing",
    body: "We partner closely with trusted farmers across Tamil Nadu to procure pure, unrefined ingredients straight from the harvest.",
  },
  {
    Icon: StoneIcon,
    title: "Traditional Stone Grinding",
    body: "By slowly stone-grinding our spices and lentils, we lock in natural essential oils, rich aroma, and authentic texture without heat damage.",
  },
  {
    Icon: LeafIcon,
    title: "100% Natural & Pure",
    body: "Zero artificial preservatives, zero synthetic colours, and zero hidden fillers — just clean, natural ingredients.",
  },
];

export default function AboutPage() {
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
              eyebrow="About Magna Eco Bites"
              title={<>Pure Nature. <span className="italic text-clay">Powerful You.</span></>}
              lead="At Magna Eco Bites, we believe that great food starts with patience, honesty, and respect for tradition. Rooted in Kolathur, Chennai, we craft authentic South Indian pantry staples — stone-ground podis, unrefined sweeteners, cold-pressed oils, and wholesome grain mixes — the exact way our grandmothers made them in their own kitchens."
            />
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section id="sourcing" className="bg-sand/45 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Our Philosophy"
              title={<>Made the Slow Way, <span className="italic text-clay">On Purpose</span></>}
              lead="Modern food processing often trades flavour and nutrition for speed. We choose the opposite path. Every batch at Magna Eco Bites is prepared in small quantities under the direct supervision of our founders, ensuring freshness you can taste and trust."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 80} className="h-full">
                <article className="h-full rounded-[1.5rem] border border-forest/10 bg-white p-7 shadow-soft transition-shadow hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-clay/10 text-clay">
                    <p.Icon width={22} height={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* From our kitchen to yours */}
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="From Our Kitchen to Yours"
              title={<>Everyday nourishment, <span className="italic text-clay">timeless flavour</span></>}
              lead="Whether it is a spoonful of our signature Idli Podi paired with sesame oil, nutrient-rich Moringa blends, or pure country sugar for your morning filter coffee, Magna Eco Bites brings everyday nourishment and timeless South Indian flavour to homes, restaurants, and communities worldwide."
            />
          </Reveal>
        </div>
      </section>

      {/* Short bio */}
      <section className="bg-forest py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <blockquote className="rounded-[1.5rem] border border-cream/10 bg-cream/[0.04] p-8 text-center md:p-10">
              <p className="font-display text-xl leading-relaxed text-cream sm:text-2xl">
                Magna Eco Bites brings you 100% natural, stone-ground South Indian staples crafted in small batches in Chennai. Sourced directly from Tamil Nadu farms and prepared without additives or shortcuts, we deliver pure, traditional flavours from our kitchen to yours.
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Our team"
              title={<>The people behind <span className="italic text-clay">Magna Bites</span></>}
            />
          </Reveal>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <li key={m.name}>
                <Reveal delay={i * 90} className="h-full">
                  <article className="flex h-full items-start gap-4 rounded-[1.5rem] bg-white p-6 shadow-soft ring-1 ring-forest/[0.06] transition-shadow hover:shadow-lift">
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${AVATAR[i % AVATAR.length]} font-display text-2xl text-cream`} aria-hidden="true">
                      {m.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg leading-tight text-forest">{m.name}</h3>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-clay">{m.role}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteShell>
  );
}

