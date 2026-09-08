import { createFileRoute } from "@tanstack/react-router";
import { CategoryView } from "@/components/site/CategoryView";
import { getListings } from "@/lib/db";

export const Route = createFileRoute("/for-rent/flats-apartments")({
  loader: async () => {
    const data = await getListings({ listing: "rent", category: "flats" });
    return { listings: data };
  },
  head: () => ({
    meta: [
      { title: "Flats & Apartments for Rent in Uganda — Furnished & Serviced | AMDERN PROPERTIES" },
      {
        name: "description",
        content:
          "Furnished apartments, serviced shortlets, and modern 1-3 bedroom flats for rent in Kololo, Nakasero, Bugolobi, Naalya, and Kisaasi.",
      },
      {
        property: "og:title",
        content: "Flats & Apartments for Rent in Uganda — AMDERN PROPERTIES SMC LTD",
      },
      {
        property: "og:description",
        content: "Furnished and unfurnished rental flats and apartments across Uganda.",
      },
    ],
  }),
  component: FlatsForRentPage,
});

function FlatsForRentPage() {
  const { listings } = Route.useLoaderData();
  return (
    <CategoryView
      defaultListing="rent"
      defaultCategory="flats"
      pageTitle="Flats & Apartments for Rent in Uganda"
      pageSubtitle="Furnished corporate apartments, serviced shortlets, modern studio flats, and executive multi-bedroom rentals"
      metaTitle="Flats & Apartments for Rent in Uganda — AMDERN PROPERTIES SMC LTD"
      metaDescription="Verified flats and apartments for rent in Uganda."
      activeCount={listings.length}
      listings={listings}
    />
  );
}
