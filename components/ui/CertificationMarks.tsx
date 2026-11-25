import type { SVGProps } from "react";

/**
 * The two registration marks shown on the export page (FSSAI and MSME/Udyam).
 *
 * They are drawn as a matching pair of seals — same outer ring, same 64-unit grid — so the two
 * read as one set of credentials rather than two pasted images. Each is pure `currentColor`
 * vector art, so it inherits the surrounding text colour and stays crisp at any size.
 *
 * To use the official artwork instead, drop the files into `public/images/certifications/` and
 * swap the `<…Mark />` element in `app/export/page.tsx` for an `<Image />` — nothing else changes.
 */

const seal: SVGProps<SVGSVGElement> = {
  width: 64,
  height: 64,
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};
type P = SVGProps<SVGSVGElement>;

/** Food safety: a shielded tick inside the seal ring. */
export const FssaiMark = (p: P) => (
  <svg {...seal} {...p}>
    <circle cx="32" cy="32" r="28.5" />
    <path d="M32 15.4 45 20.4v12.1c0 7.9-5.4 13.2-13 16-7.6-2.8-13-8.1-13-16V20.4Z" />
    <path d="m26.2 31.8 4.4 4.5 8.4-9.4" />
  </svg>
);

/** Enterprise registration: an industry hexagon with three rising bars. */
export const MsmeMark = (p: P) => (
  <svg {...seal} {...p}>
    <circle cx="32" cy="32" r="28.5" />
    <path d="M32 13.6 48 22.9v18.2L32 50.4 16 41.1V22.9Z" />
    <rect x="23.2" y="33.4" width="4" height="7.8" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="30" y="29.4" width="4" height="11.8" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="36.8" y="25.4" width="4" height="15.8" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
);
