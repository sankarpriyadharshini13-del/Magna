"use client";

import { ReviewStars } from "./ReviewCard";

export interface RatingStats {
  total: number;
  average: number;
  /** index 0 = 5 stars … index 4 = 1 star */
  distribution: number[];
}

/**
 * Average, stars and the per-star split of the reviews live on the site. With `onSelect` each row
 * becomes a filter button (used on /reviews); without it the rows are plain.
 */
export default function RatingSummary({
  stats,
  active = null,
  onSelect,
  className = "",
}: {
  stats: RatingStats;
  active?: number | null;
  onSelect?: (rating: number | null) => void;
  className?: string;
}) {
  const max = Math.max(1, ...stats.distribution);
  const pctOf = (count: number) => (stats.total ? Math.round((count / stats.total) * 100) : 0);

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-center">
          <p className="font-display text-5xl leading-none text-forest">{stats.average.toFixed(1)}</p>
          <ReviewStars value={Math.round(stats.average)} size={16} className="mt-2 justify-center" />
        </div>
        <div className="min-w-0 border-l border-forest/10 pl-4">
          <p className="text-sm font-semibold text-forest">
            {stats.total} review{stats.total === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink/55">from verified purchases</p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5" aria-label="Reviews by star rating">
        {stats.distribution.map((count, i) => {
          const stars = 5 - i;
          const on = active === stars;
          const row = (
            <>
              <span className="w-8 shrink-0 text-left text-xs font-semibold text-forest">{stars} ★</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-forest/[0.08]">
                <span
                  className={`block h-full rounded-full transition-all duration-300 ${on ? "bg-forest" : "bg-honey"}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </span>
              <span className="w-[3.75rem] shrink-0 text-right text-[11px] tabular-nums text-ink/50">
                {count} · {pctOf(count)}%
              </span>
            </>
          );
          return (
            <li key={stars}>
              {onSelect ? (
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${stars} star reviews: ${count}`}
                  disabled={!count && !on}
                  onClick={() => onSelect(on ? null : stars)}
                  className={`focus-ring flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors disabled:cursor-default disabled:opacity-40 ${
                    on ? "bg-honey/15 ring-1 ring-honey/40" : "hover:bg-sand/60"
                  }`}
                >
                  {row}
                </button>
              ) : (
                <div className="flex items-center gap-2.5 px-2 py-1" aria-label={`${stars} star reviews: ${count}`}>
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
