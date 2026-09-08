import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-sale/vehicles")({
  loader: async () => {
    const data = await getListings({ listing: "sale", category: "vehicles" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      { title: "Cars for Sale in Uganda — New & Used Vehicles | AMDERN PROPERTIES" },
      {
        name: "description",
        content:
          "Browse cars, motorcycles, and vehicles for sale in Uganda. Find new and used vehicles from trusted dealers across Kampala and major cities.",
      },
      { property: "og:title", content: "Cars for Sale in Uganda — AMDERN PROPERTIES SMC LTD" },
      {
        property: "og:description",
        content: "Find new and used cars, motorcycles, and vehicles for sale in Uganda.",
      },
    ],
  }),
  component: VehiclesForSalePage,
});

function VehiclesForSalePage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="sale"
      defaultCategory="vehicles"
      pageTitle="Cars & Vehicles for Sale in Uganda"
      pageSubtitle="Browse new and used cars, motorcycles, SUVs, trucks, and commercial vehicles from trusted dealers"
      metaTitle="Cars for Sale in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Cars and vehicles for sale across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
