import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import PolicyArticle from "@/components/policies/PolicyArticle";

export const metadata: Metadata = {
  title: "Terms & Conditions | Magna Eco Bites",
  description: "The terms and conditions for using the Magna Eco Bites website and services.",
};

const EMAIL = "hello@magnaecobites.com";

export default function TermsPage() {
  return (
    <SiteShell>
      <PolicyArticle
        title="Terms & Conditions"
        updated="November 2026"
        lead={[
          "Welcome to Magna Eco Bites (www.magnaecobites.com), operated from Kolathur, Chennai, Tamil Nadu, India. By accessing our website or placing an order, you agree to these Terms & Conditions.",
        ]}
        sections={[
          {
            heading: "1. Acceptance of Terms",
            blocks: [
              {
                kind: "paragraph",
                text: "By using our online store, placing orders, or contacting us for B2B/exports, you accept and agree to be bound by these terms.",
              },
            ],
          },
          {
            heading: "2. Product Information & Availability",
            blocks: [
              {
                kind: "paragraph",
                text: "We strive for complete accuracy in product details. As our 100% natural podis, cold-pressed oils, and spices are made in small batches, slight variations in batch color or natural aroma may occur. All items are subject to stock availability.",
              },
            ],
          },
          {
            heading: "3. Orders & Pricing",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "You are responsible for providing accurate contact and shipping details.",
                  "Prices are in INR (₹) and are subject to change without prior notice.",
                ],
              },
            ],
          },
          {
            heading: "4. Payment Methods",
            blocks: [
              { kind: "paragraph", text: "We accept payments via:" },
              {
                kind: "bullets",
                items: [
                  "Credit / Debit Cards",
                  "UPI Transfers (Google Pay, PhonePe, Paytm, BHIM)",
                  "Net Banking",
                  "NEFT & RTGS Transfers (for wholesale and export orders)",
                ],
              },
            ],
          },
          {
            heading: "5. Shipping & Delivery",
            blocks: [
              {
                kind: "paragraph",
                text: "We aim to dispatch orders promptly across India and globally. Magna Eco Bites is not responsible for shipping delays caused by courier logistics, weather, or incorrect delivery addresses.",
              },
            ],
          },
          {
            heading: "6. Returns & Refunds",
            blocks: [
              {
                kind: "paragraph",
                text: "Due to the consumable nature of food items, returns are accepted only for damaged, defective, or incorrect products reported within 48 hours of delivery with proof. Please refer to our Refund Policy for details.",
              },
            ],
          },
          {
            heading: "7. Intellectual Property",
            blocks: [
              {
                kind: "paragraph",
                text: "All content on this website—including logos, product descriptions, images, and branding—is protected by copyright laws and belongs to Magna Eco Bites. Unauthorized use is prohibited.",
              },
            ],
          },
          {
            heading: "8. Limitation of Liability",
            blocks: [
              {
                kind: "paragraph",
                text: "Magna Eco Bites is not liable for any direct, indirect, or incidental damages resulting from your use of our website, product consumption outside recommended usage, or service interruptions.",
              },
            ],
          },
          {
            heading: "9. Governing Law",
            blocks: [
              {
                kind: "paragraph",
                text: "These Terms are governed by the laws of Chennai, Tamil Nadu, India. Any legal disputes shall be subject to the exclusive jurisdiction of the courts in Chennai.",
              },
            ],
          },
          {
            heading: "10. Contact Us",
            blocks: [
              {
                kind: "bullets",
                items: [
                  `Email: ${EMAIL}`,
                  "Location: Kolathur, Chennai, Tamil Nadu, India",
                  "Website: www.magnaecobites.com",
                ],
              },
            ],
          },
        ]}
      />
    </SiteShell>
  );
}
