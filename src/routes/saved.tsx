import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";
import { PropertyCard } from "@/components/site/PropertyCard";
import { LISTINGS, type Listing } from "@/lib/listings";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Your saved properties — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Review the Uganda properties you have saved and pick up your search where you left off.",
      },
      { property: "og:title", content: "Your saved properties — Amdern Properties SMC" },
      { property: "og:description", content: "Review the properties you have saved for later." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedRaw = typeof window !== "undefined" ? localStorage.getItem("saved_properties") : null;
      const savedIds: string[] = savedRaw ? JSON.parse(savedRaw) : ["HSE-001", "FLT-001"];
      const matched = LISTINGS.filter((l) => savedIds.includes(l.id));
      setListings(matched.length > 0 ? matched : LISTINGS.slice(0, 2));
    } catch {
      setListings(LISTINGS.slice(0, 2));
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Page>
        <div className="container-page py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-muted mx-auto" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHero
        eyebrow="My account"
        title="Saved properties"
        subtitle="Properties you have saved are stored on this device so you can come back to them."
      />
      <div className="container-page py-10">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">No saved properties</h2>
            <p className="text-sm text-slate-600 mt-1">
              Browse listings and save the ones you like.
            </p>
            <Link to="/for-sale" className="btn-base btn-primary mt-4 inline-flex">
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
