/**
 * Brand statement band that sits between the hero and the shop section.
 * The card is pinned under the sticky header, so it floats on screen for the
 * length of the band and is released once the shop section scrolls up to it.
 */
export default function BrandStatement() {
  return (
    <section aria-label="About Magna Eco Bites" className="relative bg-sand/30 py-12 sm:py-14 md:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-6 h-64 w-64 rounded-full bg-honey/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-leaf/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="sticky top-[5.25rem]">
          <div className="rounded-[1.5rem] border border-forest/10 bg-white/75 px-6 py-8 shadow-lift backdrop-blur-sm sm:rounded-[1.75rem] sm:px-10 sm:py-10 md:rounded-[2rem] md:px-12 md:py-12">
            <p className="font-display text-[1.05rem] leading-[1.8] text-forest/90 sm:text-[1.15rem] md:text-[1.25rem]">
              Magna Eco Bites draws inspiration from traditional South Indian cooking — stone-ground podis, slow methods and the care that goes into every step.
            </p>
            <p className="mt-4 font-display text-[1.05rem] leading-[1.8] text-forest/70 sm:mt-5 sm:text-[1.15rem] md:text-[1.25rem]">
              We are family-run from Kolathur, Chennai, close to where our ingredients come from and to the people we cook for.
            </p>
          </div>
        </div>

        {/* Travel room for the pinned card — it floats until the shop section arrives. */}
        <div aria-hidden="true" className="h-20 sm:h-28 md:h-40" />
      </div>
    </section>
  );
}
