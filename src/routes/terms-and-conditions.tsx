import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { termsSections, TERMS_CTA } from "@/lib/legals";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and conditions — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "The terms and conditions that apply when you use the Amdern Properties SMC Limited website and listings.",
      },
      { property: "og:title", content: "Terms and conditions — Amdern Properties SMC" },
      {
        property: "og:url",
        content: "https://amdernpropertiessmclimited.com/terms-and-conditions",
      },
      {
        property: "og:description",
        content: "The terms and conditions that apply when you use our website and listings.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://amdernpropertiessmclimited.com/terms-and-conditions" },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Legal"
      title="Terms and conditions"
      subtitle="Please read these terms and conditions before using the site or contacting agents through it."
      sections={termsSections}
      cta={TERMS_CTA}
    />
  ),
});
