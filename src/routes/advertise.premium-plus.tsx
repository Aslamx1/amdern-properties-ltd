import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/advertise/premium-plus")({
  head: () => ({
    meta: [
      { title: "Premium Plus listings — maximum exposure for your property" },
      {
        name: "description",
        content:
          "Premium Plus listings get top search placement, homepage features and email alerts to matched property seekers.",
      },
      { property: "og:title", content: "Premium Plus listings" },
      {
        property: "og:description",
        content: "Top placement, homepage features and matched email alerts.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Advertise"
      title="Premium Plus listings"
      subtitle="For properties that need to move fast, or that deserve to stand out from everything around them."
      sections={[
        {
          heading: "What is included",
          body: "Premium Plus is our top advertising tier and is limited so that featured slots stay valuable.",
          bullets: [
            "Top of search results for your location and property type",
            "Homepage featured rotation",
            "Up to 30 photos, floor plans and a video tour",
            "Verified photo badge",
            "Included in email alerts to matched property seekers",
            "Monthly performance report showing views and enquiries",
          ],
        },
        {
          heading: "Who it suits",
          body: "Developers launching a new scheme, agencies with high value stock, and owners under time pressure to sell or let.",
        },
        {
          heading: "How to upgrade",
          body: "Existing listings can be upgraded at any time — contact our team with the property reference and we will move it across.",
        },
      ]}
      cta={{ label: "Talk to our team", to: "/contact" }}
    />
  ),
});
