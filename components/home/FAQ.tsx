"use client";

import { useId, useState } from "react";
import { faqs } from "@/data/brand";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";

/**
 * FAQ: one centred heading, then the questions and answers as a quiet accordion card.
 * The first answer is open so the section never looks like an empty list.
 */
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative overflow-hidden bg-cream py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-honey/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 id="faq-title" className="text-center font-display text-[2rem] leading-[1.1] tracking-tight text-forest sm:text-4xl md:text-5xl">
            Frequently asked questions
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <ul className="mt-10 divide-y divide-forest/[0.08] rounded-[1.75rem] bg-white px-5 shadow-soft ring-1 ring-forest/[0.06] sm:mt-12 sm:px-8">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              const button = `${baseId}-q${i}`;
              const panel = `${baseId}-a${i}`;
              return (
                <li key={f.q}>
                  <h3>
                    <button
                      type="button"
                      id={button}
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      className="focus-ring group flex w-full items-start justify-between gap-5 rounded py-5 text-left sm:py-6"
                    >
                      <span className={`font-display text-base leading-snug transition-colors sm:text-lg ${isOpen ? "text-clay" : "text-forest group-hover:text-clay"}`}>
                        {f.q}
                      </span>
                      <span
                        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                          isOpen ? "bg-forest text-cream" : "bg-sand text-forest group-hover:bg-sand/70"
                        }`}
                      >
                        {isOpen ? <MinusIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panel}
                    role="region"
                    aria-labelledby={button}
                    className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <p className="overflow-hidden pr-12 text-sm leading-relaxed text-ink/70 sm:text-[15px]">{f.a}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
