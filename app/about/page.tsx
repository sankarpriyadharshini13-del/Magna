import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import About from "@/components/home/About";

export const metadata: Metadata = {
  title: "About Us | Magna Eco Bites",
  description: "Family-run from Chennai — bringing you South Indian podis and country sugar, carefully prepared with quality ingredients.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <div id="story">
        <About aboutLink={false} titleAs="h1" />
      </div>
    </SiteShell>
  );
}
