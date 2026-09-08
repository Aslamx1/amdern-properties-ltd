import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { termsSections, TERMS_CTA } from "@/lib/legals";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "The terms that apply when you use the Amdern Properties SMC Limited website and listings.",
      },
      { property: "og:title", content: "Terms of use — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "The terms that apply when you use our website and listings.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Legal"
      title="Terms of use"
      subtitle="Please read these terms before using the site or contacting agents through it."
      sections={termsSections}
      cta={TERMS_CTA}
    />
  ),
});
