import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-sale/houses")({
  loader: async () => {
    const data = await getListings({ listing: "sale", category: "houses" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      { title: "Houses for Sale in Uganda — Bungalows, Mansions & Duplexes | AMDERN PROPERTIES" },
      {
        name: "description",
        content:
          "Find residential houses, standalone bungalows, gated townhouses, and luxury mansions for sale in Kampala, Naalya, Kira, Muyenga, Kololo, and Wakiso.",
      },
      { property: "og:title", content: "Houses for Sale in Uganda — AMDERN PROPERTIES SMC LTD" },
      {
        property: "og:description",
        content: "Discover verified bungalows, townhouses, and duplexes for sale in Uganda.",
      },
    ],
  }),
  component: HousesForSalePage,
});

function HousesForSalePage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="sale"
      defaultCategory="houses"
      pageTitle="Houses for Sale in Uganda"
      pageSubtitle="Explore standalone bungalows, modern townhouses, detached duplexes, and luxury family mansions"
      metaTitle="Houses for Sale in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Verified houses for sale across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
