import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-sale")({
  loader: async () => {
    const data = await getListings({ listing: "sale" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      { title: "Properties for Sale in Uganda — AMDERN PROPERTIES SMC LTD" },
      {
        name: "description",
        content:
          "Browse verified houses, apartments, genuine titled land, and commercial properties for sale across Kampala, Wakiso, Mukono, Entebbe and nationwide in Uganda.",
      },
      {
        property: "og:title",
        content: "Properties for Sale in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Explore the best properties for sale in Uganda with AMDERN PROPERTIES SMC LTD.",
      },
    ],
  }),
  component: ForSaleOverview,
});

function ForSaleOverview() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="sale"
      pageTitle="Properties for Sale in Uganda"
      pageSubtitle="Browse houses, apartments, titled land, and commercial real estate available for purchase"
      metaTitle="Properties for Sale in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Verified properties for sale across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
