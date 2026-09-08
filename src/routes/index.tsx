import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Users,
  TrendingUp,
  Home as HomeIcon,
  ArrowRight,
  Search,
  Tag,
  Key,
  Calendar,
  Briefcase,
  House,
  Building2,
  Landmark,
  Store,
  FileText,
  MapPin,
  ChevronDown,
  Shield,
  MessageSquare,
  PlusSquare,
  Bell,
  Heart,
  Mail,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  MapPin as LocationIcon,
  Calculator,
  Star,
} from "lucide-react";
import { Page } from "@/components/site/Page";
import { SearchPanel } from "@/components/site/SearchPanel";
import { PropertyCard } from "@/components/site/PropertyCard";
import { CATEGORIES, REGIONS, SITE } from "@/lib/site";
import {
  getListingsCountAsync,
  getAgentsCountAsync,
  getAreasCountAsync,
  LISTINGS,
} from "@/lib/listings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Property in Uganda for Sale and Rent — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Find houses, apartments, land and commercial property for sale and rent across Uganda with Amdern Properties SMC Limited.",
      },
      {
        property: "og:title",
        content: "Property in Uganda for Sale and Rent — Amdern Properties SMC",
      },
      {
        property: "og:description",
        content:
          "Search thousands of homes, land and commercial property for sale and rent across Uganda.",
      },
      { property: "og:image", content: "https://amdernpropertiessmclimited.com/og-image.png" },
      { property: "og:url", content: "https://amdernpropertiessmclimited.com/" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://amdernpropertiessmclimited.com/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Amdern Properties SMC Limited",
          url: "https://amdernpropertiessmclimited.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://amdernpropertiessmclimited.com/search?location={search_term}",
            "query-input": "required name=search_term",
          },
        }),
      },
    ],
  }),
  component: Home,
});

const CATEGORY_ICONS: Record<string, typeof House> = {
  Houses: House,
  "Flats & Apartments": Building2,
  "Land & Plots": Landmark,
  Commercial: Store,
  Shortlets: Calendar,
  "Office Spaces": Briefcase,
};

