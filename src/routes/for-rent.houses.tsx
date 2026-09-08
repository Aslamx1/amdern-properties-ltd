import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-rent/houses")({
  loader: async () => {
    const data = await getListings({ listing: "rent", category: "houses" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      { title: "Houses for Rent in Uganda — Townhouses, Bungalows & Mansions | AMDERN PROPERTIES" },
      {
        name: "description",
        content:
          "Search townhouses, standalone family bungalows, and luxury houses for rent in Ntinda, Bugolobi, Entebbe, Naalya, and Kampala suburbs.",
      },
      { property: "og:title", content: "Houses for Rent in Uganda — AMDERN PROPERTIES SMC LTD" },
      {
        property: "og:description",
        content: "Verified family homes and townhouses for rent in Uganda.",
      },
    ],
  }),
  component: HousesForRentPage,
});

function HousesForRentPage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="rent"
      defaultCategory="houses"
      pageTitle="Houses for Rent in Uganda"
      pageSubtitle="Quality family bungalows, secure gated townhouses, and executive rental homes"
      metaTitle="Houses for Rent in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Verified houses for rent across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
