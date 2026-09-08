import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-rent")({
  loader: async () => {
    const data = await getListings({ listing: "rent" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      {
        title:
          "Properties for Rent in Uganda — Houses, Apartments & Commercial | AMDERN PROPERTIES",
      },
      {
        name: "description",
        content:
          "Find residential houses, furnished apartments, office spaces, warehouses, and commercial properties for rent in Kampala, Wakiso, and across Uganda.",
      },
      {
        property: "og:title",
        content: "Properties for Rent in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Explore the best rental properties in Uganda with AMDERN PROPERTIES SMC LTD.",
      },
    ],
  }),
  component: ForRentOverview,
});

function ForRentOverview() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="rent"
      pageTitle="Properties for Rent in Uganda"
      pageSubtitle="Browse verified rental houses, furnished flats, shortlets, prime office spaces, and commercial property"
      metaTitle="Properties for Rent in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Verified properties for rent across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
