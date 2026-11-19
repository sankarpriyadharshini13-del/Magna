import dynamic from "next/dynamic";
import SiteShell from "@/components/layout/SiteShell";
import BrandStatement from "@/components/home/BrandStatement";
import Reviews from "@/components/home/Reviews";
import { getReviewStats, getReviewsPage } from "@/lib/server/publicReviews";

const Hero = dynamic(() => import("@/components/home/Hero"), { loading: () => <div className="h-screen bg-cream" /> });
const FeaturedProducts = dynamic(() => import("@/components/home/FeaturedProducts"), { loading: () => <div className="h-96 bg-cream" /> });
const NaturalSourcing = dynamic(() => import("@/components/home/NaturalSourcing"), { loading: () => <div className="h-96 bg-cream" /> });
const FAQ = dynamic(() => import("@/components/home/FAQ"), { loading: () => <div className="h-96 bg-cream" /> });
const Contact = dynamic(() => import("@/components/home/Contact"), { loading: () => <div className="h-96 bg-cream" /> });

export default async function Home() {
  // The Reviews section appears only while at least one review is "Live on website" (Admin → Reviews).
  const [{ reviews }, reviewStats] = await Promise.all([getReviewsPage({ limit: 8 }), getReviewStats()]);
  return (
    <SiteShell>
      <Hero />
      <BrandStatement />
      <NaturalSourcing />
      <FeaturedProducts />
      <Reviews reviews={reviews} stats={reviewStats} />
      <FAQ />
      <Contact />
    </SiteShell>
  );
}
