import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Page";
import { HelpCircle, ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";

const FAQS = [
  {
    question: "How do I buy property in Uganda as a foreigner?",
    answer:
      "Foreigners can buy property in Uganda on a leasehold basis (maximum 99 years) for developed land, or acquire freehold for up to 50 acres. We recommend working with a verified lawyer to handle the transfer and land title registration at the Ministry of Lands.",
  },
  {
    question: "What documents do I need to view a property?",
    answer:
      "Bring a valid ID (national ID or passport) and, if financing, a pre-approval letter from your bank. For land viewings, we also recommend having your surveyor or legal advisor present.",
  },
  {
    question: "Are your listings verified?",
    answer:
      "Yes. Every listing goes through our verification process, including title searches, ownership checks, and physical inspection by AMDERN representatives. Verified listings display a shield badge.",
  },
  {
    question: "How much deposit do I need to buy a house?",
    answer:
      "Typical deposits range from 10% to 30% of the purchase price, depending on the seller and your financing arrangement. Our team can negotiate on your behalf.",
  },
  {
    question: "Do you help with mortgage applications?",
    answer:
      "Yes. We work with partner banks and SACCOs to help clients access financing. Use our mortgage calculator to estimate repayments, or contact us for a referral.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "We operate across Kampala, Wakiso, Mukono, Entebbe, Jinja, and expanding into other regions. Use the location filter on our search page to browse by area.",
  },
  {
    question: "How do I list my property with AMDERN?",
    answer:
      "Click 'List your property', fill in the details, and our team will review within 24 hours. Basic listings are free; premium placements include verified photos and priority placement.",
  },
  {
    question: "What is the difference between leasehold and freehold?",
    answer:
      "Freehold gives you full ownership indefinitely. Leasehold gives you the right to use the land for a fixed period (e.g., 99 years) after which it reverts to the original owner unless renewed.",
  },
];

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQs — Amdern Properties SMC" },
      {
        name: "description",
        content: "Frequently asked questions about buying, selling, and renting property in Uganda with AMDERN PROPERTIES SMC LTD.",
      },
    ],
    links: [{ rel: "canonical", href: "https://amdernpropertiessmclimited.com/help" }],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <Page>
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions"
        subtitle="Answers to common questions about property in Uganda, our listings, and how AMDERN PROPERTIES SMC LTD works."
      />
      <div className="container-page py-8">
        <div className="mx-auto max-w-3xl">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group border-b border-border py-4 last:border-b-0"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-extrabold text-foreground-strong">
                {faq.question}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto max-w-3xl mt-10 surface-card p-6 text-center">
          <HelpCircle className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-extrabold">Still have questions?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Our Kampala team is ready to help. Call, WhatsApp, or email us directly.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="btn-base btn-primary"
            >
              Call {SITE.phone}
            </a>
            <Link to="/contact" className="btn-base btn-outline">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
