type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "subheading"; text: string };

export type PolicySection = { heading: string; blocks: Block[] };

/**
 * Shared layout for the legal / policy pages (Privacy Policy, Terms & Conditions, Shipping Policy).
 * Purely presentational — the content is passed in by each page.
 */
export default function PolicyArticle({
  title,
  updated,
  lead,
  sections,
}: {
  title: string;
  updated: string;
  lead?: string[];
  sections: PolicySection[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14 md:py-20 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay sm:text-xs">Policies</p>
      <h1 className="mt-3 font-display text-4xl text-forest md:text-5xl">{title}</h1>
      <p className="mt-4 text-sm text-ink/60">Last Updated: {updated}</p>

      {lead?.map((p, i) => (
        <p key={i} className="mt-6 text-sm leading-relaxed text-ink/75 sm:text-base">{p}</p>
      ))}

      <div className="mt-12 space-y-12">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl font-semibold text-forest">{s.heading}</h2>
            <div className="mt-3 space-y-4">
              {s.blocks.map((b, i) => {
                if (b.kind === "paragraph") {
                  return <p key={i} className="text-sm leading-relaxed text-ink/75 sm:text-base">{b.text}</p>;
                }
                if (b.kind === "bullets") {
                  return (
                    <ul key={i} className="space-y-2.5">
                      {b.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75 sm:text-base">
                          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <h3 key={i} className="pt-1 font-display text-lg font-semibold text-forest">{b.text}</h3>;
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
