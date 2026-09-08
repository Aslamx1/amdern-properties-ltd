import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/market-trends/reports")({
  head: () => ({
    meta: [
      { title: "Quarterly Uganda property market reports — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Read the latest quarterly Uganda property market report: median asking prices, supply and demand by region.",
      },
      { property: "og:title", content: "Quarterly Uganda property market reports" },
      {
        property: "og:description",
        content: "Median asking prices, supply and demand across Uganda's regions.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Market trends · Q3 2026"
      title="Uganda Property Market Report"
      subtitle="Median asking prices from 438 listings across 4 regions and 31 areas, updated every quarter."
      sections={[
        {
          heading: "Headline findings",
          body: "Asking prices in the Central Region continued to firm through the quarter, led by gated developments in Kampala and Wakiso, while Eastern and Western Region prices held broadly flat.",
          bullets: [
            "Median asking price for a 3 bedroom house in Kampala: USh 420M",
            "Median monthly rent for a 2 bedroom apartment in Kampala: USh 2.1M",
            "Median price per decimal for residential land in Wakiso: USh 3.6M",
            "Listing supply up 12% quarter on quarter",
          ],
        },
        {
          heading: "By region",
          body: "Central Region accounts for the large majority of active listings, with Eastern, Western and Northern regions growing from a smaller base. Demand is strongest for 2 and 3 bedroom homes near tarmac access roads.",
        },
        {
          heading: "Methodology",
          body: "Figures are calculated from asking prices of active listings on Amdern Properties during the quarter. Medians are used to reduce the effect of a small number of very high value listings, and land prices are normalised per decimal.",
        },
      ]}
      cta={{ label: "Browse current listings", to: "/search" }}
    />
  ),
});
