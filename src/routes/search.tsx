import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Page } from "@/components/site/Page";
import { SearchPanel } from "@/components/site/SearchPanel";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { filterListingsAsync, type Filters, LISTINGS } from "@/lib/listings";
import type { Listing } from "@/lib/listings";
import { injectInFeedAds, getActiveAds, type AdPlacement } from "@/lib/ads";
import { InFeedAdCard } from "@/components/ads/InFeedAdCard";

type SearchParams = Filters;

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    listing: typeof s["listing"] === "string" ? s["listing"] : undefined,
    location: typeof s["location"] === "string" ? s["location"] : undefined,
    type: typeof s["type"] === "string" ? s["type"] : undefined,
    category: typeof s["category"] === "string" ? s["category"] : undefined,
    furnishing: typeof s["furnishing"] === "string" ? s["furnishing"] : undefined,
    q: typeof s["q"] === "string" ? s["q"] : undefined,
    sort: typeof s["sort"] === "string" ? s["sort"] : undefined,
    min: s["min"] ? Number(s["min"]) : undefined,
    max: s["max"] ? Number(s["max"]) : undefined,
    beds: s["beds"] ? Number(s["beds"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Property search — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "Search property for sale, rent and shortlet across Uganda by location, price and type.",
      },
      { property: "og:title", content: "Property search — Amdern Properties SMC Limited" },
      {
        property: "og:description",
        content: "Filter Ugandan property by location, budget, type and bedrooms.",
      },
      { property: "og:image", content: "https://amdernpropertiessmclimited.com/og-image.png" },
      { property: "og:url", content: "https://amdernpropertiessmclimited.com/search" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://amdernpropertiessmclimited.com/search" },
    ],
  }),
  component: SearchPage,
});

const SORTS = [
  { key: "", label: "Most relevant" },
  { key: "newest", label: "Newest first" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [results, setResults] = useState<Listing[]>([]);
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [r, loadedAds] = await Promise.all([
          filterListingsAsync(search),
          getActiveAds("search_feed"),
        ]);
        if (!cancelled) {
          setResults(r);
          setAds(loadedAds);
        }
      } catch (e) {
        console.error("Search load error:", e);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const label =
    search.listing === "rent"
      ? "for rent"
      : search.listing === "shortlet"
        ? "shortlets"
        : search.listing === "jv"
          ? "joint ventures"
          : "for sale";

  return (
    <Page>
      <div className="border-b border-border bg-secondary">
        <div className="container-page py-3.5 sm:py-6">
          {/* Mobile Filter Toggle Button */}
          <div className="sm:hidden mb-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex w-full items-center justify-between rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-xs"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>{filtersOpen ? "Hide Filter Options" : "Filter & Refine Search"}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {(search.location || search.type || search.beds) && (
                  <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                    Filtered
                  </span>
                )}
                {filtersOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>
          </div>

          <div className={`${filtersOpen ? "block" : "hidden sm:block"} surface-card p-3 sm:p-4`}>
            <SearchPanel
              initial={{
                listing: search.listing,
                location: search.location,
                type: search.type,
                min: search.min,
                max: search.max,
                beds: search.beds,
                furnishing: (search as SearchParams).furnishing,
                q: (search as SearchParams).q,
              }}
              compact
            />
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">
              Property {label} {search.location ? `in ${search.location}` : "in Uganda"}
            </h1>
            <p className="mt-1 text-sm">
              {results.length} {results.length === 1 ? "property" : "properties"} found
              {search.type ? ` · ${search.type}` : ""}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold">
            Sort
            <select
              value={search.sort ?? ""}
              onChange={(e) =>
                navigate({ search: { ...search, sort: e.target.value || undefined } as never })
              }
              className="rounded-md border border-input bg-background px-2 py-2 text-xs font-bold text-foreground-strong"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <h2 className="text-lg font-extrabold">No properties match your search</h2>
            <p className="mt-2 text-sm">
              Try widening your price range, or removing the location filter.
            </p>
            <Link to="/search" search={{} as never} className="btn-base btn-primary mt-4">
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {injectInFeedAds(results, ads, 5).map((item, index) =>
              item.type === "property" ? (
                <PropertyCard key={item.data.id} listing={item.data} />
              ) : (
                <InFeedAdCard key={`ad-${item.data.id}-${index}`} ad={item.data} />
              )
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
