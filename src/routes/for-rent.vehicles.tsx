import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-rent/vehicles")({
  loader: async () => {
    const data = await getListings({ listing: "rent", category: "vehicles" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      { title: "Cars for Rent in Uganda — Self-Drive & Chauffeur | AMDERN PROPERTIES" },
      {
        name: "description",
        content:
          "Find cars, SUVs, and vehicles for rent in Uganda. Self-drive and chauffeur services available in Kampala, Entebbe, and across Uganda.",
      },
      { property: "og:title", content: "Cars for Rent in Uganda — AMDERN PROPERTIES SMC LTD" },
      {
        property: "og:description",
        content: "Rent cars, SUVs, and vehicles for self-drive or with a driver in Uganda.",
      },
    ],
  }),
  component: VehiclesForRentPage,
});

function VehiclesForRentPage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="rent"
      defaultCategory="vehicles"
      pageTitle="Cars & Vehicles for Rent in Uganda"
      pageSubtitle="Self-drive rentals, chauffeur services, and long-term vehicle leases in Kampala and across Uganda"
      metaTitle="Cars for Rent in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Cars and vehicles for rent across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
