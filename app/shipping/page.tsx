import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import PolicyArticle from "@/components/policies/PolicyArticle";

export const metadata: Metadata = {
  title: "Shipping Policy | Magna Eco Bites",
  description: "Shipping, delivery and order processing details for Magna Eco Bites.",
};

const EMAIL = "hello@magnaecobites.com";

export default function ShippingPage() {
  return (
    <SiteShell>
      <PolicyArticle
        title="Shipping Policy"
        updated="November 2026"
        lead={[
          "At Magna Eco Bites, we take immense pride in delivering fresh, 100% natural, stone-ground South Indian pantry staples right from our facility in Kolathur, Chennai to your doorstep. We believe in complete transparency, which is why we have outlined our detailed shipping terms below.",
        ]}
        sections={[
          {
            heading: "1. Order Processing & Handling Time",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "All orders are freshly packed and processed within 1 to 3 business days of being placed.",
                  "Processing does not occur on Sundays or national holidays.",
                  "Once your order is dispatched, you will receive an automated email/SMS containing your tracking details and courier partner information.",
                ],
              },
            ],
          },
          {
            heading: "2. Domestic Delivery Options & Timelines (India)",
            blocks: [
              {
                kind: "paragraph",
                text: "We ship to pin codes across India using reliable courier and postal logistics networks.",
              },
              { kind: "subheading", text: "Standard Ground Shipping" },
              {
                kind: "bullets",
                items: [
                  "Within Tamil Nadu: 2 – 3 business days",
                  "Kerala & Karnataka: 3 – 5 business days",
                  "Rest of India: 3 – 9 business days",
                ],
              },
              { kind: "subheading", text: "Expedited & Overnight Delivery" },
              {
                kind: "bullets",
                items: [
                  "Coming Soon! We are currently setting up fast-track delivery options for urgent pantry replenishments.",
                ],
              },
            ],
          },
          {
            heading: "3. Free Shipping Offers",
            blocks: [
              {
                kind: "paragraph",
                text: "We offer Free Standard Shipping on select domestic orders based on cart value.",
              },
              {
                kind: "bullets",
                items: [
                  "Applicable free shipping options will automatically apply during checkout when your order meets the minimum threshold.",
                ],
              },
            ],
          },
          {
            heading: "4. International Shipping",
            blocks: [
              {
                kind: "paragraph",
                text: "We proudly ship our natural food staples to customers and diaspora around the world, including: US, Europe, Middle east, Far East and etc.",
              },
              { kind: "subheading", text: "International Freight & Customs" },
              {
                kind: "bullets",
                items: [
                  "Shipping charges for international destinations are calculated dynamically at checkout based on package weight and destination country.",
                  "Customs Duties & Taxes: Import duties, VAT, or local tax charges (if applicable) are governed by the destination country's regulations and must be paid by the recipient upon arrival.",
                ],
              },
            ],
          },
          {
            heading: "5. Address Requirements & Delivery Guidelines",
            blocks: [
              {
                kind: "paragraph",
                text: "To ensure smooth and timely delivery, please keep the following guidelines in mind:",
              },
              {
                kind: "bullets",
                items: [
                  "Complete Address: Please provide a complete delivery address with landmark details, pin code/postal code, and active mobile number.",
                  "PO Boxes & APO/FPO: We currently cannot ship to PO Boxes or APO/FPO military addresses.",
                  "Package Safety: Magna Eco Bites is not directly liable for stolen packages once marked \"Delivered\" by the courier carrier. However, if your shipment is misplaced in transit, our support team will gladly help file an investigation claim with the shipping partner.",
                ],
              },
            ],
          },
          {
            heading: "6. Delivery Guarantee & Support",
            blocks: [
              {
                kind: "paragraph",
                text: "We strive to ensure all shipments reach you within the estimated delivery windows. If your package encounters an unexpected delay beyond the estimated timeframe, please reach out to us so we can trace your shipment and resolve the issue immediately.",
              },
            ],
          },
          {
            heading: "7. Contact Information",
            blocks: [
              {
                kind: "paragraph",
                text: "If you have any questions or require tracking assistance regarding your shipment, please reach out to our customer care team:",
              },
              {
                kind: "bullets",
                items: [
                  `Email: ${EMAIL}`,
                  "Official Website: www.magnaecobites.com",
                  "Location: Kolathur, Chennai, Tamil Nadu, India",
                ],
              },
            ],
          },
        ]}
      />
    </SiteShell>
  );
}
