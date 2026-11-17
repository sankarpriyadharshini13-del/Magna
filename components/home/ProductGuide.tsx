"use client";

import Link from "next/link";
import { ingredientGuide } from "@/data/dietary";
import { useProducts } from "@/context/ProductsContext";
import { CheckIcon, CloseIcon, LeafIcon } from "@/components/ui/Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * "Know your pack" table: Ingredient · Benefits · Who can eat & who should avoid, one row per product.
 * A real <table> on desktop that stacks into labelled cards below lg, so phones never scroll sideways.
 */
export default function ProductGuide() {
  const { products } = useProducts();
  // Rows link to product pages only when the pack exists in the live catalogue
  // (the fallback list is shorter than the full range).
  const findProduct = (slug: string) => products.find((p) => p.slug === slug);

  return (
    <section id="guide" aria-labelledby="guide-title" className="relative overflow-hidden bg-sand/45 py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-honey/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="guide-title"
            eyebrow="Know your pack"
            title={<>What&apos;s inside, what it brings, <span className="italic text-clay">and who it suits</span></>}
            lead={`Every Magna Eco Bites product in one place — the ingredients, the goodness they carry, who can eat it and who should avoid it. ${ingredientGuide.length} packs, three columns.`}
            action={{ href: "/shop", label: "Shop all products" }}
          />
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-forest/10 bg-white/70 shadow-soft backdrop-blur-sm sm:mt-12 sm:rounded-[1.75rem] lg:bg-white/80">
          <table className="block w-full border-collapse text-left lg:table">
            <caption className="sr-only">
              Ingredients, benefits, who can eat each Magna Eco Bites product and who should avoid it
            </caption>
            <thead className="hidden lg:table-header-group">
              <tr className="bg-forest text-cream">
                <th scope="col" className="w-[24%] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-honey">
                  Ingredient
                </th>
                <th scope="col" className="w-[34%] border-l border-cream/10 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-honey">
                  Benefits
                </th>
                <th scope="col" className="w-[42%] border-l border-cream/10 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-honey">
                  Who Can Eat &amp; Who Should Avoid
                </th>
              </tr>
            </thead>
            <tbody className="block space-y-4 p-4 sm:p-5 lg:table-row-group lg:space-y-0 lg:p-0">
              {ingredientGuide.map((row) => {
                const product = findProduct(row.slug);
                const tag = product?.tag?.trim();
                return (
                  <tr
                    key={row.slug}
                    className="block rounded-2xl bg-white ring-1 ring-forest/[0.07] transition-colors hover:ring-leaf/25 lg:table-row lg:rounded-none lg:bg-transparent lg:ring-0 lg:hover:bg-cream/60 lg:[&>td]:border-t lg:[&>td]:border-forest/[0.08] lg:first:[&>td]:border-t-0"
                  >
                    <td className="block px-5 pb-3.5 pt-5 align-top lg:table-cell lg:px-6 lg:py-6">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-display text-lg leading-tight text-forest sm:text-xl">
                          {product ? (
                            <Link href={`/products/${row.slug}`} className="focus-ring rounded transition-colors hover:text-clay">
                              {row.product}
                            </Link>
                          ) : (
                            row.product
                          )}
                        </h3>
                        {tag && (
                          <span className="rounded-full bg-honey/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-clay">
                            {tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink/60">{row.ingredients}</p>
                    </td>

                    <td className="block px-5 py-3.5 align-top lg:table-cell lg:px-6 lg:py-6">
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-clay lg:hidden">Benefits</span>
                      <p className="text-sm leading-relaxed text-ink/70">{row.benefits}</p>
                    </td>

                    <td className="block px-5 pb-5 pt-3.5 align-top lg:table-cell lg:px-6 lg:py-6">
                      <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-clay lg:hidden">
                        Who Can Eat &amp; Who Should Avoid
                      </span>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest">Who can eat</p>
                          <ul className="mt-2 space-y-1.5">
                            {row.eat.map((line) => (
                              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink/70">
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
                                  <CheckIcon width={12} height={12} />
                                </span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-clay">Who should limit or avoid</p>
                          <ul className="mt-2 space-y-1.5">
                            {row.careful.map((line) => (
                              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink/70">
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clay/10 text-clay">
                                  <CloseIcon width={12} height={12} />
                                </span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
