"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { faqs, type Faq, type FaqGroup } from "@/data/brand";
import { ArrowIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";

/** Category tag on each card; the number badge takes the group colour so groups stay distinct. */
const META: Record<FaqGroup, { label: string; badge: string }> = {
  products: { label: "Products", badge: "bg-sand text-forest/70" },
  kitchen: { label: "Storage & serving", badge: "bg-leaf/10 text-leaf" },
  orders: { label: "Orders & delivery", badge: "bg-honey/25 text-forest-deep" },
  business: { label: "Wholesale & export", badge: "bg-clay/10 text-clay" },
};

/** Start with the first answer open, matching the featured FAQ layout. */
const INITIAL_OPEN: string[] = [faqs[0]?.q].filter((question): question is string => Boolean(question));

/** All questions remain in their original, numbered order. */
const ALL_FAQS = faqs;

/**
 * Home page FAQ: the questions customers actually ask. The first answer opens by default in a
 * wide centred card; the rest sit in a calm two-column grid of numbered cards. Opening another
 * question moves it into the featured position.
 */
export default function FAQ() {
  const [open, setOpen] = useState<string[]>(INITIAL_OPEN);
  const baseId = useId();

  const toggle = (question: string) =>
    setOpen((prev) => (prev.includes(question) ? [] : [question]));

  /** One numbered question card. Declared inline so it can read `open` and `toggle`. */
  const card = (f: Faq, index: number, featured = false) => {
    const n = index + 1;
    const isOpen = open.includes(f.q);
    const questionId = `${baseId}-q${n}`;
    const panelId = `${baseId}-a${n}`;
    const meta = META[f.group];

    return (
      <li
        key={f.q}
        className={`overflow-hidden rounded-[20px] bg-white ring-1 transition-all duration-300 ${
          isOpen
            ? "ring-leaf/35 shadow-soft"
            : "ring-forest/[0.07] hover:ring-leaf/25 hover:shadow-soft"
        }`}
      >
        <h3>
          <button
            type="button"
            id={questionId}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => toggle(f.q)}
            className={`focus-ring flex w-full items-start gap-3 text-left sm:gap-4 ${
              featured ? "p-5 sm:p-7" : "p-4 sm:p-5"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold tabular-nums transition-colors ${
                isOpen ? "bg-forest text-cream" : meta.badge
              }`}
            >
              {String(n).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">
                {meta.label}
              </span>
              <span
                className={`block font-display leading-snug text-forest ${
                  featured ? "text-xl sm:text-2xl" : "text-[15px] sm:text-[17px]"
                }`}
              >
                {f.q}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
                isOpen ? "border-forest bg-forest text-cream" : "border-forest/15 text-forest"
              }`}
            >
              {isOpen ? <MinusIcon width={15} height={15} /> : <PlusIcon width={15} height={15} />}
            </span>
          </button>
        </h3>
        <div
          id={panelId}
          role="region"
          aria-labelledby={questionId}
          aria-hidden={!isOpen}
          className={`grid transition-all duration-300 ease-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className={`px-4 pb-5 sm:pb-7 ${featured ? "sm:px-7" : "sm:px-5"}`}>
              <div className={`border-t border-forest/[0.08] pt-5 ${featured ? "sm:ml-16 sm:pl-0" : "sm:ml-16"}`}>
                <p
                  className={`leading-relaxed text-ink/70 ${
                    featured ? "max-w-4xl text-base sm:text-lg" : "max-w-3xl text-sm sm:text-[15px]"
                  }`}
                >
                  {f.a}
                </p>
                {f.link && (
                  <Link
                    href={f.link.href}
                    className="focus-ring group mt-3 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-leaf transition-colors hover:text-forest"
                    tabIndex={isOpen ? undefined : -1}
                  >
                    {f.link.label}
                    <ArrowIcon
                      width={13}
                      height={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  };

  const featured = ALL_FAQS.find((f) => open.includes(f.q));
  const remaining = ALL_FAQS.filter((f) => f !== featured);

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative overflow-hidden bg-cream py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-sand/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-honey/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span aria-hidden="true" className="mx-auto block h-px w-10 bg-clay/60" />
          <h2
            id="faq-title"
            className="mt-4 font-display text-[2rem] leading-[1.1] tracking-tight text-forest sm:text-4xl md:text-5xl"
          >
            FAQ
          </h2>
        </Reveal>

        <div className="mt-8 md:mt-12">
          {featured && (
            <ul className="mb-4">
              {card(featured, ALL_FAQS.indexOf(featured), true)}
            </ul>
          )}
          <ul className="grid gap-3.5 md:grid-cols-2 md:gap-4">
            {remaining.map((f) => card(f, ALL_FAQS.indexOf(f)))}
          </ul>
        </div>
      </div>
    </section>
  );
}
