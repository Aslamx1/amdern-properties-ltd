import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/market-trends/demand")({
  head: () => ({
    meta: [
      { title: "Property demand trends in Uganda — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "See which Ugandan locations and property types buyers and renters are searching for most.",
      },
      { property: "og:title", content: "Property demand trends in Uganda" },
      {
        property: "og:description",
        content: "The most searched locations and property types in Uganda.",
      },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Market trends"
      title="Property demand trends"
      subtitle="Where property seekers are searching, and what they are searching for."
      sections={[
        {
          heading: "Most searched locations",
          body: "Search volumes remain concentrated in greater Kampala, with strong growth in satellite towns as buyers look for larger plots within commuting distance.",
          bullets: ["Kampala", "Wakiso", "Mukono", "Entebbe", "Mbarara", "Gulu"],
        },
        {
          heading: "Most searched property types",
          body: "Family houses and residential land dominate purchase searches, while furnished and serviced apartments lead rental demand.",
          bullets: [
            "3 bedroom houses for sale",
            "Residential land and plots",
            "2 bedroom furnished apartments to rent",
            "Office space and shops to rent",
          ],
        },
        {
          heading: "What this means for sellers",
          body: "Listings with complete photos, a clear title status and a realistic asking price attract materially more enquiries. Properties priced within 10% of the local median typically receive the first enquiry within days.",
        },
      ]}
      cta={{ label: "List your property", to: "/list-property" }}
    />
  ),
});
