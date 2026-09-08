import { Link } from "@tanstack/react-router";
import { Bed, Bath, Toilet, Maximize, MapPin, Heart, GitCompare } from "lucide-react";
import { type Listing } from "@/lib/listings";
import { useCurrency, formatWithCurrency } from "@/hooks/use-currency";
import { useCompare } from "@/hooks/use-compare";

export function PropertyCard({ listing }: { listing: Listing }) {
  const { currency } = useCurrency();
  const { items, add, remove } = useCompare();
  const isCompared = items.some((p) => p.id === listing.id);
  const per = listing.period === "month" ? "/month" : listing.period === "night" ? "/night" : "";
  const displayPrice = formatWithCurrency(listing.price, currency.code);
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-lg">
      <Link
        to="/property/$id"
        params={{ id: listing.slug || listing.id }}
        className="block"
        aria-label={listing.title}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={`${listing.title} in ${listing.area}, ${listing.district}`}
              loading="lazy"
              width={1200}
              height={800}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
              }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-xs font-semibold text-gray-500">No image</span>
            </div>
          )}
          {listing.badge && (
            <span className="absolute left-3 top-3 rounded-md bg-ink/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-foreground">
              {listing.badge}
            </span>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            For {listing.listing === "jv" ? "joint venture" : listing.listing}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-lg font-extrabold text-foreground-strong">
          {displayPrice}
          <span className="text-xs font-semibold text-muted-foreground">{per}</span>
        </p>
        <Link to="/property/$id" params={{ id: listing.slug || listing.id }}>
          <h3 className="mt-1 line-clamp-1 text-sm font-bold text-foreground-strong hover:text-primary">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {listing.area}, {listing.district}, {listing.region}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs font-semibold text-foreground-strong">
          {listing.beds > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-muted-foreground" /> {listing.beds}
            </span>
          )}
          {listing.baths > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-muted-foreground" /> {listing.baths}
            </span>
          )}
          {listing.toilets > 0 && (
            <span className="flex items-center gap-1">
              <Toilet className="h-3.5 w-3.5 text-muted-foreground" /> {listing.toilets}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5 text-muted-foreground" /> {listing.sizeSqm} sqm
          </span>
          <span className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => (isCompared ? remove(listing.id) : add(listing))}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
                isCompared ? "bg-primary text-white" : "bg-secondary text-foreground-strong hover:bg-border"
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" /> {isCompared ? "Comparing" : "Compare"}
            </button>
            <span className="text-muted-foreground">Ref {listing.ref}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
