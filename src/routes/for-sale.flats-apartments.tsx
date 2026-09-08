import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-sale/flats-apartments")({
  loader: async () => {
    const data = await getListings({ listing: "sale", category: "flats" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      {
        title: "Flats & Apartments for Sale in Uganda — Condominiums & Blocks | AMDERN PROPERTIES",
      },
      {
        name: "description",
        content:
          "Browse condominiums, luxury apartments, and residential blocks of flats for sale in Kololo, Nakasero, Lubowa, Kyanja, and Naguru.",
      },
      {
        property: "og:title",
        content: "Flats & Apartments for Sale in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Buy condominiums, serviced apartments, and investment blocks of flats in Uganda.",
      },
    ],
  }),
  component: FlatsForSalePage,
});

function FlatsForSalePage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="sale"
      defaultCategory="flats"
      pageTitle="Flats & Apartments for Sale in Uganda"
      pageSubtitle="Modern condominiums, multi-unit investment apartments, and luxury high-rise flats"
      metaTitle="Flats & Apartments for Sale in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Verified flats and apartments for sale in Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
