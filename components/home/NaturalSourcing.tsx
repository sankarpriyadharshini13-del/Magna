import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { sourcingPhoto, sourcingPrinciples } from "@/data/brand";
import { ArrowIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const sourcingIconBase: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 48 48",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
};

const IngredientsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sourcingIconBase} {...props}>
    <path d="M24 40V21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M24 27C12 27 9 18 10 9c9-1 16 3 18 12" fill="currentColor" />
    <path d="M24 23C24 12 32 7 40 8c1 9-4 16-16 19Z" fill="#F2C66D" />
    <path d="M12 40h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const LocalProductionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sourcingIconBase} {...props}>
    <path d="m4 23 15-13 15 13v19H4V23Z" fill="currentColor" />
    <path d="M14 42V29h10v13" fill="#F2C66D" />
    <path d="M34 4c-5 0-8.5 3.8-8.5 8.5C25.5 18.2 34 26 34 26s8.5-7.8 8.5-13.5C42.5 7.8 39 4 34 4Z" fill="#F2C66D" />
    <circle cx="34" cy="12.5" r="2.7" fill="#3B5A3A" />
  </svg>
);

const GoodnessIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sourcingIconBase} {...props}>
    <path d="m24 7 16 9v17l-16 9-16-9V16l16-9Z" fill="currentColor" />
    <path d="m8 16 16 9 16-9M24 25v17" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 22.5s-6.5-4-6.5-8.1a3.8 3.8 0 0 1 6.5-2.7 3.8 3.8 0 0 1 6.5 2.7c0 4.1-6.5 8.1-6.5 8.1Z" fill="#F2C66D" />
  </svg>
);

const icons = { chosen: IngredientsIcon, made: LocalProductionIcon, goodness: GoodnessIcon };

export default function NaturalSourcing({ learnMore = true }: { learnMore?: boolean }) {
  return (
    <section id="sourcing" aria-labelledby="sourcing-title" className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-24">
      {/* Subtle background ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-honey/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-stretch gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        {/* Left Column: Sourcing Editorial Photo — stretches from the first line of copy to the last */}
        <div className="order-2 lg:order-1 lg:col-span-5 lg:h-full">
          <Reveal className="h-full">
            <figure className="relative mx-auto flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] bg-sand shadow-lift ring-1 ring-forest/[0.08]">
              <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:min-h-0 lg:flex-1">
                <Image
                  src={sourcingPhoto.src}
                  alt={sourcingPhoto.alt}
                  fill
                  sizes="(min-width:1280px) 480px, (min-width:1024px) 42vw, (min-width:640px) 70vw, 92vw"
                  className="object-cover"
                />
                {/* Soft ambient gradient overlay to guarantee text legibility */}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent" />
              </div>
              
              {/* Integrated sleek caption card inside the image container */}
              <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest/90 p-5 text-cream shadow-lift ring-1 ring-white/10 backdrop-blur-md sm:inset-x-5 sm:bottom-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-honey">{sourcingPhoto.place}</p>
                <p className="mt-1.5 font-display text-base leading-snug sm:text-lg">{sourcingPhoto.caption}</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Right Column: Heading & Sourcing Steps */}
        <div className="order-1 flex flex-col lg:order-2 lg:col-span-7">
          <Reveal>
            <SectionHeading
              id="sourcing-title"
              eyebrow="Thoughtfully sourced"
              title={<>Good food begins with <span className="italic text-clay">good ingredients</span></>}
              lead="We believe that good food starts with the quality of its ingredients. That's why we carefully select our ingredients and pay attention to every step of preparation and packaging."
            />
          </Reveal>

          <ol className="mt-8 space-y-4">
            {sourcingPrinciples.map((p, i) => {
              const Icon = icons[p.key];
              return (
                <li key={p.key}>
                  <Reveal delay={i * 90} className="h-full">
                    <div className="group flex h-full gap-4 rounded-2xl border border-forest/[0.08] bg-white/80 p-5 shadow-soft transition-all duration-300 hover:border-leaf/30 hover:bg-white hover:shadow-lift sm:gap-5 sm:p-6">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-leaf/10 text-forest transition-transform duration-300 group-hover:scale-110">
                        <Icon width={26} height={26} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold leading-snug text-forest sm:text-xl">{p.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/70 sm:text-[15px]">{p.body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>

          {learnMore && (
            <Reveal delay={300} className="mt-8">
              <Link
                href="/about#sourcing"
                className="focus-ring group inline-flex items-center gap-2 self-start rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lift"
              >
                See how we work
                <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
