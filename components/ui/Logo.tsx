import Image from "next/image";
import Link from "next/link";

/**
 * Horizontal brand lockup, matching the reference artwork exactly:
 * the engraved circular emblem on the left and a centred wordmark stack on the
 * right — "MAGNA" (the artwork's leaf-cut letterforms), "— ECO BITES —" and
 * "Connecting your soul with nature"
 *
 * MAGNA and the emblem are cropped from the master logo (green for light
 * surfaces, cream for dark ones) so the leaf details and engraving survive, and
 * the two supporting lines are set in Cormorant Garamond. All sizes are derived
 * from `--brand-wm` (rendered ink width of MAGNA) and `--brand-stack` (width of
 * the two lower lines) in `app/globals.css`, so every part keeps its proportion
 * at every breakpoint.
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
        sizes="56px"
        className="brand-lockup__emblem"
      />

      {/* Wordmark stack — every line is centred under the one above it. */}
      <span className="brand-lockup__stack">
        <Image
          src={onDark ? "/images/magna-wordmark-cream.png" : "/images/magna-wordmark-green.png"}
          alt=""
          width={480}
          height={78}
          priority={priority}
          sizes="110px"
          className="brand-lockup__mark"
        />
        <span className="brand-lockup__eco">
          <span aria-hidden="true" className="brand-lockup__eco-rule" />
          <span className="brand-lockup__eco-text">Eco Bites</span>
          <span aria-hidden="true" className="brand-lockup__eco-rule" />
        </span>
        <span className="brand-lockup__tag">Connecting your soul with nature</span>
      </span>
    </Link>
  );
}

