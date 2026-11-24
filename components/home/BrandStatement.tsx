import { HandSproutIcon, HeartIcon, LandscapeIcon, LeafIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const highlights = [
  { title: "Natural & Pure", body: "Wholesome ingredients, chosen one by one", Icon: LeafIcon },
  { title: "Eco-Friendly", body: "A greener tomorrow, packed with care", Icon: HandSproutIcon },
  { title: "Healthy Living", body: "Goodness in every bite, every day", Icon: HeartIcon },
  { title: "Rooted in Nature", body: "Tradition you can trust", Icon: LandscapeIcon },
];

/**
 * "Why Magna Eco Bites" — the brand statement on the home page. Typography follows the
 * same rules as every other section (SectionHeading for the eyebrow, title and lead, the
 * display face for card titles, the body face for copy) so it reads as part of one site.
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

        <div className="mt-12 grid gap-5 md:mt-14 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-[1.75rem] bg-forest p-7 text-cream shadow-soft sm:p-9">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-honey sm:text-xs">
                <span aria-hidden="true" className="h-px w-6 bg-honey/70" />
                Our promise
              </p>
              <p className="mt-4 font-display text-xl leading-snug sm:text-2xl">
                Good food is the foundation of a better life.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-cream/75 sm:text-[15px]">
                <b className="font-semibold text-cream">Conscious choices.</b> The way we grow, choose and consume food
                matters. Today, growing awareness of food quality, natural farming and environmental sustainability is
                inspiring people to make more conscious food choices.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cream/75 sm:text-[15px]">
                <b className="font-semibold text-cream">Foundation of life.</b> We believe good food is the foundation of
                a better life. We bring you closer to nature&apos;s goodness, where mindful choices meet the joy of
                everyday living.
              </p>
            </div>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
            {highlights.map(({ title, body, Icon }, i) => (
              <li key={title} className="h-full">
                <Reveal delay={i * 80} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-forest/[0.07] bg-white/70 p-5 transition-colors hover:border-leaf/30 hover:bg-white sm:p-6">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-leaf/10 text-leaf">
                      <Icon width={22} height={22} strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-4 font-display text-lg text-forest sm:text-xl">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/65 sm:text-[15px]">{body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
