import Image from "next/image";
import Link from "next/link";

/**
 * Horizontal brand lockup, matching the master artwork: the engraved circular
 * emblem on the left, "MAGNA ECO BITES" set in the display serif (Fraunces) on a
 * single line — MAGNA in the lighter cut, ECO BITES in the heavier one — and the
 * slogan "Pure Nature. Powerful You." in spaced caps beneath it.
 *
 * Setting the name as text (rather than image crops) keeps it crisp at every
 * zoom level and lets it scale fluidly with the header. Every size is derived
 * from `--brand-fs` in `app/globals.css`, so the emblem, name and slogan keep
 * their proportions at every breakpoint.
 */
export default function Logo({ onDark = false, priority = false }: { onDark?: boolean; priority?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Magna Eco Bites — home"
      className={`brand-lockup focus-ring rounded-xl${onDark ? " brand-lockup--dark" : ""}`}
    >
      <Image
        src={onDark ? "/images/magna-emblem-cream.png" : "/images/magna-emblem-green.png"}
        alt=""
        width={320}
        height={320}
        priority={priority}
        sizes="48px"
        className="brand-lockup__emblem"
      />

      {/* Wordmark stack — the name on one line, the tagline centred beneath it. */}
      <span className="brand-lockup__stack">
        <span className="brand-lockup__wordmark">
          <span className="brand-lockup__mark">Magna</span>
          <span className="brand-lockup__name">Eco Bites</span>
        </span>
        <span className="brand-lockup__tag">
          <span className="brand-lockup__tag-line">{"Pure Nature. "}</span>
          <span className="brand-lockup__tag-line">Powerful You.</span>
        </span>
      </span>
    </Link>
  );
}

