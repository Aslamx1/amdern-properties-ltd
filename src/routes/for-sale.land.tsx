import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-sale/land")({
  loader: async () => {
    const data = await getListings({ listing: "sale", category: "land" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      {
        title:
          "Land & Plots for Sale in Uganda — Mailo & Freehold Titled Plots | AMDERN PROPERTIES",
      },
      {
        name: "description",
        content:
          "Search residential plots, commercial land, industrial parcels, and agricultural farms for sale in Kira, Mukono, Namanve, Wakiso, and nationwide.",
      },
      {
        property: "og:title",
        content: "Land & Plots for Sale in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content:
          "Genuine titled land with verified Ministry of Lands search reports across Uganda.",
      },
    ],
  }),
  component: LandForSalePage,
});

function LandForSalePage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="sale"
      defaultCategory="land"
      pageTitle="Land & Plots for Sale in Uganda"
      pageSubtitle="Residential plots with genuine Mailo/Freehold titles, commercial land, industrial parks, and agricultural farms"
      metaTitle="Land & Plots for Sale in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Genuine titled land for sale across Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
