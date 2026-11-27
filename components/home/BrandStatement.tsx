import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/** The four everyday promises, presented as concise text-only cards. */
const pillars = [
  {
    title: "Natural & Pure",
    body: "Wholesome ingredients, chosen one by one",
    wash: "hover:border-leaf/30",
  },
  {
    title: "Eco-Friendly",
    body: "A greener tomorrow, packed with care",
    wash: "hover:border-honey/40",
  },
  {
    title: "Healthy Living",
    body: "Goodness in every bite, every day",
    wash: "hover:border-clay/30",
  },
  {
    title: "Rooted in Nature",
    body: "Tradition you can trust",
    wash: "hover:border-forest/30",
  },
];

/** The brand promise and its two supporting ideas in one lead paragraph. */
const promise = (
  <>
    The soil is the great connector of lives — the healer and restorer of our world.{" "}
    <strong className="font-semibold text-forest">Conscious Choices:</strong>{" "}
    The way we grow, choose and consume food matters. Today, growing awareness of food quality,
    natural farming, and environmental sustainability is inspiring people to make mindful food
    choices. <strong className="font-semibold text-forest">Rooted in Tradition:</strong>{" "}
    We believe wholesome, pure food is the cornerstone of daily vitality. We bring you closer to
    nature&apos;s goodness, where authentic heritage meets the simple joy of healthy everyday living.
  </>
);

/**
 * "Why Magna Eco Bites" — a single brand paragraph above four text-only
 * promise cards, set on a warm sand band between the hero and the sourcing story.
 */
export default function BrandStatement() {
  return (
    <section
      id="brand"
      aria-labelledby="brand-title"
      className="relative overflow-hidden bg-sand/50 py-16 sm:py-20 md:py-24"
    >
      {/* Warm ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-honey/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
      {/* Hairline seam so the sand band reads as its own chapter */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading
              id="brand-title"
              align="center"
              eyebrow="Why Magna Eco Bites"
              title={<>Connecting you with the <span className="italic text-clay">goodness of nature</span></>}
              lead={promise}
            />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 lg:gap-6">
          {pillars.map(({ title, body, wash }, i) => (
            <Reveal key={title} delay={100 + i * 90} className="h-full">
              <article
                className={`group relative flex h-full min-h-44 flex-col rounded-[1.75rem] border border-forest/10 bg-white/85 p-6 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lift sm:p-7 ${wash}`}
              >
                <h3 className="font-display text-xl font-semibold leading-snug text-forest">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70 sm:text-[15px]">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
