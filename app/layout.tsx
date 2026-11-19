import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Fraunces, Manrope } from "next/font/google";
import Providers from "@/context/Providers";
import { getPublicProducts } from "@/lib/server/publicProducts";
import "@/styles/tokens.css";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400"], style: ["normal"], variable: "--font-wordmark", display: "swap" });

export const metadata: Metadata = {
  title: "Magna Eco Bites | A Little Tradition.",
  description: "Idli podi, country sugar and moringa idli podi — carefully prepared and packed with care in Chennai.",
};
export const viewport: Viewport = { themeColor: "#1b3d2a", width: "device-width", initialScale: 1 };

// The catalogue comes from the database on every request, so the layout cannot be prerendered.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await getPublicProducts();
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${cormorant.variable}`}>
      <body className="font-body"><Providers initialProducts={products}>{children}</Providers></body>
    </html>
  );
}
