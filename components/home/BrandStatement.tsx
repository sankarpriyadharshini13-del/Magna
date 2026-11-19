import { SproutIcon, CheckIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const brandPoints = [
  {
    icon: "conscious",
    title: "Conscious Choices",
    body: "The way we grow, choose and consume food matters. Today, growing awareness of food quality, natural farming and environmental sustainability is inspiring people to make more conscious food choices.",
    Icon: SproutIcon,
  },
  {
    icon: "foundation",
    title: "Foundation of Life",
    body: "We believe good food is the foundation of a better life. We bring you closer to nature's goodness, where mindful choices meet the joy of everyday living.",
    Icon: CheckIcon,
  },
];

export default function BrandStatement() {
  return (
    <section id="brand" aria-labelledby="brand-title" className="relative overflow-hidden bg-cream py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-6 h-64 w-64 rounded-full bg-honey/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-leaf/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="brand-title"
            eyebrow="WHY MAGNA BITES?"
            title={<>Connecting You with the <span className="italic text-clay">Goodness of Nature</span></>}
            lead="The soil is the great connector of lives - the healer and restorer of our world."
          />
        </Reveal>

        <div className="mt-12 space-y-4 sm:mt-16">
          {brandPoints.map((point, i) => {
            const Icon = point.Icon;
            return (
              <Reveal key={point.icon} delay={i * 100}>
                <div className="flex gap-4 rounded-2xl border border-forest/[0.07] bg-white/70 p-5 transition-colors hover:border-leaf/30 hover:bg-white">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-leaf/10 text-leaf">
                    <Icon width={22} height={22} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-forest sm:text-xl">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/65 sm:text-[15px]">{point.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={300}>
          <div className="mt-12 rounded-[1.75rem] bg-forest p-8 text-cream sm:mt-16 sm:p-10 md:p-12 text-center">
            <p className="font-display text-xl leading-relaxed sm:text-2xl">
              Don't Just Choose It. <span className="text-honey font-bold">Experience It.</span>
            </p>
            <p className="mt-4 font-display text-lg font-bold sm:text-xl sm:mt-6">
              Buy it. Taste it. Feel the difference.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
