import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-rent/commercial")({
  loader: async () => {
    const data = await getListings({ listing: "rent", category: "commercial" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      {
        title:
          "Commercial Properties for Rent in Uganda — Offices, Shops & Warehouses | AMDERN PROPERTIES",
      },
      {
        name: "description",
        content:
          "Find prime office suites in Kingdom Kampala, retail arcade shops in downtown Kampala, industrial warehouses, and hospitality leases.",
      },
      {
        property: "og:title",
        content: "Commercial Properties for Rent in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Prime office space, retail shops, and warehouses for rent in Uganda.",
      },
    ],
  }),
  component: CommercialForRentPage,
});

function CommercialForRentPage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="rent"
      defaultCategory="commercial"
      pageTitle="Commercial Properties for Rent in Uganda"
      pageSubtitle="Corporate office suites, retail arcade shops, industrial logistics warehouses, and hospitality commercial property"
      metaTitle="Commercial Properties for Rent in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Commercial offices, shops, and warehouses for rent in Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
