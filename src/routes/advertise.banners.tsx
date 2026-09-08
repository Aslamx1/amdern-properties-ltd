import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/advertise/banners")({
  head: () => ({
    meta: [
      { title: "Banner advertising — reach property seekers in Uganda" },
      {
        name: "description",
        content:
          "Advertise your brand to property seekers in Uganda with banner placements across Amdern Properties.",
      },
      { property: "og:title", content: "Banner advertising on Amdern Properties" },
      {
        property: "og:description",
        content: "Reach an audience actively searching for property in Uganda.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Advertise"
      title="Banner advertising"
      subtitle="Put your brand in front of an audience that is actively searching for property, finance and building services."
      sections={[
        {
          heading: "Placements",
          body: "Every placement is above or alongside content that property seekers are actively reading.",
          bullets: [
            "Homepage leaderboard, above the search panel",
            "Search results sidebar, targeted by region and property type",
            "Property detail page mid-content unit",
            "Market trends and area guide pages",
          ],
        },
        {
          heading: "Who advertises with us",
          body: "Banks and mortgage providers, insurers, building material suppliers, hardware retailers, surveyors, law firms and developers launching new schemes.",
        },
        {
          heading: "Targeting and reporting",
          body: "Campaigns can be targeted by region, property type and listing price band. You receive impressions, clicks and click-through rate reporting for the duration of the campaign.",
        },
        {
          heading: "Rates",
          body: "Banner campaigns are sold on a monthly basis with discounts for three and six month commitments. Contact our advertising team for the current rate card.",
        },
      ]}
      cta={{ label: "Request the rate card", to: "/contact" }}
    />
  ),
});
