import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";
import SectionHeading from "@/components/home/SectionHeading";
import ReviewsBrowser from "@/components/reviews/ReviewsBrowser";
import { ReviewStars } from "@/components/reviews/ReviewCard";
import { ArrowIcon } from "@/components/ui/Icons";
import { getReviewStats, getReviewsPage } from "@/lib/server/publicReviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer reviews | Magna Eco Bites",
  description: "Reviews shared by Magna Eco Bites customers after ordering from our shop.",
};

export default async function ReviewsPage() {
  const [page, stats] = await Promise.all([getReviewsPage({ limit: 12 }), getReviewStats()]);
  const fiveStar = stats.total ? Math.round((stats.distribution[0] / stats.total) * 100) : 0;
  const facts = [
    { label: "Average", value: stats.average.toFixed(1), note: "out of 5" },
    { label: "Reviews", value: String(stats.total), note: "in total" },
    { label: "5-star", value: `${fiveStar}%`, note: "of reviews" },
  ];

  return (
    <SiteShell>
      <section
        aria-labelledby="reviews-page-title"
        className="relative overflow-hidden bg-gradient-to-b from-forest to-forest-deep text-cream"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "36px 36px" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-honey/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-leaf/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-cream/55 sm:text-sm">
            <Link href="/" className="focus-ring rounded hover:text-honey">Home</Link> <span aria-hidden="true">/</span>{" "}
            <span aria-current="page" className="text-cream">Reviews</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="min-w-0 lg:col-span-7">
              <SectionHeading
                as="h1"
                id="reviews-page-title"
                tone="dark"
                eyebrow="Customer reviews"
                title={<>What our customers <span className="italic text-honey">say</span></>}
                lead="Every note below was written by a customer after their Magna Eco Bites order was delivered."
              />
              {stats.total > 0 && (
                <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <ReviewStars value={Math.round(stats.average)} size={17} />
                  <span className="text-sm text-cream/70">
                    {stats.average.toFixed(1)} out of 5 · {stats.total} review{stats.total === 1 ? "" : "s"}
                  </span>
                </p>
              )}
            </div>

            <dl className="grid grid-cols-3 gap-3 lg:col-span-5">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-2xl border border-cream/15 bg-cream/[0.06] px-3 py-4 text-center backdrop-blur"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream/55 sm:text-[11px]">{f.label}</dt>
                  <dd className="mt-1.5 font-display text-2xl leading-none text-cream sm:text-3xl">{f.value}</dd>
                  <dd className="mt-1.5 text-[11px] leading-tight text-cream/50">{f.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-cream pb-16 pt-10 sm:pt-12 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {stats.total === 0 ? (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft ring-1 ring-forest/[0.06]">
              <h2 className="font-display text-2xl text-forest">No reviews yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/65">
                Reviews appear here after customers receive their orders. Bought from us already? Share your experience
                from My orders.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/orders" className="btn-secondary">Review an order</Link>
                <Link href="/shop" className="btn-primary">Browse the shop</Link>
              </div>
            </div>
          ) : (
            <ReviewsBrowser stats={stats} initial={page.reviews} initialHasMore={page.hasMore} />
          )}

          <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-forest px-6 py-8 text-cream shadow-lift sm:mt-16 sm:px-10 sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-honey/15 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-honey">
                  <span aria-hidden="true" className="h-px w-6 bg-honey/70" />
                  Bought from us?
                </p>
                <p className="mt-3 font-display text-2xl leading-snug text-cream sm:text-3xl">
                  Your words help another home kitchen choose.
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/65">
                  Every delivered order can be reviewed from My orders — it takes a minute and helps us cook better.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link
                  href="/orders"
                  className="focus-ring group inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-honey"
                >
                  Review an order
                  <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/shop"
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-cream hover:text-forest"
                >
                  Back to the shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
