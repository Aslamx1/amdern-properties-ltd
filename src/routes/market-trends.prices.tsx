import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/market-trends/prices")({
  head: () => ({
    meta: [
      { title: "Average property prices in Uganda — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Average asking prices and rents for houses, apartments and land across Uganda's regions and districts.",
      },
      { property: "og:title", content: "Average property prices in Uganda" },
      {
        property: "og:description",
        content: "Average asking prices and rents by property type and region.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Market trends"
      title="Average property prices"
      subtitle="Typical asking prices and rents by property type, based on active listings."
      sections={[
        {
          heading: "For sale — average asking price",
          body: "Averages across active sale listings. Actual prices vary widely by finish, plot size and access.",
          bullets: [
            "2 bedroom house: USh 180M",
            "3 bedroom house: USh 420M",
            "4 bedroom house: USh 850M",
            "5+ bedroom house: USh 1.8B",
            "Residential land (50 decimals): USh 180M",
          ],
        },
        {
          heading: "To rent — average monthly rent",
          body: "Averages across active rental listings, excluding shortlets.",
          bullets: [
            "Single room self contained: USh 350,000",
            "1 bedroom apartment: USh 900,000",
            "2 bedroom apartment: USh 2.1M",
            "3 bedroom townhouse: USh 3.8M",
            "Office space: USh 6.5M",
          ],
        },
        {
          heading: "Commercial",
          body: "Commercial rents are driven principally by footfall and road frontage. Arcade shops in central Kampala command the highest rate per square metre, while warehousing is priced by usable floor area and yard access.",
        },
      ]}
      cta={{ label: "Search by budget", to: "/search" }}
    />
  ),
});
