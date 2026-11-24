import Link from "next/link";
import type { PublicReview, ReviewStats } from "@/lib/server/publicReviews";
import { ReviewStars } from "@/components/reviews/ReviewCard";
import ReviewCarousel from "@/components/reviews/ReviewCarousel";
import { ArrowIcon, CheckIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Home page Reviews section, shown only while at least one review is "Live on website" (Admin → Reviews).
 * A deep-forest band: heading and a rating scorecard above a swipeable row of the latest reviews,
 * with a link through to every review on /reviews.
 */
export default function Reviews({ reviews, stats }: { reviews: PublicReview[]; stats: ReviewStats }) {
  if (!reviews.length) return null;
  const remaining = stats.total - reviews.length;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="relative overflow-hidden bg-forest py-16 text-cream md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "34px 34px" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-4 h-80 w-80 rounded-full bg-honey/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-leaf/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <Reveal className="min-w-0 lg:col-span-7">
            <SectionHeading
              id="reviews-title"
              tone="dark"
              eyebrow="Customer reviews"
              title={
                <>
                  What our customers <span className="italic text-honey">say</span>
                </>
              }
              lead="Notes from home kitchens that cook with us — written after their order arrived."
            />
          </Reveal>

          <Reveal delay={110} className="min-w-0 lg:col-span-5 lg:justify-self-end">
            <div className="flex items-center gap-5 rounded-[1.75rem] border border-cream/15 bg-cream/[0.06] px-5 py-4 sm:gap-6 sm:px-6 sm:py-5">
              <div className="shrink-0 text-center">
                <p className="font-display text-[2.5rem] leading-none text-cream sm:text-5xl">{stats.average.toFixed(1)}</p>
                <ReviewStars value={Math.round(stats.average)} size={14} className="mt-2 justify-center" />
              </div>
              <div className="border-l border-cream/15 pl-5 sm:pl-6">
                <p className="font-display text-lg leading-tight text-cream">
                  {stats.total} review{stats.total === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-cream/60">
                  Every review comes from a<br className="hidden sm:block" /> customer who ordered from us
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="mt-10 min-w-0 md:mt-12">
          <ReviewCarousel reviews={reviews} tone="dark" />
        </Reveal>

        <Reveal delay={210}>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-cream/15 pt-6 sm:flex-row sm:items-center">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-cream/60">
              <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-honey" />
              Only customers whose order was delivered can leave a review.
            </p>
            <Link
              href="/reviews"
              className="focus-ring group inline-flex shrink-0 items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-honey"
            >
              {remaining > 0 ? `Read all ${stats.total} reviews` : "Read all reviews"}
              <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
