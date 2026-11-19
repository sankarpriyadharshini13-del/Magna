import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ArrowIcon, MailIcon, PinIcon } from "@/components/ui/Icons";
import { site } from "@/data/site";

/* Social marks are drawn inline (stroke-matched to the icon set in ui/Icons)
   so the footer doesn't rely on emoji glyphs that render differently per OS. */
const socialBase = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const InstagramMark = () => (
  <svg {...socialBase}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="16.9" cy="7.1" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookMark = () => (
  <svg {...socialBase} fill="currentColor" stroke="none">
    <path d="M13.6 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.8.2-1.4 1.5-1.4h1.5V4.8c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v1.9H8v2.9h2.5V21h3.1Z" />
  </svg>
);

const WhatsAppMark = () => (
  <svg {...socialBase}>
    <path d="M20.4 11.9a8.4 8.4 0 0 1-12.5 7.3L3.6 20.4l1.2-4.1a8.4 8.4 0 1 1 15.6-4.4Z" />
    <path d="M16.6 14.2c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4 0-.5.1l-.7.9c-.1.2-.3.2-.5.1-.6-.3-1.2-.7-1.7-1.2-.4-.5-.8-1.1-1.1-1.7-.1-.2 0-.4.1-.5l.7-.8c.1-.2.1-.4 0-.5l-.8-1.7c-.1-.2-.2-.3-.4-.3h-.6c-.2 0-.5.1-.7.3-.5.5-.8 1.2-.7 1.9.2 1.5.9 2.9 1.9 4 1.1 1.1 2.5 1.8 4 2 .7.1 1.4-.2 1.9-.7.2-.2.3-.5.3-.7v-.6c0-.2-.1-.3-.2-.4Z" />
  </svg>
);

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/magnaecobites", Icon: InstagramMark },
  { name: "Facebook", href: "https://facebook.com/magnaecobites", Icon: FacebookMark },
  { name: "WhatsApp", href: "https://wa.me/919876543210", Icon: WhatsAppMark },
];

const exploreLinks = [...site.nav, { href: "/#contact", label: "Contact" }];

const policies = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/shipping", label: "Shipping Policy" },
  { href: "/returns", label: "Returns & Refunds" },
];

const headingClass = "text-[11px] font-bold uppercase tracking-[0.24em] text-honey";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-forest to-forest-deep text-cream/70">
      {/* Honey hairline along the top edge, echoing the accents used across sections */}
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-honey/60 to-transparent" />

      {/* Decorative pattern */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-honey/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-12 xl:gap-x-12">
          {/* Brand */}
          <div className="sm:col-span-2 xl:col-span-4">
            <Logo onDark />
            <p className="mt-7 font-display text-[1.6rem] leading-[1.22] text-cream sm:text-[1.75rem]">
              A little tradition.
            </p>
            <p className="mt-4 max-w-[21rem] text-sm leading-relaxed text-cream/60">
              Carefully prepared and packed with care in our kitchen.
            </p>
            <div className="mt-7 flex gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-cream/15 bg-cream/[0.04] text-cream/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-honey/50 hover:bg-honey/10 hover:text-honey"
                >
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Explore — row links with a trailing arrow, the reference footer's signature move */}
          <nav aria-label="Explore" className="sm:col-span-2 xl:col-span-3">
            <h2 className={headingClass}>Explore</h2>
            <ul className="mt-4 border-t border-cream/10">
              {exploreLinks.map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  <Link
                    href={l.href}
                    className="focus-ring group flex items-center justify-between gap-3 border-b border-cream/10 py-3 text-[15px] font-medium text-cream/85 transition-colors duration-200 hover:text-honey"
                  >
                    <span>{l.label}</span>
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cream/15 text-cream/45 transition-all duration-200 group-hover:border-honey/50 group-hover:bg-honey/10 group-hover:text-honey"
                    >
                      <ArrowIcon width={13} height={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Policies */}
          <nav aria-label="Policies" className="sm:col-span-1 xl:col-span-2">
            <h2 className={headingClass}>Policies</h2>
            <ul className="mt-7 space-y-3.5">
              {policies.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="focus-ring rounded text-sm leading-relaxed text-cream/75 transition-colors duration-200 hover:text-honey"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Reach us — the reference footer's rounded info panel */}
          <div className="sm:col-span-1 xl:col-span-3">
            <h2 className={headingClass}>Reach us</h2>
            <div className="mt-4 rounded-2xl border border-cream/10 bg-cream/[0.04] p-5">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-honey/12 text-honey ring-1 ring-inset ring-honey/25">
                    <PinIcon width={18} height={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-cream">{site.location}</span>
                    <span className="mt-0.5 block text-xs text-cream/60">Tamil Nadu, India</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-honey/12 text-honey ring-1 ring-inset ring-honey/25">
                    <MailIcon width={18} height={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-cream">Email us</span>
                    <a
                      href={`mailto:${site.email}`}
                      className="focus-ring mt-0.5 block break-all rounded text-xs text-cream/65 transition-colors duration-200 hover:text-honey"
                    >
                      {site.email}
                    </a>
                  </span>
                </li>
                {site.phone && (
                  <li className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-honey/12 text-honey ring-1 ring-inset ring-honey/25">
                      <MailIcon width={18} height={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-cream">Call us</span>
                      <a
                        href={`tel:${site.phone}`}
                        className="focus-ring mt-0.5 block rounded text-xs text-cream/65 transition-colors duration-200 hover:text-honey"
                      >
                        {site.phone}
                      </a>
                    </span>
                  </li>
                )}
              </ul>
              <a
                href="https://maps.google.com/?q=Chennai"
                target="_blank"
                rel="noreferrer"
                className="focus-ring group mt-5 flex items-center justify-between gap-2 rounded border-t border-cream/10 pt-4 text-xs font-semibold text-cream/65 transition-colors duration-200 hover:text-honey"
              >
                Open in Maps
                <ArrowIcon width={14} height={14} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-cream/55">
            © {new Date().getFullYear()} Magna Eco Bites. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs">
            <a
              href="#top"
              className="focus-ring group inline-flex items-center gap-2 rounded-full font-semibold text-cream/65 transition-colors duration-200 hover:text-honey"
            >
              Back to top
              <span
                aria-hidden="true"
                className="grid h-7 w-7 place-items-center rounded-full border border-cream/15 transition-all duration-200 group-hover:border-honey/50 group-hover:bg-honey/10"
              >
                <ArrowIcon width={13} height={13} className="-rotate-90" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
