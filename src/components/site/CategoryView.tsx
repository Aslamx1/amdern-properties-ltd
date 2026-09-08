import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Bed,
  Bath,
  Toilet,
  Maximize,
  MapPin,
  Heart,
  Phone,
  MessageSquare,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Page } from "@/components/site/Page";
import { SITE, PROPERTY_TYPE_GROUPS, CURRENCIES, getWhatsAppLink } from "@/lib/site";
import {
  formatUGX,
  formatUSD,
  formatPrice,
  shortPrice,
  type Listing,
  filterListings,
} from "@/lib/listings";
import { useCurrency, formatWithCurrency } from "@/hooks/use-currency";

type CategoryViewProps = {
  defaultListing: "sale" | "rent" | "shortlet" | "jv";
  defaultCategory?: "houses" | "flats" | "land" | "commercial" | "shortlets" | "offices";
  pageTitle: string;
  pageSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  activeCount: number;
  listings: Listing[];
  videoSrc?: string;
};

const PAGE_SIZE = 9;

export function CategoryView({
  defaultListing,
  defaultCategory,
  pageTitle,
  pageSubtitle,
  metaTitle,
  metaDescription,
  activeCount,
  listings: listingsProp,
  videoSrc,
}: CategoryViewProps) {
  // Filter States
  const [listingType, setListingType] = useState<string>(defaultListing);
  const [categoryType, setCategoryType] = useState<string>(defaultCategory ?? "all");
  const [propertyType, setPropertyType] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [beds, setBeds] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [furnishing, setFurnishing] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const { currency, setCurrencyCode } = useCurrency();
  const [moreFilters, setMoreFilters] = useState<boolean>(false);

  // Page is persisted in the URL (?page=N) so it survives refresh & navigation
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const navigate = useNavigate();
  const urlPageRaw = (search as Record<string, unknown>)["page"];
  const urlPageNum =
    typeof urlPageRaw === "number" ? urlPageRaw : parseInt(String(urlPageRaw ?? ""), 10);

  // Favorites state
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("saved_properties");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("saved_properties", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Filter listings
  const sourceListings = listingsProp;
  const filteredListings = useMemo(() => {
    return filterListings(
      {
        listing: listingType,
        category: categoryType !== "all" ? categoryType : undefined,
        type: propertyType || undefined,
        location: location || undefined,
        beds: beds || undefined,
        min: minPrice || undefined,
        max: maxPrice || undefined,
        furnishing: furnishing || undefined,
        q: keyword || undefined,
        sort: sort || undefined,
      },
      sourceListings,
    );
  }, [
    listingType,
    categoryType,
    propertyType,
    location,
    beds,
    minPrice,
    maxPrice,
    furnishing,
    keyword,
    sort,
    sourceListings,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const requestedPage = Number.isFinite(urlPageNum) && urlPageNum > 0 ? Math.floor(urlPageNum) : 1;
  const currentPage = Math.min(requestedPage, totalPages);
  const setPage = (p: number, opts?: { replace?: boolean }) => {
    const clamped = Math.max(1, Math.min(totalPages, Math.floor(p)));
    const currentSearch = search as Record<string, unknown>;
    const nextSearch = { ...currentSearch };
    if (clamped <= 1) delete nextSearch["page"];
    else nextSearch["page"] = clamped;
    navigate({ search: nextSearch as Record<string, any>, replace: opts?.replace });
  };
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredListings.slice(start, start + PAGE_SIZE);
  }, [filteredListings, currentPage]);

  const handleFilterReset = () => {
    setListingType(defaultListing);
    setCategoryType(defaultCategory ?? "all");
    setPropertyType("");
    setLocation("");
    setBeds(0);
    setMinPrice(0);
    setMaxPrice(0);
    setFurnishing("");
    setKeyword("");
    setSort("");
    setPage(1, { replace: true });
  };

  return (
    <Page>
      {/* Category Header Hero */}
      <div className="border-b border-border bg-secondary/70">
        <div className="container-page py-6 sm:py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link
              to={defaultListing === "sale" ? "/for-sale" : "/for-rent"}
              className="hover:text-primary capitalize"
            >
              For {defaultListing}
            </Link>
            {defaultCategory && (
              <>
                <span>/</span>
                <span className="text-foreground-strong capitalize">
                  {defaultCategory.replace("-", " & ")}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground-strong">
                  {pageTitle}
                </h1>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary border border-primary/20">
                  {filteredListings.length} Active Listings
                </span>
              </div>
              <p className="mt-1.5 text-sm text-foreground-muted max-w-3xl">
                {pageSubtitle} · Verified listings marketed directly by{" "}
                <strong>AMDERN PROPERTIES SMC LTD</strong>.
              </p>
            </div>

            {/* Currency Preference Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1 shadow-2xs">
              <span className="px-2 text-xs font-bold text-muted-foreground uppercase">
                Currency:
              </span>
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrencyCode(c.code)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    currency.code === c.code
                      ? "bg-ink text-white shadow-2xs font-extrabold"
                      : "text-foreground hover:bg-surface-1"
                  }`}
                >
                  {c.code} ({c.symbol})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Uganda Property Centre Filter Bar */}
      <div className="border-b border-border bg-white shadow-xs">
        <div className="container-page py-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Location Filter */}
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Location in Uganda
              </span>
              <input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1, { replace: true });
                }}
                placeholder="e.g. Kira, Naalya, Kololo, Mukono"
                className="w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-xs font-semibold text-foreground-strong placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            {/* Property Type Dropdown */}
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Property Type
              </span>
              <select
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  setPage(1, { replace: true });
                }}
                className="w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-xs font-bold text-foreground-strong focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Property Types</option>
                {PROPERTY_TYPE_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            {/* Bedrooms Filter */}
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Bedrooms
              </span>
              <select
                value={beds}
                onChange={(e) => {
                  setBeds(Number(e.target.value));
                  setPage(1, { replace: true });
                }}
                className="w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-xs font-bold text-foreground-strong focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={0}>Any Bedrooms</option>
                <option value={1}>1+ Bedroom</option>
                <option value={2}>2+ Bedrooms</option>
                <option value={3}>3+ Bedrooms</option>
                <option value={4}>4+ Bedrooms</option>
                <option value={5}>5+ Bedrooms</option>
                <option value={6}>6+ Bedrooms</option>
              </select>
            </label>

            {/* Max Budget Filter */}
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                 Max Budget ({currency.code})
              </span>
              <select
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1, { replace: true });
                }}
                className="w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-xs font-bold text-foreground-strong focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={0}>No Max Budget</option>
                <option value={2_000_000}>USh 2M / $530</option>
                <option value={5_000_000}>USh 5M / $1,330</option>
                <option value={20_000_000}>USh 20M / $5,300</option>
                <option value={100_000_000}>USh 100M / $26,600</option>
                <option value={300_000_000}>USh 300M / $80,000</option>
                <option value={600_000_000}>USh 600M / $160,000</option>
                <option value={1_000_000_000}>USh 1 Billion / $266,000</option>
                <option value={2_500_000_000}>USh 2.5 Billion / $666,000</option>
              </select>
            </label>

            {/* Keyword Search & Reset */}
            <div className="flex items-end gap-2">
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1, { replace: true });
                }}
                placeholder="Keyword / Ref..."
                className="w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-xs font-semibold text-foreground-strong placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleFilterReset}
                className="btn-base btn-outline text-xs px-3 py-2 shrink-0 rounded-lg hover:bg-slate-100"
                title="Reset filters"
              >
                Reset
              </button>
            </div>
          </div>

          {/* More Filters Toggle */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs gap-2">
            <button
              type="button"
              onClick={() => setMoreFilters(!moreFilters)}
              className="flex items-center gap-1.5 font-bold text-primary hover:underline truncate"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
              {moreFilters ? "Fewer filter options" : "More filter options"}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-muted-foreground font-semibold">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-input bg-slate-50 px-2.5 py-1 text-xs font-bold text-foreground-strong focus:outline-none"
              >
                <option value="">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Expanded More Filters Area */}
          {moreFilters && (
            <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3 text-xs">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Furnishing / Service
                </span>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-xs font-bold"
                >
                  <option value="">Any</option>
                  <option value="furnished">Furnished Only</option>
                  <option value="serviced">Serviced Only</option>
                </select>
              </label>

              <div className="sm:col-span-2 flex items-center gap-2 flex-wrap pt-4">
                <span className="font-bold text-muted-foreground">Popular Sub-categories:</span>
                <Link
                  to="/for-sale/houses"
                  className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200 font-semibold"
                >
                  Houses for Sale
                </Link>
                <Link
                  to="/for-sale/flats-apartments"
                  className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200 font-semibold"
                >
                  Flats for Sale
                </Link>
                <Link
                  to="/for-sale/land"
                  className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200 font-semibold"
                >
                  Land for Sale
                </Link>
                <Link
                  to="/for-rent/houses"
                  className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200 font-semibold"
                >
                  Houses for Rent
                </Link>
                <Link
                  to="/for-rent/flats-apartments"
                  className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200 font-semibold"
                >
                  Flats for Rent
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Listings Results Grid */}
      <div className="container-page py-8">
        {paginatedListings.length === 0 ? (
          <div className="surface-card p-12 text-center max-w-xl mx-auto space-y-4">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-extrabold text-foreground-strong">
              No listings match your filter criteria
            </h2>
            <p className="text-sm text-foreground-muted">
              Try adjusting your price range or clearing location filters. Alternatively, post a
              custom request and our team will find it for you.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleFilterReset}
                className="btn-base btn-primary hover:btn-primary-hover"
              >
                Clear all filters
              </button>
              <Link to="/requests/new" className="btn-base btn-outline">
                Post a Property Request
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedListings.map((listing) => {
                const isFav = saved.includes(listing.id);
                const displayPrice = formatWithCurrency(listing.price, currency.code);
                const per =
                  listing.period === "month"
                    ? "/month"
                    : listing.period === "night"
                      ? "/night"
                      : "";
                const mainPhoto = listing.images[0] || "/placeholder.png";

                return (
                  <article
                    key={listing.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-red-200"
                  >
                    {/* Property Photo with UPC Spec Badges & SVG Fallback */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <Link
                        to="/property/$id"
                        params={{ id: listing.slug || listing.id }}
                        className="block h-full w-full"
                      >
                        <img
                          src={mainPhoto}
                          alt={`${listing.title} in ${listing.area}, ${listing.district}`}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Photo count badge */}
                      <span className="absolute bottom-3 left-3 rounded-md bg-black/75 px-2 py-1 text-xs font-bold text-white backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                        📷 {listing.photoCount || listing.images.length || 6} Photos
                      </span>

                      {/* Status / Category Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-xs">
                          For {listing.listing === "jv" ? "Joint Venture" : listing.listing}
                        </span>
                        {listing.badge && (
                          <span className="rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            {listing.badge}
                          </span>
                        )}
                      </div>

                      {/* Save to Favorites Button */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(listing.id)}
                        aria-label="Save property"
                        className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-xs transition-all ${
                          isFav
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-white/90 text-slate-700 hover:text-red-600 hover:bg-white shadow-xs"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFav ? "fill-white" : ""}`} />
                      </button>
                    </div>

                    {/* Listing Content */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        {/* Price Tag in Selected Currency */}
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xl font-extrabold text-red-600">
                            {displayPrice}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              {per}
                            </span>
                          </p>
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            Ref: {listing.ref}
                          </span>
                        </div>

                        {/* Title & Location */}
                        <Link
                          to="/property/$id"
                          params={{ id: listing.slug || listing.id }}
                          className="mt-1.5 block line-clamp-1 text-base font-bold text-slate-900 hover:text-red-600 transition-colors"
                        >
                          {listing.title}
                        </Link>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                          <span className="line-clamp-1">
                            {listing.area}, {listing.district}, {listing.region}
                          </span>
                        </p>

                        {/* Detailed Spec Bar (UPC Spec) */}
                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs font-bold text-slate-700">
                          {listing.beds > 0 && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-3.5 w-3.5 text-slate-400" /> {listing.beds} Beds
                            </span>
                          )}
                          {listing.baths > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-3.5 w-3.5 text-slate-400" /> {listing.baths} Baths
                            </span>
                          )}
                          {listing.toilets > 0 && (
                            <span className="flex items-center gap-1">
                              <Toilet className="h-3.5 w-3.5 text-slate-400" /> {listing.toilets}{" "}
                              Toilets
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Maximize className="h-3.5 w-3.5 text-slate-400" />{" "}
                            {listing.plotSize || `${listing.sizeSqm} sqm`}
                          </span>
                        </div>

                        {/* Marketed by Badge */}
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 rounded-md px-2 py-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>
                            Marketed by <strong>AMDERN PROPERTIES SMC LTD</strong>
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 border-t border-slate-100 pt-4">
                        <Link
                          to="/property/$id"
                          params={{ id: listing.slug || listing.id }}
                          className="btn-base bg-slate-900 hover:bg-slate-800 text-white text-xs px-2 py-2 rounded-lg font-bold text-center"
                        >
                          Details
                        </Link>
                        <a
                          href={getWhatsAppLink(
                            SITE.whatsapp,
                            `Hello AMDERN PROPERTIES SMC LTD, I am interested in: ${listing.title} (Ref: ${listing.ref}, Price: ${formatPrice(listing.price, listing.currency ?? currency.code)}).`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-2 rounded-lg font-bold flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                        <a
                          href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                          className="btn-base border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs px-2 py-2 rounded-lg font-bold flex items-center justify-center gap-1"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls (1, 2, 3, Next ->) */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="btn-base btn-outline px-3 py-2 text-xs rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`h-9 w-9 rounded-lg text-xs font-extrabold transition-colors ${
                      currentPage === pageNum
                        ? "bg-red-600 text-white shadow-2xs"
                        : "border border-input bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="btn-base btn-outline px-3 py-2 text-xs rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
