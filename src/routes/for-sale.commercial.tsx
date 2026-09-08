import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-sale/commercial")({
  loader: async () => {
    const data = await getListings({ listing: "sale", category: "commercial" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      {
        title:
          "Commercial Properties for Sale in Uganda — Plazas, Hotels & Warehouses | AMDERN PROPERTIES",
      },
      {
        name: "description",
        content:
          "Commercial plazas, operational hotels, guest houses, shopping arcades, and industrial warehouses for sale in Kampala and major towns.",
      },
      {
        property: "og:title",
        content: "Commercial Properties for Sale in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Investment-grade commercial real estate across Uganda.",
      },
    ],
  }),
  component: CommercialForSalePage,
});

function CommercialForSalePage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="sale"
      defaultCategory="commercial"
      pageTitle="Commercial Properties for Sale in Uganda"
      pageSubtitle="High-yield commercial plazas, guest houses, retail arcades, and industrial warehouses"
      metaTitle="Commercial Properties for Sale in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Commercial properties for sale in Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
