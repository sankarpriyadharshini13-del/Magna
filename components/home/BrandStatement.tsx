import {
  HandSproutIcon,
  HeartIcon,
  LandscapeIcon,
  LeafIcon,
  LeafPairIcon,
} from "@/components/ui/Icons";
import Reveal from "./Reveal";

const highlights = [
  { title: "Natural & Pure", body: "Wholesome ingredients", Icon: LeafIcon },
  { title: "Eco-Friendly", body: "A greener tomorrow", Icon: HandSproutIcon },
  { title: "Healthy Living", body: "Goodness in every bite", Icon: HeartIcon },
  { title: "Rooted in Nature", body: "Tradition you can trust", Icon: LandscapeIcon },
];

/** Thin ruled line with a leaf sprig - the ornament that brackets the copy. */
function LeafDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 sm:gap-4 ${className}`}>
      <span className="h-px w-16 bg-leaf/40 sm:w-28 lg:w-36" />
      <LeafPairIcon width={30} height={30} className="shrink-0 text-leaf" />
      <span className="h-px w-16 bg-leaf/40 sm:w-28 lg:w-36" />
    </div>
  );
}

export default function BrandStatement() {
  return (
    <section
      id="brand"
      aria-labelledby="brand-title"
      className="relative overflow-hidden bg-cream pb-28 pt-12 sm:pt-14 md:pb-36 md:pt-16"
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
          <div className="mx-auto max-w-4xl text-center">
            <LeafDivider />
            <h2
              id="brand-title"
              className="mt-4 font-display text-[2rem] font-bold leading-[1.08] tracking-tight text-forest sm:text-[2.75rem] md:text-5xl lg:text-[3.25rem]"
            >
              Why Magna Eco Bites
            </h2>
            <p className="mt-2 font-display text-lg font-medium italic leading-tight text-forest sm:text-2xl md:whitespace-nowrap md:text-[1.75rem] lg:text-[2.1rem]">
              Connecting You with the <span className="font-semibold text-clay">Goodness of Nature</span>
            </p>
            <p className="mx-auto mt-5 max-w-3xl font-display text-base leading-relaxed text-ink/85 sm:text-lg lg:text-xl">
              The soil is the great connector of lives - the healer and restorer of our world.
            </p>
            <p className="mx-auto mt-5 max-w-3xl font-display text-[0.95rem] leading-[1.8] text-ink/80 sm:text-base lg:text-[1.125rem]">
              <b className="font-bold text-forest">Conscious choices.</b> The way we grow, choose and consume food matters.
              Today, growing awareness of food quality, natural farming and environmental sustainability is inspiring people
              to make more conscious food choices.{" "}
              <b className="font-bold text-forest">Foundation of life.</b> We believe good food is the foundation of a better
              life. We bring you closer to nature&apos;s goodness, where mindful choices meet the joy of everyday living.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {highlights.map(({ title, body, Icon }) => (
              <li
                key={title}
                className="flex flex-col items-center rounded-[1.25rem] bg-white px-5 py-7 text-center shadow-soft ring-1 ring-forest/[0.03]"
              >
                <Icon width={44} height={44} strokeWidth={1.5} className="text-leaf" />
                <h3 className="mt-4 font-display text-lg font-bold leading-tight text-forest sm:text-xl">{title}</h3>
                <p className="mt-1.5 text-[13px] text-ink/65 sm:text-sm">{body}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200}>
          <LeafDivider className="mt-12 sm:mt-14" />
        </Reveal>
      </div>
    </section>
  );
}