function Home() {
  const [listingsCount, setListingsCount] = useState(0);
  const [agentsCount, setAgentsCount] = useState(0);
  const [areasCount, setAreasCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regionOpen, setRegionOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  // Pick the top featured listings for the hero slider — use the real
  // /property-media/* photos that ship in public/.
  const featured = useMemo(
    () =>
      LISTINGS.filter(
        (l) => l.listing === "sale" && Array.isArray(l.images) && l.images.length > 0,
      ).slice(0, 6),
    [],
  );

  // Auto-advance the slider
  useEffect(() => {
    if (featured.length === 0) return;
    const id = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % featured.length);
    }, 5500);
    return () => clearInterval(id);
  }, [featured.length]);

  useEffect(() => {
    const cancelled = { value: false };
    async function load() {
      try {
        const [l, a, ar] = await Promise.all([
          getListingsCountAsync().catch(() => 0),
          getAgentsCountAsync().catch(() => 0),
          getAreasCountAsync().catch(() => 0),
        ]);
        if (!cancelled.value) {
          setListingsCount(l);
          setAgentsCount(a);
          setAreasCount(ar);
        }
      } catch (e) {
        console.error("Home stats load error:", e);
      } finally {
        if (!cancelled.value) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled.value = true;
    };
  }, []);

  const stats = [
    [listingsCount > 0 ? `${listingsCount}+` : "950+", "Active listings"],
    [agentsCount > 0 ? `${agentsCount}+` : "51+", "Active agents"],
    [areasCount > 0 ? `${areasCount}+` : "31+", "Areas covered"],
    ["4", "States covered"],
  ];

  const currentListing = featured[currentSlide];

  return (
    <Page>
      {/* Hero Section with property photo slider — neutral dark overlay (no red) */}
      <section className="relative overflow-hidden bg-slate-900 py-4 sm:py-10 lg:py-14">
        {/* Background photo slider — real /property-media/* photos */}
        <div className="absolute inset-0">
          {featured.map((l, i) => (
            <div
              key={l.id}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === currentSlide ? 1 : 0 }}
            >
              <img
                src={l.images[0]}
                alt={l.title}
                loading={i === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%231e293b'/%3E%3Cstop offset='1' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1600' height='900'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-family='sans-serif' font-size='42' font-weight='bold'%3EAMDERN PROPERTIES%3C/text%3E%3C/svg%3E";
                }}
                className="h-full w-full scale-[1.08] object-cover object-center sm:scale-100"
              />
            </div>
          ))}
          {/* Neutral dark gradient overlay (no red) — keeps photos clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        </div>

        {/* Hero Content */}
        <div className="relative mx-auto flex max-w-content flex-col items-center gap-3 px-3 text-center sm:gap-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/25 bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            {SITE.tagline}
          </span>

          <h1 className="max-w-2xl text-[1.9rem] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
            Find the right property
          </h1>
          <p className="max-w-xl text-[0.75rem] leading-5 text-white/85 drop-shadow sm:text-sm">
            Search thousands of homes, land and commercial property for sale and rent — across every
            major city in Uganda.
          </p>

          {/* Search Panel with solid backdrop */}
          <div className="mx-auto w-full max-w-[1080px] rounded-2xl bg-white dark:bg-card p-1.5 shadow-2xl ring-1 ring-slate-200/80 dark:ring-border sm:p-3">
            <SearchPanel initial={{ listing: "sale" }} />
          </div>

          {/* Stats */}
          <div className="grid w-full max-w-[1080px] grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-white/15 pt-2">
            {stats.map(([n, l]) => (
              <div key={l} className="text-center rounded-xl bg-black/20 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-2 sm:p-0">
                <p className="text-base sm:text-xl font-extrabold text-white tabular-nums drop-shadow">
                  {loading ? "..." : n}
                </p>
                <p className="text-[10px] text-white/80 sm:text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slider Controls — Bottom Right */}
        {featured.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-1.5 sm:bottom-4 sm:right-4">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setCurrentSlide((s) => (s - 1 + featured.length) % featured.length)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white transition-all hover:bg-white/25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setCurrentSlide((s) => (s + 1) % featured.length)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white transition-all hover:bg-white/25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Slide indicator dots — Bottom Center */}
        {featured.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
            {featured.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}

        {/* Featured Property Card — Bottom Left */}
        {currentListing && (
          <div className="absolute bottom-10 left-3 z-10 hidden max-w-[260px] sm:bottom-12 sm:left-4 sm:block lg:bottom-4 lg:left-4 lg:max-w-[300px]">
            <div className="rounded-lg border border-white/25 bg-white/10 p-2.5 backdrop-blur-xl shadow-2xl lg:p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                Featured · {String(currentSlide + 1).padStart(2, "0")} /{" "}
                {String(featured.length).padStart(2, "0")}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs font-extrabold text-white lg:text-sm">
                {currentListing.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/80">
                <LocationIcon className="h-2.5 w-2.5" />
                {currentListing.area}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs font-extrabold text-white lg:text-sm">
                  {(() => {
                    const v = currentListing.price;
                    return `USh ${v.toLocaleString("en-US")}`;
                  })()}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-white/80">
                  {currentListing.beds ? (
                    <span className="flex items-center gap-0.5">
                      <Bed className="h-2.5 w-2.5" /> {currentListing.beds}
                    </span>
                  ) : null}
                  {currentListing.baths ? (
                    <span className="flex items-center gap-0.5">
                      <Bath className="h-2.5 w-2.5" /> {currentListing.baths}
                    </span>
                  ) : null}
                </div>
              </div>
              <Link
                to="/property/$id"
                params={{ id: currentListing.slug || currentListing.id }}
                className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-slate-900 transition-all hover:bg-slate-100"
              >
                View property <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Browse by type */}
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Browse by type
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            What kind of property are you after?
          </h2>
          <p className="mt-2 text-sm">Jump straight into the category that fits your search.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.name] || House;
              return (
                <Link
                  key={c.slug}
                  to="/search"
                  search={{ category: c.slug } as never}
                  className="group flex flex-col gap-3 sm:gap-4 rounded-lg border border-border bg-card p-4 sm:p-5 transition-colors hover:bg-surface-1"
                >
                  <span className="mx-auto flex size-10 sm:size-12 items-center justify-center rounded-lg bg-red-50 text-primary">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-bold text-foreground-strong">{c.name}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">{c.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular locations */}
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Popular locations
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Explore property by city</h2>
          <p className="mt-2 text-sm">
            Find where your next home could be, from buzzing cities to quiet neighbourhoods.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {REGIONS.map((r) => (
              <Link
                key={r.slug}
                to="/search"
                search={{ location: r.name } as never}
                className="group flex h-full flex-col justify-between gap-4 sm:gap-6 rounded-lg border border-border bg-card p-4 sm:p-6 transition-colors hover:bg-surface-1"
              >
                <div>
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary">
                    Available now
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground-strong">
                    {r.count}
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground-strong">{r.name}</p>
                  <p className="text-[0.8125rem] text-foreground-muted">
                    properties for sale &amp; rent
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Market report banner */}
          <Link
            to="/market-trends/reports"
            className="group mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-surface-1"
          >
            <div className="flex items-center gap-4">
              <span className="hidden size-10 shrink-0 items-center justify-center rounded-md bg-surface-1 text-primary sm:flex">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary">
                  New · Q3 2026
                </p>
                <h3 className="mt-1 text-base font-bold text-foreground-strong">
                  Uganda Property Market Report
                </h3>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  Median asking prices from 439 listings across 1 region and 3 areas.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
              Read the report <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Why Property Centre */}
      <section className="bg-card">
        <div className="mx-auto max-w-content px-4 py-10 text-center sm:px-6 sm:py-14 lg:py-[88px]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Why {SITE.short}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            A smarter, safer way to find property
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
            We built {SITE.name} to take the guesswork and risk out of house-hunting in Uganda.
          </p>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Reviewed listings",
                body: "Listings are reviewed by our team, and you can report anything that looks wrong.",
              },
              {
                icon: Users,
                title: "Agents & developers",
                body: "Connect directly with agencies and developers listing across the country.",
              },
              {
                icon: Search,
                title: "Powerful search",
                body: "Filter by location, budget, property type and amenities to find the right place fast.",
              },
              {
                icon: Heart,
                title: "Free for seekers",
                body: "Browsing, saving and enquiring on any property is completely free — no fees, ever.",
              },
            ].map((w) => (
              <div key={w.title} className="rounded-lg">
                <span className="flex size-[52px] items-center justify-center rounded-full bg-red-50 text-primary">
                  <w.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{w.title}</h3>
                <p className="mt-1 text-[0.8125rem] text-foreground-muted">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* List with Property Centre */}
      <section className="bg-card">
        <div className="mx-auto flex max-w-content flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
              List with {SITE.short}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Are you an estate agent or developer?
            </h2>
            <p className="mt-3 text-sm text-foreground-muted">
              List your properties on {SITE.name} and put them in front of thousands of serious
              buyers and renters every day.
            </p>
            <Link to="/list-property" className="btn-base btn-primary hover:btn-primary-hover mt-5">
              List a property <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="lg:w-[430px]">
            <div className="space-y-4">
              {[
                {
                  icon: Users,
                  t: "Thousands of property seekers",
                  b: "Reach serious property seekers nationwide",
                },
                { icon: HomeIcon, t: "Free to list", b: "Post your first property at no cost" },
                {
                  icon: TrendingUp,
                  t: "Leads dashboard",
                  b: "See who viewed your listings and who got in touch",
                },
              ].map((i) => (
                <div key={i.t} className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-primary">
                    <i.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground-strong">{i.t}</p>
                    <p className="text-xs text-foreground-muted">{i.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by region */}
      <section className="border-t border-divider bg-surface-1">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setRegionOpen(!regionOpen)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <h2 className="text-xl font-extrabold sm:text-2xl">Browse by region in Uganda</h2>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${regionOpen ? "rotate-180" : ""}`}
            />
          </button>
          {regionOpen && (
            <div className="grid gap-x-8 gap-y-6 pb-10 sm:grid-cols-2 lg:grid-cols-4">
              {REGIONS.map((r) => (
                <div key={r.slug}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-primary">
                    <span className="grid h-6 w-6 place-items-center rounded bg-secondary text-xs">
                      {r.letter}
                    </span>
                    {r.name}
                  </p>
                  <ul className="space-y-2.5 text-sm">
                    <li>
                      <Link
                        to="/search"
                        search={{ location: r.name } as never}
                        className="font-semibold text-foreground-strong hover:text-primary"
                      >
                        {r.name}
                      </Link>
                    </li>
                    {r.districts.map((d) => (
                      <li key={d}>
                        <Link
                          to="/search"
                          search={{ location: d } as never}
                          className="text-foreground-muted hover:text-primary"
                        >
                          {d}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tools */}
      <section className="bg-surface-1">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Tools</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Plan your purchase</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/mortgage-calculator"
              className="surface-card flex items-center gap-4 p-5 transition-all hover:shadow-lg"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground-strong">Mortgage Calculator</h3>
                <p className="text-xs text-muted-foreground">Estimate monthly repayments</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Recently viewed */}
      <RecentlyViewed />
    </Page>
  );
}

const TESTIMONIALS = [
  {
    name: "Mukasa David",
    role: "Home buyer, Naalya",
    text: "Amdern Properties helped me find my dream home in just two weeks. The team was professional and the property matched the listing perfectly.",
    rating: 5,
  },
  {
    name: "Sarah Namubiru",
    role: "Land investor, Wakiso",
    text: "I bought land through AMDERN and the title verification process was smooth. Highly recommended for serious buyers.",
    rating: 5,
  },
  {
    name: "Dr. Ronald Kigozi",
    role: "Commercial landlord, Kampala",
    text: "The market insights and pricing advice helped me set the right rent for my apartment block. Great platform.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section className="bg-surface-1">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Testimonials</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">What our clients say</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="surface-card p-5">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground-strong">"{t.text}"</p>
              <div className="mt-4">
                <p className="text-sm font-extrabold text-foreground-strong">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RECENT_KEY = "amdern_recently_viewed";

function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(RECENT_KEY) : null;
      setIds(raw ? JSON.parse(raw) : []);
    } catch {
      setIds([]);
    }
  }, []);

  const view = (id: string) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return { ids, view };
}

function RecentlyViewed() {
  const { ids } = useRecentlyViewed();
  const items = useMemo(() => LISTINGS.filter((l) => ids.includes(l.id)).slice(0, 4), [ids]);

  if (items.length === 0) return null;

  return (
    <section className="bg-surface-1">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Recently viewed</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Pick up where you left off</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </section>
  );
}
