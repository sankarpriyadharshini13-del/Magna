import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import SiteShell from "@/components/layout/SiteShell";
import ProductCard from "@/components/product/ProductCard";
import { ArrowIcon, CheckIcon, CloseIcon, PinIcon, StoneIcon } from "@/components/ui/Icons";
import { packPoints } from "@/lib/pack";
import { recommend } from "@/lib/recommend";
import { stockState } from "@/lib/stock";
import { getPublicProduct, getPublicProducts } from "@/lib/server/publicProducts";

const ProductGallery = nextDynamic(() => import("@/components/product/ProductGallery"), {
  loading: () => <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-sand" />,
});
const AddToCartPanel = nextDynamic(() => import("@/components/home/AddToCartPanel"), {
  loading: () => <div className="h-24 animate-pulse rounded-2xl bg-sand" />,
});

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPublicProduct(params.slug);
  return p ? { title: `${p.name} | Magna Eco Bites`, description: p.description } : {};
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { channel?: string };
}) {
  const [product, catalogue] = await Promise.all([getPublicProduct(params.slug), getPublicProducts()]);
  if (!product) notFound();
  const related = recommend(product, catalogue, 3);
  const isExport = product.channel === "export";
  const isDistributorEnquiry = !isExport && searchParams?.channel === "distributors";
  const isEnquiryOnly = isExport || isDistributorEnquiry;
  const enquiryHref = isExport ? "/export#enquire" : "/distributors#enquire";
  const stock = isEnquiryOnly ? null : stockState(product);
  const out = stock?.tone === "out";
  // The "Know your pack" block shows only the copy the admin saved in Products & Stock.
  const storedPack = product.pack;
  const pack = storedPack && !storedPack.enabled ? null : storedPack;
  const whoCanEat = pack ? packPoints(pack.whoCanEat) : [];
  const careful = pack ? packPoints(pack.whoShouldBeCareful) : [];

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:py-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-ink/55 sm:text-sm">
          <Link href="/" className="focus-ring rounded hover:text-clay">Home</Link> <span aria-hidden="true">/</span>{" "}
          <Link href={isExport ? "/export" : isDistributorEnquiry ? "/distributors" : "/shop"} className="focus-ring rounded hover:text-clay">{isExport ? "Export" : isDistributorEnquiry ? "Distributors" : "Shop"}</Link> <span aria-hidden="true">/</span>{" "}
          <span aria-current="page" className="text-forest">{product.name}</span>
        </nav>

        <div className="mt-6 grid items-start gap-8 sm:mt-8 lg:grid-cols-2 lg:gap-16">
          <ProductGallery product={product} />

          <div className="lg:sticky lg:top-28">
            <div className="flex flex-wrap items-center gap-2">
              {product.tag && <span className="rounded-full bg-clay/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-clay">{product.tag}</span>}
              {stock && (
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${out ? "bg-forest text-cream" : "bg-honey/30 text-forest-deep"}`}>
                  {out ? "Currently out of stock" : stock.label}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl leading-tight text-forest sm:text-4xl md:text-5xl">{product.name}</h1>
            <div className="mt-5"><AddToCartPanel product={product} disabled={out} enquiryOnly={isEnquiryOnly} /></div>
            <p className="mt-5 text-base leading-relaxed text-ink/70 sm:text-lg">{product.longDescription}</p>
            {isEnquiryOnly ? (
              <div className="mt-7 rounded-2xl border border-forest/10 bg-sand/40 p-5">
                <p className="text-sm leading-relaxed text-ink/70">
                  {isExport
                    ? "Export products are quoted by enquiry. Tell us the pack size, quantity and destination country and we&apos;ll reply with pricing, minimum order quantity and shipping options."
                    : "Tell us the products, pack sizes and quantities you need and our distributor team will share wholesale pricing."}
                </p>
                <Link href={enquiryHref} className="btn-primary mt-4 w-full sm:w-auto">
                  {isExport ? "Request an export quote" : "Request distributor pricing"} <ArrowIcon width={16} height={16} />
                </Link>
              </div>
            ) : (
              null
            )}

            <ul className="mt-8 grid gap-3 border-t border-forest/10 pt-6 sm:grid-cols-2">
              <li className="flex items-center gap-3 text-sm text-ink/70"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf/10 text-leaf"><PinIcon width={18} height={18} /></span>Sourced &amp; packed in Chennai</li>
              <li className="flex items-center gap-3 text-sm text-ink/70"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf/10 text-leaf"><StoneIcon width={18} height={18} /></span>Made with care and quality ingredients</li>
            </ul>
            <Link href="/about" className="focus-ring mt-5 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-forest underline-offset-4 hover:text-clay hover:underline">
              Learn more about how we make it <ArrowIcon width={15} height={15} />
            </Link>
          </div>
        </div>

        {pack && (pack.ingredients.trim() !== "" || pack.benefits.trim() !== "" || whoCanEat.length > 0 || careful.length > 0) && (
          <section aria-labelledby="ingredient-title" className="mt-14 rounded-[1.75rem] bg-sand/50 p-6 sm:mt-20 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-clay sm:text-xs">Know your pack</p>
                <h2 id="ingredient-title" className="mt-2 font-display text-2xl text-forest sm:text-3xl">Ingredients &amp; Benefits</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pack.ingredients.trim() !== "" && (
                <div className="rounded-2xl bg-white/80 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-forest mb-3">Ingredients</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{pack.ingredients}</p>
                </div>
              )}

              {pack.benefits.trim() !== "" && (
                <div className="rounded-2xl bg-white/80 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-forest mb-3">Benefits</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{pack.benefits}</p>
                </div>
              )}

              {whoCanEat.length > 0 && (
                <div className="rounded-2xl bg-white/80 p-5 md:col-span-2 lg:col-span-1">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-forest mb-3">Who can eat</h3>
                  <ul className="space-y-2">
                    {whoCanEat.map((line, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink/70">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
                          <CheckIcon width={12} height={12} />
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {careful.length > 0 && (
              <div className="mt-6 rounded-2xl bg-honey/15 p-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-forest-deep mb-3">Who should be careful</h3>
                <ul className="space-y-2">
                  {careful.map((line, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-forest-deep">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-clay/20 text-clay">
                        <CloseIcon width={12} height={12} />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-14 sm:mt-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-clay sm:text-xs">Recommended products</p>
                <h2 id="related-title" className="mt-2 font-display text-3xl text-forest sm:text-4xl">You may <span className="italic text-clay">also like</span></h2>
              </div>
              <Link href={isExport ? "/export" : isDistributorEnquiry ? "/distributors" : "/shop"} className="focus-ring group inline-flex items-center gap-2 self-start rounded-full border border-forest/15 px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream sm:self-auto">
                {isExport ? "View export range" : isDistributorEnquiry ? "View distributor range" : "View all products"} <ArrowIcon width={16} height={16} />
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}><ProductCard product={p} enquiryOnly={isDistributorEnquiry} /></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
