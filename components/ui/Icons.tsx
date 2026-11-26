import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};
type P = SVGProps<SVGSVGElement>;

export const SearchIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const UserIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const LogOutIcon = (p: P) => (
  <svg {...base} width={18} height={18} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
);
/** Padlock — password / security affordances. */
export const LockIcon = (p: P) => (
  <svg {...base} {...p}><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
/** Shield with a check — account security panels. */
export const ShieldIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const BagIcon = (p: P) => (
  <svg {...base} {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const ArrowIcon = (p: P) => (
  <svg {...base} width={18} height={18} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const LeafIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
export const OilPressIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v3M8 6h8" />
    <path d="M9 6v3l-5 3 1 5 7 4 7-4 1-5-5-3V6" />
    <path d="m4 12 8 3 8-3M12 15v6" />
  </svg>
);
export const PlusIcon = (p: P) => (<svg {...base} width={16} height={16} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const MinusIcon = (p: P) => (<svg {...base} width={16} height={16} {...p}><path d="M5 12h14" /></svg>);
export const TrashIcon = (p: P) => (
  <svg {...base} width={18} height={18} {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
export const PinIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const StoneIcon = (p: P) => (
  <svg {...base} {...p}><ellipse cx="12" cy="8" rx="8" ry="3" /><path d="M4 8v4c0 1.7 3.6 3 8 3s8-1.3 8-3V8" /><path d="M7 15v4M17 15v4M12 15v5" /></svg>
);
export const FamilyIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="8" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 8 0" /></svg>
);
export const SproutIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 21v-9" /><path d="M12 12C12 8 9 5 4 5c0 5 3 7 8 7Z" /><path d="M12 14c0-3 2.5-6 8-6 0 4.5-3 6-8 6Z" /></svg>
);
export const HandSproutIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 13V8.5" />
    <path d="M12 10.5C12 8.2 10.2 6.5 7 6.5c0 2.7 1.7 4 5 4Z" />
    <path d="M12 11.5c0-2.3 1.8-3.7 5-3.7 0 2.5-1.6 3.7-5 3.7Z" />
    <path d="M3.5 15.5h2.7c.5 0 1 .2 1.4.5l1.7 1.4h3" />
    <path d="M3.5 15.5v3.2c0 1.3 1.1 2.3 2.4 2.3h4.8c.7 0 1.4-.3 2-.7l4.3-3.5a1.3 1.3 0 0 0-1.7-2l-2.6 2.1" />
  </svg>
);
export const HeartIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>
);
export const LandscapeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 20h20" />
    <path d="M2 20c2.6-2.4 5-3.6 7.4-3.6" />
    <path d="M22 20c-2.6-2.4-5-3.6-7.4-3.6" />
    <path d="M9 20v-4.4L12 13l3 2.6V20" />
    <path d="M12 20v-2.6" />
    <path d="M5.5 20v-3.8" />
    <path d="m4 17 1.5-1.4L7 17" />
    <path d="M18.5 20v-3.8" />
    <path d="m17 17 1.5-1.4L20 17" />
  </svg>
);
/** Filled two-leaf sprig used as the decorative rule ornament. */
export const LeafPairIcon = (p: P) => (
  <svg {...base} width={30} height={30} {...p}>
    <path d="M12 21v-6" />
    <path d="M12 15.5c-1.2-4.6-4.3-7.2-8-7.2.4 4.6 3.2 7.2 8 7.2Z" fill="currentColor" stroke="none" />
    <path d="M12 15.5c1.2-4.6 4.3-7.2 8-7.2-.4 4.6-3.2 7.2-8 7.2Z" fill="currentColor" stroke="none" />
  </svg>
);
export const BasketIcon = (p: P) => (
  <svg {...base} {...p}><path d="M3 10h18l-2 10H5L3 10Z" /><path d="m8 10 4-6 4 6M9 14v3M15 14v3M12 14v3" /></svg>
);
export const MailIcon = (p: P) => (
  <svg {...base} {...p}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} width={16} height={16} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
export const ChevronIcon = (p: P) => (
  <svg {...base} width={18} height={18} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const FactoryIcon = (p: P) => (
  <svg {...base} {...p}><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M17 18h1" /><path d="M12 18h1" /><path d="M7 18h1" /></svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
);
export const MapPinIcon = (p: P) => (
  <svg {...base} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const TruckIcon = (p: P) => (
  <svg {...base} {...p}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
);
export const PackageIcon = (p: P) => (
  <svg {...base} {...p}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);
export const ShipIcon = (p: P) => (
  <svg {...base} {...p}><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.9 5.8 2.38 8" /><path d="M12 10V4" /><path d="m15 6-3-3-3 3" /></svg>
);
export const StoreIcon = (p: P) => (
  <svg {...base} {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
);
