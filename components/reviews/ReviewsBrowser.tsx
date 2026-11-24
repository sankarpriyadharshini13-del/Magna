"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CheckIcon } from "@/components/ui/Icons";
import RatingSummary, { type RatingStats } from "./RatingSummary";
import ReviewCard, { type ReviewCardData } from "./ReviewCard";

const PAGE = 12;

/** /reviews: rating summary that filters by stars, a masonry grid of reviews and "Load more". */
export default function ReviewsBrowser({
  stats,
  initial,
  initialHasMore,
}: {
  stats: RatingStats;
  initial: ReviewCardData[];
  initialHasMore: boolean;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  /** True while a star filter reloads the list (vs. "Load more" appending). */
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);

  const load = async (nextRating: number | null, offset: number) => {
    const id = ++request.current;
    setLoading(true);
    setReplacing(offset === 0);
    setError("");
    try {
      const q = new URLSearchParams({ offset: String(offset), limit: String(PAGE) });
      if (nextRating) q.set("rating", String(nextRating));
      const res = await fetch(`/api/reviews?${q}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const body = (await res.json()) as { reviews: ReviewCardData[]; hasMore: boolean };
      if (id !== request.current) return; // a newer filter click won
      setItems((prev) => (offset ? [...prev, ...body.reviews.filter((r) => !prev.some((p) => p.id === r.id))] : body.reviews));
      setHasMore(body.hasMore);
    } catch {
      if (id === request.current) setError("Reviews couldn't be loaded. Please try again.");
    } finally {
      if (id === request.current) setLoading(false);
    }
  };

  const choose = (r: number | null) => {
    setRating(r);
    load(r, 0);
  };

  const shownTotal = rating ? stats.distribution[5 - rating] : stats.total;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <aside className="min-w-0 lg:col-span-4 xl:col-span-3">
        <div className="rounded-[1.75rem] bg-white p-5 shadow-soft ring-1 ring-forest/[0.06] sm:p-6 lg:sticky lg:top-28">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl leading-tight text-forest">Rating overview</h2>
            {rating && (
              <button
                type="button"
                onClick={() => choose(null)}
                className="focus-ring shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-clay transition-colors hover:bg-clay/10"
              >
                Clear
              </button>
            )}
          </div>

          <RatingSummary stats={stats} active={rating} onSelect={choose} className="mt-4" />

          <p className="mt-4 text-xs text-ink/50">Tap a rating to filter. Tap it again to show everything.</p>

          <div className="mt-5 rounded-2xl bg-sand/50 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-leaf">
              <CheckIcon width={13} height={13} />
              Verified purchases
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink/60">
              Only customers whose order was delivered can leave a review.{" "}
              <Link
                href="/orders"
                className="focus-ring rounded font-semibold text-forest underline decoration-forest/25 underline-offset-2 hover:decoration-forest"
              >
                Review one of your orders
              </Link>
              .
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:col-span-8 xl:col-span-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/60" role="status" aria-live="polite">
            {loading && !items.length ? (
              "Loading reviews…"
            ) : (
              <>
                Showing <span className="font-semibold text-forest">{items.length}</span> of {shownTotal}{" "}
                {rating ? `${rating}-star ` : ""}review{shownTotal === 1 ? "" : "s"}
              </>
            )}
          </p>
          {rating && (
            <button
              type="button"
              onClick={() => choose(null)}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-1.5 text-sm font-semibold text-forest transition-colors hover:border-forest"
            >
              <span aria-hidden="true" className="text-honey">★</span>
              {rating}-star only
              <span aria-hidden="true" className="text-ink/40">×</span>
              <span className="sr-only"> — show all ratings</span>
            </button>
          )}
        </div>

        {items.length === 0 && !loading ? (
          <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-soft ring-1 ring-forest/[0.06] sm:p-10">
            <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-leaf/10 text-leaf">
              <CheckIcon width={22} height={22} />
            </span>
            <p className="mt-4 font-display text-xl text-forest">
              {error ? "Reviews couldn't be loaded" : "No reviews with this rating yet"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
              {error ||
                (rating
                  ? `Nobody has rated us ${rating} star${rating === 1 ? "" : "s"} yet — the other reviews are still worth a read.`
                  : "Reviews appear here as soon as customers share them after delivery.")}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {error ? (
                <button type="button" className="btn-secondary" onClick={() => load(rating, 0)}>
                  Try again
                </button>
              ) : (
                <>
                  {rating && (
                    <button type="button" className="btn-secondary" onClick={() => choose(null)}>
                      Show all reviews
                    </button>
                  )}
                  <Link href="/shop" className="btn-primary">
                    Browse the shop
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          // CSS columns let short and long reviews pack neatly without big gaps.
          <ul className={`gap-5 transition-opacity sm:columns-2 xl:columns-3 ${loading && replacing ? "opacity-50" : ""}`}>
            {items.map((r) => (
              <li key={r.id} className="mb-5 break-inside-avoid">
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
        )}

        {error && items.length > 0 && <p role="alert" className="mt-4 text-center text-sm font-medium text-clay">{error}</p>}

        {hasMore ? (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="btn-secondary min-w-48 disabled:opacity-60"
              disabled={loading}
              onClick={() => load(rating, items.length)}
            >
              {loading && !replacing ? "Loading…" : "Load more reviews"}
            </button>
            <p className="mt-3 text-xs text-ink/45">
              {Math.max(shownTotal - items.length, 0)} more to read
            </p>
          </div>
        ) : items.length > 0 ? (
          <p className="mt-8 border-t border-forest/10 pt-6 text-center text-sm text-ink/45">
            You’ve reached the end · {stats.total} review{stats.total === 1 ? "" : "s"} in total
          </p>
        ) : null}
      </div>
    </div>
  );
}
