import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import PolicyArticle from "@/components/policies/PolicyArticle";

export const metadata: Metadata = {
  title: "Privacy Policy | Magna Eco Bites",
  description: "How Magna Eco Bites collects, uses, stores and protects your personal information.",
};

const EMAIL = "hello@magnaecobites.com";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PolicyArticle
        title="Privacy Policy"
        updated="November 2026"
        lead={[
          "At Magna Eco Bites (accessible via www.magnaecobites.com), protecting your privacy and ensuring the confidentiality of your personal information is paramount to us. This Privacy Policy outlines how we collect, use, store, and protect your information when you access our website, purchase our products, or engage with our retail, wholesale, and export services.",
          "By accessing or using our Website and Services, you agree to the collection and use of your information in accordance with this Privacy Policy.",
        ]}
        sections={[
          {
            heading: "1. General Principles & Information Categorization",
            blocks: [
              {
                kind: "paragraph",
                text: "We do everything reasonably within our control to safeguard your privacy rights on systems and platforms managed directly by Magna Eco Bites. However, we are not liable for unauthorized or unlawful disclosures of your confidential information made by third parties outside our control (such as third-party payment gateways, external advertisers, or hyperlinked websites). We encourage you to review the privacy policies of any third-party services you access through our platform.",
              },
              {
                kind: "paragraph",
                text: "Our Privacy Policy is subject to updates and periodic revisions. Please review this page regularly to stay informed of any changes.",
              },
              { kind: "subheading", text: "Categorization of Collected Information" },
              {
                kind: "paragraph",
                text: "We categorize the information we collect (\"Personal Information\") as follows:",
              },
              {
                kind: "bullets",
                items: [
                  "(a) Profiling Information: Information provided when creating an account, filling out contact forms, or placing orders. This includes: personal identity details (such as your name, gender, age, and preferences); contact details (physical delivery address, billing address, email address, and phone numbers); and business profile details (in the case of distributor, wholesale, or export inquiries).",
                  "(b) Payment and Account Information: Account history, purchase records, billing communications, and payment status. All sensitive payment details processed online are encrypted and handled through secure, PCI-DSS-compliant third-party payment gateways.",
                  "(c) Service Usage Data: Information regarding your browsing patterns on our Website, including pages viewed, products searched, time spent, and requested downloads.",
                  "(d) Technical & Log Data: Standard browser information, web requests, IP addresses, browser types, language settings, and access timestamps.",
                  "(e) Transactional Information: Order history, shipping tracking, and e-commerce transactional activity.",
                  "(f) Correspondence Information: Communications exchanged between you and Magna Eco Bites via email, website forms, customer support channels, or social media platforms.",
                  "(g) User Credentials: Usernames, passwords, email identifiers, and related security details created to access registered account services on our portal.",
                  "(h) User-Generated / Stored Content: Content or documents uploaded by you (e.g., business registration documents for distributor verification or export inquiry details).",
                ],
              },
              {
                kind: "paragraph",
                text: "We collect Personal Information solely to conduct our business operations, fulfill orders, process export/wholesale inquiries, and continuously improve our products and services. We do not sell, rent, or trade your Personal Information to any third party for commercial exploitation.",
              },
            ],
          },
          {
            heading: "2. Public Forums & Unprotected Information",
            blocks: [
              {
                kind: "paragraph",
                text: "Any information you voluntarily post in public areas—such as product reviews, public blogs, social media comment threads, or open Q&A forums—is non-confidential and not covered under this Privacy Policy.",
              },
              {
                kind: "paragraph",
                text: "Publicly accessible content can be collected and used by third parties beyond our control. You share information in public environments at your own risk, and Magna Eco Bites is not liable for any damages resulting from such public disclosures.",
              },
            ],
          },
          {
            heading: "3. Scope of Data Collection & Use",
            blocks: [
              {
                kind: "paragraph",
                text: "By accepting our Terms of Service, you authorize Magna Eco Bites to collect and store your Personal Information for the duration of your interaction with our brand, subject to the provisions below:",
              },
              { kind: "subheading", text: "3.1 Profiling & Account Information" },
              {
                kind: "paragraph",
                text: "We use your identity, contact, and account details to:",
              },
              {
                kind: "bullets",
                items: [
                  "Fulfill customer purchases, process payments, and manage order deliveries across India and globally.",
                  "Provide tailored product recommendations, seasonal offers, and promotional updates (which you may opt out of at any time).",
                  "Compile anonymized, aggregated statistical and demographic reports for internal business planning and market research.",
                ],
              },
              { kind: "subheading", text: "3.2 Service Usage & Transactional Data" },
              {
                kind: "paragraph",
                text: "We collect usage and transactional data to:",
              },
              {
                kind: "bullets",
                items: [
                  "Calculate and verify applicable product and freight charges.",
                  "Comply with statutory, tax, and export/import regulatory requirements (including FSSAI, APEDA, and GST compliance).",
                  "Enhance and personalize your shopping experience on our website.",
                  "Monitor system health and ensure compliance with our Terms of Service.",
                ],
              },
              { kind: "subheading", text: "3.3 Correspondence & Technical Identifiers" },
              {
                kind: "paragraph",
                text: "We store correspondence and security identifiers to:",
              },
              {
                kind: "bullets",
                items: [
                  "Satisfy legal and compliance obligations.",
                  "Prevent fraudulent transactions and safeguard system integrity.",
                ],
              },
              { kind: "subheading", text: "3.4 Cookies & Tracking Technologies" },
              {
                kind: "paragraph",
                text: "We utilize \"cookies\" and similar tracking technologies to remember user preferences, track shopping cart contents, and evaluate website traffic trends. Cookies help us tailor our site to your specific needs. You can adjust your web browser settings to notify you or decline cookies; however, disabling cookies may limit access to certain features on our e-commerce store.",
              },
            ],
          },
          {
            heading: "4. Third-Party Disclosures & General Exceptions",
            blocks: [
              {
                kind: "paragraph",
                text: "We may disclose your Personal Information without prior consent only under the following limited circumstances:",
              },
              {
                kind: "bullets",
                items: [
                  "Legal & Regulatory Compliance: When required by applicable laws, court orders, governmental authorities, or statutory bodies (such as customs, tax authorities, or food safety boards).",
                  "Third-Party Service Providers: To vetted third-party logistics partners, payment processors, IT infrastructure providers, and shipping lines strictly to the extent necessary to deliver your orders or execute export services.",
                  "Security & System Protection: To protect the rights, property, and safety of Magna Eco Bites, our customers, or the public, including fraud detection, spam filtering, and security monitoring.",
                  "Corporate Restructuring: In the event of a merger, acquisition, or sale of company assets, customer information may be transferred as part of standard business assets under strict confidentiality agreements.",
                ],
              },
            ],
          },
          {
            heading: "5. Data Security & Storage",
            blocks: [
              {
                kind: "paragraph",
                text: "Magna Eco Bites implements industry-standard administrative, technical, and physical security measures to safeguard your Personal Information against unauthorized access, loss, or misuse. Payment transactions are processed using encrypted data protocols.",
              },
            ],
          },
          {
            heading: "6. Accessing & Updating Your Information",
            blocks: [
              {
                kind: "paragraph",
                text: "You have the right to review, update, or correct your personal profiling information at any time by logging into your account on www.magnaecobites.com or contacting our support team.",
              },
            ],
          },
          {
            heading: "7. Contact Us",
            blocks: [
              {
                kind: "paragraph",
                text: "If you have questions, concerns, or grievances regarding this Privacy Policy or our data handling practices, please contact us at:",
              },
              {
                kind: "bullets",
                items: [
                  "Entity Name: Magna Eco Bites",
                  "Location: Kolathur, Chennai, Tamil Nadu, India",
                  `Email: ${EMAIL}`,
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
