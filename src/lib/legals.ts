import type { Section } from "@/components/site/InfoPage";

/**
 * Shared legal content for the Privacy Policy pages.
 * Customised for AMDERN PROPERTIES SMC LIMITED under the
 * Uganda Data Protection and Privacy Act, 2019.
 */

export const privacySections: Section[] = [
  {
    heading: "Who we are",
    body: 'AMDERN PROPERTIES SMC LIMITED is a Ugandan real-estate platform operating under the laws of the Republic of Uganda. For privacy-related matters you may contact our Data Protection Officer at dpo@amdernproperties.ug or by post at Plot 1, Kampala Road, Kampala, Uganda. This policy explains how we collect, use, store and protect your personal data in line with the Uganda Data Protection and Privacy Act, 2019 (the "Act").',
  },
  {
    heading: "Information we collect",
    body: "We collect only the data necessary to operate the platform (Article 6 — Data minimisation). This includes:\n\n• Identity data: your name, email address, and phone number when you register or contact an agent.\n• Profile data: your role (seeker, owner, agent, developer), avatar, and saved properties/alerts.\n• Property data: listings you submit (including photos, location, and price).\n• Usage data: pages visited, searches performed, and property views (via cookie identifiers, never directly tied to your identity unless you are signed in).\n• Transaction data: any payments processed through our partners.",
  },
  {
    heading: "How we use your information",
    body: "We process your personal data only where we have lawful basis under the Act:\n\n• Contract performance (Article 5): to create and manage your account, match you with listings, and deliver services you request.\n• Legitimate interests (Article 6): to improve the platform, prevent fraud, and send you service-related notifications.\n• Legal obligation (Article 7): to comply with Ugandan tax, anti-money-laundering, and dispute-resolution laws.\n• Consent (Article 9): to send you marketing communications, which you can withdraw at any time.\n\nWe retain data only as long as necessary for the purposes above and in accordance with legal retention periods (typically 7 years for financial records).",
  },
  {
    heading: "Sharing your data",
    body: "We do NOT sell your personal information. We share it only with:\n\n• Property agents and developers when you explicitly contact them about a listing — they receive only the details necessary to respond to your enquiry.\n• Trusted service providers (payment processors, email delivery, cloud hosting) who are bound by confidentiality agreements and process data only on our instructions.\n• Authorities when required by law — e.g., court orders, tax authorities, or law-enforcement requests, but only to the extent legally required.",
  },
  {
    heading: "Cookies and tracking",
    body: "We use only essential cookies: a session cookie to keep you logged in, a cookie to remember your currency and language preferences, and a cookie to track your recently viewed properties (stored locally on your device). We do not use advertising-tracking or third-party profiling cookies. You can clear or block cookies in your browser, though this may affect site functionality.",
  },
  {
    heading: "Your rights under the Act",
    body: "You have rights under the Uganda Data Protection and Privacy Act, 2019:\n\n• Right to be informed — this policy explains what we do.\n• Right of access (Article 10) — request a copy of your personal data via GET /api/user/me/data.\n• Right to rectification — update inaccurate data in your account settings.\n• Right to erasure (Article 12) — request deletion or anonymisation via DELETE /api/user/me/data.\n• Right to data portability — receive your data in a structured, machine-readable format.\n• Right to object — opt out of marketing at any time.\n• Right to lodge a complaint — contact the Office of the Personal Data Protection Commissioner.\n\nTo exercise any of these rights, contact us at dpo@amdernproperties.ug.",
  },
  {
    heading: "Data security and storage",
    body: "Your data is stored on secure PostgreSQL servers hosted in data centres compliant with international security standards. Passwords are hashed with bcrypt (12 rounds). All traffic between your browser and our servers uses HTTPS/TLS. Access to personal data is restricted to authorised staff on a need-to-know basis. Where data is transferred outside Uganda (e.g., to cloud providers), we ensure equivalent protection through contractual safeguards.",
  },
  {
    heading: "Changes to this policy",
    body: "We may update this policy to reflect changes in our practices or legal requirements. When we do, we will post the updated policy here with a revised 'Last updated' date. Significant changes will be notified to you via email or an in-site notice.",
  },
];

export const PRIVACY_CTA = { label: "Contact us about privacy" as const, to: "/contact" as const };

export const termsSections: Section[] = [
  {
    heading: "Using the site",
    body: "You may use Amdern Properties to search for property, contact agents, developers and owners, and submit listings for review. You agree not to scrape the site, misuse contact details obtained through the platform, or post listings you are not authorised to market. All content you submit must be accurate, lawful, and not infringe the rights of any third party.",
  },
  {
    heading: "Your account",
    body: "To access certain features you must create an account and agree to the Privacy Policy. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You must notify us immediately of any unauthorised access to your account. You may terminate your account at any time by contacting us.",
  },
  {
    heading: "Listing accuracy",
    body: "Listings are supplied by agents, developers and owners. While we review submissions before publication, we do not warrant that every detail, price, measurement, or availability is accurate. You should verify all material facts — including title, land size, and planning permissions — directly with the listing agent, developer, or owner before committing to any transaction.",
  },
  {
    heading: "No agency relationship",
    body: "Unless we are expressly instructed as the marketing agent for a specific property, AMDERN PROPERTIES SMC LIMITED acts as an advertising platform only and is not party to any transaction between you and a listing agent, developer, or owner. We are not a party to and accept no liability for any sale, rental, or other agreement you enter into with third parties through this site.",
  },
  {
    heading: "Fees and payments",
    body: "Listing by property seekers and basic searches are free. Agents, developers, and owners may be charged for premium listing features, lead generation, or advertising. All fees are stated in Uganda Shillings (UGX) or US Dollars (USD) and are non-refundable unless required by law.",
  },
  {
    heading: "Intellectual property",
    body: "All content on this site — including text, graphics, logos, and software — is the property of AMDERN PROPERTIES SMC LIMITED or its licensors and is protected by Ugandan and international copyright, trademark, and other intellectual-property laws. You may view and download material for your personal, non-commercial use only.",
  },
  {
    heading: "Disclaimer",
    body: 'The site and all services are provided on an "as is" and "as available" basis. We do not warrant that the site will be uninterrupted, secure, or error-free, or that defects will be corrected. To the maximum extent permitted by law, we exclude all warranties, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
  },
  {
    heading: "Limitation of liability",
    body: "To the fullest extent permitted by Ugandan law, AMDERN PROPERTIES SMC LIMITED, its directors, officers, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages — including but not limited to loss of profits, data, business, or opportunity — arising out of or in connection with your use of the site or any listing information, or from any dealings with third parties contacted through the site.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by and construed in accordance with the laws of the Republic of Uganda, including the Land Act, the Companies Act, and the Uganda Data Protection and Privacy Act, 2019. Any disputes shall be subject to the exclusive jurisdiction of the courts of Uganda.",
  },
  {
    heading: "Changes",
    body: "We may update these terms from time to time. When we do, we will revise the 'Last updated' date at the top of this page. Continued use of the site after an update constitutes acceptance of the revised terms.",
  },
];

export const TERMS_CTA = { label: "Questions? Contact us" as const, to: "/contact" as const };
