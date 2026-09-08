import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { privacySections, PRIVACY_CTA } from "@/lib/legals";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "How Amdern Properties SMC Limited collects, uses and protects your personal information under the Uganda Data Protection and Privacy Act, 2019.",
      },
      { property: "og:title", content: "Privacy policy — Amdern Properties SMC" },
      {
        property: "og:description",
        content:
          "How we collect, use and protect your personal information under Uganda's Data Protection and Privacy Act, 2019.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Legal"
      title="Privacy policy"
      subtitle="How we handle your personal information when you use Amdern Properties."
      sections={privacySections}
      cta={PRIVACY_CTA}
    />
  ),
});
