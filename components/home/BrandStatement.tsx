import { HandSproutIcon, HeartIcon, LandscapeIcon, LeafIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const highlights = [
  {
    title: "Natural & Pure",
    body: "Wholesome ingredients, chosen one by one",
    Icon: LeafIcon,
    accent: "bg-leaf",
    chip: "bg-leaf text-cream",
    wash: "to-leaf/[0.06]",
  },
  {
    title: "Eco-Friendly",
    body: "A greener tomorrow, packed with care",
    Icon: HandSproutIcon,
    accent: "bg-honey",
    chip: "bg-honey text-forest",
    wash: "to-honey/[0.12]",
  },
  {
    title: "Healthy Living",
    body: "Goodness in every bite, every day",
    Icon: HeartIcon,
    accent: "bg-clay",
    chip: "bg-clay text-white",
    wash: "to-clay/[0.06]",
  },
  {
    title: "Rooted in Nature",
    body: "Tradition you can trust",
    Icon: LandscapeIcon,
    accent: "bg-forest",
    chip: "bg-forest text-cream",
    wash: "to-forest/[0.06]",
  },
];

/**
 * "Why Magna Eco Bites" — the brand statement on the home page. Typography follows the
 * same rules as every other section (SectionHeading for the eyebrow, title and lead, the
 * display face for card titles, the body face for copy) so it reads as part of one site.
 *
 * Layout: the promise reads as one wide forest band across the top, then the four pillars
 * sit in a single row of cards (two-up on tablets, stacked on phones) so each one has room
 * for its icon, number and copy instead of being squeezed into a 2×2 block beside the band.
 */
export default function BrandStatement() {
  return (
    <section
      id="brand"
      aria-labelledby="brand-title"
      className="relative overflow-hidden bg-cream pb-28 pt-16 sm:pt-20 md:pb-36 md:pt-24"
    >
      {/* Soft green hill along the bottom edge, as in the brand artwork. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="h-16 w-full fill-[#e7efd7] sm:h-20 lg:h-24"
        >
          <path d="M0 78c150-42 300-46 460-16 160 30 320 44 480 20 160-24 320-36 500-10v88H0Z" />
        </svg>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-honey/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="brand-title"
            align="center"
            eyebrow="Why Magna Eco Bites"
            title={<>Connecting you with the <span className="italic text-clay">goodness of nature</span></>}
            lead="The soil is the great connector of lives — the healer and restorer of our world."
          />
        </Reveal>

        {/* Our promise — one wide forest band, split into statement + reasoning on desktop. */}
        <Reveal>
          <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-forest text-cream shadow-soft md:mt-14 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-11">
            {/* Hairline rings echo the seal without adding visual weight. */}
            <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 hidden h-64 w-64 rounded-full border border-honey/20 lg:block" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-24 hidden h-64 w-64 rounded-full border border-cream/10 lg:block" />

            <div className="relative p-7 sm:p-9 lg:p-0">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-honey sm:text-xs">
                <span aria-hidden="true" className="h-px w-6 bg-honey/70" />
                Our promise
              </p>
              <p className="mt-4 font-display text-2xl leading-snug sm:text-[1.75rem] lg:text-[2rem]">
                Good food is the foundation of a better life.
              </p>
            </div>

            <div className="relative space-y-4 border-t border-cream/15 p-7 pt-6 text-sm leading-relaxed text-cream/75 sm:p-9 sm:pt-6 sm:text-[15px] lg:space-y-5 lg:border-l lg:border-t-0 lg:p-0 lg:pl-14">
              <p>
                <b className="font-semibold text-cream">Conscious choices.</b> The way we grow, choose and consume food
                matters. Today, growing awareness of food quality, natural farming and environmental sustainability is
                inspiring people to make more conscious food choices.
              </p>
              <p>
                <b className="font-semibold text-cream">Foundation of life.</b> We believe good food is the foundation of
                a better life. We bring you closer to nature&apos;s goodness, where mindful choices meet the joy of
                everyday living.
              </p>
            </div>
          </div>
        </Reveal>

        {/* The four pillars: one row of colour-coded cards. */}
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:mt-6 lg:grid-cols-4 lg:gap-5">
          {highlights.map(({ title, body, Icon, accent, chip, wash }, i) => (
            <li key={title} className="h-full">
              <Reveal delay={i * 80} className="h-full">
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-forest/10 bg-gradient-to-b from-white p-6 shadow-[0_1px_2px_rgba(20,42,30,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-forest/20 hover:shadow-lift ${wash}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-soft transition-transform duration-300 group-hover:-rotate-6 ${chip}`}
                    >
                      <Icon width={24} height={24} strokeWidth={1.6} />
                    </span>
                    <span className="font-display text-xs font-semibold tracking-[0.28em] text-forest/30">
                      0{i + 1}
                    </span>
                  </div>

                  {/* Short accent rule that stretches on hover. */}
                  <span
                    aria-hidden="true"
                    className={`mt-5 block h-1 w-10 rounded-full transition-all duration-300 group-hover:w-16 ${accent}`}
                  />

                  <h3 className="mt-4 font-display text-xl leading-snug text-forest">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/65">{body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
