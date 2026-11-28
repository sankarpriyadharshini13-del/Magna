import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";
import { ArrowIcon } from "@/components/ui/Icons";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import Reveal from "@/components/home/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

export const metadata: Metadata = {
  title: "Business Supply | Magna Eco Bites",
  description: "Business enquiries for restaurants, cafés, caterers and retail buyers from Magna Eco Bites, Chennai.",
};

export default function BusinessPage() {
  return (
    <SiteShell>
      <section className="bg-cream py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              as="h1"
              align="center"
              eyebrow="For Business"
              title={<>Supply for <span className="italic text-clay">your business</span></>}
              lead="Magna Eco Bites works with restaurants, cafés, caterers and retail buyers. For current products, pack sizes, wholesale pricing and distributor support, start with our dedicated trade page."
            />
          </Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/distributors" className="btn-primary">
              Wholesale &amp; distributor supply <ArrowIcon width={16} height={16} />
            </Link>
            <Link href="/export" className="btn-secondary">
              Export enquiries
            </Link>
          </div>
        </div>
      </section>

      <section id="enquire" className="bg-sand/45 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft md:p-10">
              <SectionHeading
                align="center"
                eyebrow="Get in touch"
                title="Have a business request?"
                lead="For a general restaurant, café or catering enquiry, tell us what you need and our team will follow up."
              />
              <EnquiryForm type="business" />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
