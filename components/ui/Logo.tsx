import Image from "next/image";
import Link from "next/link";

/**
 * Brand lockup: the real logo artwork from /public/images/LOGO 2.png is shown
 * cropped to its circular emblem (positioned with CSS, so the original file is
 * used as-is), followed by the lockup wording set in the logo's own style —
 * uppercase serif "MAGNA" above wide-tracked "ECO BITES".
 */
export default function Logo({ onDark = false, priority = false }: { onDark?: boolean; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Magna Eco Bites — home" className="focus-ring group inline-flex items-center gap-3 rounded-xl">
      <span
        className={`relative block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cream shadow-soft ring-1 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14 ${
          onDark ? "ring-cream/25" : "ring-leaf/10"
        }`}
      >
        <Image
          src="/images/LOGO 2.png"
          alt=""
          width={1254}
          height={1254}
          priority={priority}
          sizes="96px"
          className="absolute max-w-none"
          style={{ width: "151.3%", height: "151.3%", left: "-26.1%", top: "-4.2%" }}
        />
      </span>
      <span className="flex flex-col items-start whitespace-nowrap leading-none">
        <span
          className={`block font-display text-[1.25rem] font-bold uppercase leading-none tracking-[0.08em] sm:text-[1.4rem] md:text-[1.5rem] ${
            onDark ? "text-cream" : "text-forest"
          }`}
        >
          Magna
        </span>
        <span
          className={`mt-1.5 flex items-center gap-1.5 text-[0.55rem] font-bold uppercase leading-none tracking-[0.32em] sm:text-[0.6rem] ${
            onDark ? "text-cream/85" : "text-forest/75"
          }`}
        >
          <span aria-hidden="true" className="h-px w-2.5 shrink-0 bg-current sm:w-3.5" />
          Eco Bites
          <span aria-hidden="true" className="h-px w-2.5 shrink-0 bg-current sm:w-3.5" />
        </span>
        <span
          className={`mt-3 text-[0.6rem] font-bold uppercase leading-none tracking-[0.2em] sm:text-[0.65rem] ${
            onDark ? "text-cream/90" : "text-forest/80"
          }`}
        >
          Pure Nature. Powerful You
        </span>
      </span>
    </Link>
  );
}

