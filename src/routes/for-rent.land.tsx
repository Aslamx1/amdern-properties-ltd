import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-rent/land")({
  loader: async () => {
    const data = await getListings({ listing: "rent", category: "land" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      {
        title:
          "Land & Plots for Rent & Lease in Uganda — Commercial Yards & Farmland | AMDERN PROPERTIES",
      },
      {
        name: "description",
        content:
          "Commercial yards, industrial open storage land, agricultural farm leases, and joint venture land plots across Uganda.",
      },
      {
        property: "og:title",
        content: "Land & Plots for Rent in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Commercial and agricultural land available for lease and joint venture.",
      },
    ],
  }),
  component: LandForRentPage,
});

function LandForRentPage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="rent"
      defaultCategory="land"
      pageTitle="Land & Plots for Rent & Lease in Uganda"
      pageSubtitle="Commercial storage yards, industrial holding plots, farm land for lease, and joint venture opportunities"
      metaTitle="Land & Plots for Rent in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Commercial yards and farmland for lease across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
