import { HandSproutIcon, HeartIcon, LandscapeIcon, LeafIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const highlights = [
  {
    title: "Natural & Pure",
    body: "Wholesome ingredients, chosen one by one",
    Icon: LeafIcon,
    accent: "bg-leaf",
    chip: "bg-leaf/10 text-leaf group-hover:bg-leaf group-hover:text-cream",
    border: "border-leaf/20",
    wash: "hover:border-leaf/30",
  },
  {
    title: "Eco-Friendly",
    body: "A greener tomorrow, packed with care",
    Icon: HandSproutIcon,
    accent: "bg-honey",
    chip: "bg-honey/15 text-[#9a6a12] group-hover:bg-honey group-hover:text-forest",
    border: "border-honey/20",
    wash: "hover:border-honey/35",
  },
  {
    title: "Healthy Living",
    body: "Goodness in every bite, every day",
    Icon: HeartIcon,
    accent: "bg-clay",
    chip: "bg-clay/10 text-clay group-hover:bg-clay group-hover:text-white",
    border: "border-clay/20",
    wash: "hover:border-clay/30",
  },
  {
    title: "Rooted in Nature",
    body: "Tradition you can trust",
    Icon: LandscapeIcon,
    accent: "bg-forest",
    chip: "bg-forest/10 text-forest group-hover:bg-forest group-hover:text-cream",
    border: "border-forest/20",
    wash: "hover:border-forest/30",
  },
];

/**
 * "Why Magna Eco Bites" — redesigned with harmonious alignment,
 * balanced visual hierarchy, and polished modern organic aesthetics.
 */
export default function BrandStatement() {
  return (
    <section
      id="brand"
      aria-labelledby="brand-title"
      className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-24"
    >
      {/* Decorative ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-12 h-80 w-80 rounded-full bg-honey/15 blur-3xl animate-float" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-leaf/10 blur-3xl animate-float-delayed" />

      {/* Subtle organic bottom hill curve */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 opacity-40">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-12 w-full fill-[#e5edd6] sm:h-16">
          <path d="M0 60C240 20 480 20 720 50C960 80 1200 80 1440 40V120H0Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading — perfectly centered */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading
              id="brand-title"
              align="center"
              eyebrow="Why Magna Eco Bites"
              title={<>Connecting you with the <span className="italic text-clay">goodness of nature</span></>}
              lead="The soil is the great connector of lives — the healer and restorer of our world."
            />
          </div>
        </Reveal>

        {/* Our Promise Spotlight Card */}
        <Reveal delay={120}>
          <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-forest/10 bg-white/80 p-7 shadow-soft backdrop-blur-sm sm:p-10 md:mt-14 lg:p-12">
            {/* Subtle decorative background gradient & watermark */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sand/60 blur-2xl" />
            
            <div className="relative mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-forest/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-honey" aria-hidden="true" />
                Our Promise
              </span>
              <h3 className="mt-4 font-display text-2xl font-medium tracking-tight text-forest sm:text-3xl md:text-[2.25rem] md:leading-tight">
                Good food is the foundation of a <span className="italic text-clay">better life</span>.
              </h3>
            </div>

            {/* Two balanced columns for Conscious Choices & Foundation of Life */}
            <div className="relative mt-8 grid gap-6 sm:grid-cols-2 md:mt-10 lg:gap-8">
              <article className="flex flex-col rounded-2xl border border-forest/[0.08] bg-cream/40 p-6 transition-all duration-300 hover:border-leaf/30 hover:bg-white hover:shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf/10 text-leaf">
                    <LeafIcon width={20} height={20} />
                  </span>
                  <h4 className="font-display text-lg font-semibold text-forest">Conscious Choices</h4>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/75 sm:text-[15px]">
                  The way we grow, choose and consume food matters. Today, growing awareness of food quality, natural farming, and environmental sustainability is inspiring people to make mindful food choices.
                </p>
              </article>

              <article className="flex flex-col rounded-2xl border border-forest/[0.08] bg-cream/40 p-6 transition-all duration-300 hover:border-clay/30 hover:bg-white hover:shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-clay/10 text-clay">
                    <HeartIcon width={20} height={20} />
                  </span>
                  <h4 className="font-display text-lg font-semibold text-forest">Rooted in Tradition</h4>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/75 sm:text-[15px]">
                  We believe wholesome, pure food is the cornerstone of daily vitality. We bring you closer to nature&apos;s goodness, where authentic heritage meets the simple joy of healthy everyday living.
                </p>
              </article>
            </div>
          </div>
        </Reveal>

        {/* The Four Core Pillars with Centered, Symmetrical Grid */}
        <div className="mt-8 md:mt-10">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ title, body, Icon, accent, chip, wash }, i) => (
              <li key={title} className="h-full">
                <Reveal delay={150 + i * 90} className="h-full">
                  <article
                    className={`group relative flex h-full flex-col items-center rounded-[1.75rem] border border-forest/10 bg-white p-7 text-center shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ${wash}`}
                  >
                    {/* Step number badge */}
                    <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-forest/40">
                      Pillar 0{i + 1}
                    </span>

                    {/* Centered Icon with smooth hover animation */}
                    <div
                      className={`mt-4 grid h-16 w-16 place-items-center rounded-2xl shadow-soft transition-all duration-300 group-hover:scale-110 ${chip}`}
                    >
                      <Icon width={28} height={28} strokeWidth={1.6} />
                    </div>

                    {/* Title */}
                    <h4 className="mt-5 font-display text-xl font-semibold leading-snug text-forest">
                      {title}
                    </h4>

                    {/* Body */}
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">
                      {body}
                    </p>

                    {/* Expanding accent indicator on hover */}
                    <span
                      aria-hidden="true"
                      className={`mt-6 block h-1 w-8 rounded-full transition-all duration-300 group-hover:w-16 ${accent}`}
                    />
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
