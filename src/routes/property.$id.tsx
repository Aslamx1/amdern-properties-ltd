import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
  Bed,
  Bath,
  Toilet,
  Maximize,
  MapPin,
  Phone,
  Mail,
  Check,
  Share2,
  Heart,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  GitCompare,
} from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components/site/Page";
import { PropertyCard } from "@/components/site/PropertyCard";
import {
  formatUGX,
  listingByIdAsync,
  agentByIdAsync,
  LISTINGS,
  generatePropertySchema,
} from "@/lib/listings";
import type { Listing } from "@/lib/listings";
import { saveEnquiryLocal } from "@/lib/db";
import { useCurrency, formatWithCurrency } from "@/hooks/use-currency";
import { useCompare } from "@/hooks/use-compare";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/property/$id")({
  loader: async ({ params }) => {
    const listing = await listingByIdAsync(params.id);
    if (!listing) throw notFound();

    // 301 Permanent Redirect: If accessed via old ID or ref, redirect to the canonical SEO slug
    if (listing.slug && params.id !== listing.slug && !params.id.includes("-for-")) {
      throw redirect({
        to: "/property/$id",
        params: { id: listing.slug },
        statusCode: 301,
      });
    }

    const agent = await agentByIdAsync(listing.agentId || "");
    return { listing, agent: agent || null };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Property Not Found — Amdern Properties SMC Limited" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }
    const l = loaderData.listing;
    const title =
      l.metaTitle ||
      `${l.beds > 0 ? `${l.beds} Bed ` : ""}${l.type} for ${l.listing === "rent" ? "Rent" : "Sale"} in ${l.area}, ${l.district} — Amdern Properties`;
    const description =
      l.metaDescription ||
      `${l.title} in ${l.area}, ${l.district}. ${l.beds > 0 ? `${l.beds} beds, ` : ""}${l.baths > 0 ? `${l.baths} baths, ` : ""}${formatUGX(l.price)}. Ref ${l.ref}. Verified real estate by AMDERN PROPERTIES SMC LTD.`;
    const canonicalSlug = l.slug || l.id;
    const canonicalUrl = `https://amdernpropertiessmclimited.com/property/${canonicalSlug}`;
    const image = l.images?.[0] || "https://amdernpropertiessmclimited.com/placeholder.png";
    const schemaJson = generatePropertySchema(l, canonicalUrl);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        // OpenGraph / Facebook
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:url", content: canonicalUrl },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Amdern Properties SMC Limited" },
        { property: "og:locale", content: "en_US" },
        // Twitter Cards
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:site", content: "@AmdernProperties" },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(schemaJson),
        },
      ],
    };
  },
  notFoundComponent: PropertyNotFound,
  component: PropertyDetail,
});

function PropertyNotFound() {
  return (
    <Page>
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold">This property is no longer available</h1>
        <p className="mt-2 text-sm">It may have been sold, let or withdrawn.</p>
        <Link to="/search" search={{} as never} className="btn-base btn-primary mt-5">
          Browse all property
        </Link>
      </div>
    </Page>
  );
}

function PropertyDetail() {
  const { listing } = Route.useLoaderData();
  const { currency } = useCurrency();
  const [active, setActive] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);
  const [sent, setSent] = useState(false);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("saved_properties") : null;
      const saved: string[] = raw ? JSON.parse(raw) : [];
      return saved.includes(listing.id);
    } catch {
      return false;
    }
  });
  const per = listing.period === "month" ? " /month" : listing.period === "night" ? " /night" : "";

  useEffect(() => {
    try {
      const raw = localStorage.getItem("amdern_recently_viewed");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [listing.id, ...list.filter((x) => x !== listing.id)].slice(0, 6);
      localStorage.setItem("amdern_recently_viewed", JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [listing.id]);

  const toggleSave = () => {
    setIsSaved((prev) => {
      const next = prev
        ? (() => {
            const raw = localStorage.getItem("saved_properties");
            const list: string[] = raw ? JSON.parse(raw) : [];
            const updated = list.filter((id) => id !== listing.id);
            localStorage.setItem("saved_properties", JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent("saved-change"));
            toast.success("Removed from saved", { description: listing.title });
            return false;
          })()
        : (() => {
            const raw = localStorage.getItem("saved_properties");
            const list: string[] = raw ? JSON.parse(raw) : [];
            const updated = [...list, listing.id];
            localStorage.setItem("saved_properties", JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent("saved-change"));
            toast.success("Saved property", { description: listing.title });
            return true;
          })();
      return next;
    });
  };

  useEffect(() => {
    const similarList = LISTINGS.filter(
      (l) => l.category === listing.category && l.id !== listing.id,
    ).slice(0, 3);
    setSimilar(similarList);
  }, [listing.category, listing.id]);

  return (
    <Page>
      <div className="container-page py-6 pb-28 sm:pb-32 xl:pb-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/search"
            search={{ listing: listing.listing } as never}
            className="hover:text-primary"
          >
            For {listing.listing}
          </Link>
          <span>/</span>
          <Link
            to="/search"
            search={{ location: listing.district } as never}
            className="hover:text-primary"
          >
            {listing.district}
          </Link>
          <span>/</span>
          <span className="text-foreground-strong">{listing.title}</span>
        </nav>

        <div className="grid gap-5 xl:grid-cols-[2.1fr_1fr] xl:gap-6">
          <div>
            <div className="surface-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div
                className="bg-slate-100 p-2 sm:p-2.5 cursor-pointer"
                onClick={() => setExpanded(true)}
              >
                {listing.video && active === 0 ? (
                  <video
                    src={listing.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    poster={listing.images[0] || "/placeholder.png"}
                    className="w-full max-h-[260px] rounded-lg object-contain sm:max-h-[330px]"
                  />
                ) : (
                  <img
                    src={listing.images[active] || "/placeholder.png"}
                    alt={`${listing.title} — photo ${active + 1}`}
                    width={1200}
                    height={800}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                    }}
                    className="w-full max-h-[260px] rounded-lg object-contain sm:max-h-[330px]"
                  />
                )}
              </div>

              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-slate-50 p-2.5">
                  {listing.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-14 sm:w-20 ${
                        i === active ? "border-primary shadow-sm" : "border-transparent"
                      }`}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                        }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="surface-card mt-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold">{listing.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {listing.area}, {listing.district}, {listing.region}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-primary">
                    {formatWithCurrency(listing.price, currency.code)}
                    <span className="text-sm font-semibold text-muted-foreground">{per}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Ref {listing.ref}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 border-y border-border py-4 text-sm font-bold text-foreground-strong">
                {listing.beds > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Bed className="h-4 w-4 text-muted-foreground" /> {listing.beds} beds
                  </span>
                )}
                {listing.baths > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-muted-foreground" /> {listing.baths} baths
                  </span>
                )}
                {listing.toilets > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Toilet className="h-4 w-4 text-muted-foreground" /> {listing.toilets} toilets
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Maximize className="h-4 w-4 text-muted-foreground" /> {listing.sizeSqm} sqm
                </span>
                <span className="ml-auto flex gap-2">
                  <button onClick={toggleSave} className={`btn-base ${isSaved ? "btn-primary" : "btn-outline"} px-3 py-1.5 text-xs`}>
                    <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-white" : ""}`} /> {isSaved ? "Saved" : "Save"}
                  </button>
                  <CompareButton listing={listing} />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied", { description: "Property link copied to clipboard." });
                    }}
                    className="btn-base btn-outline px-3 py-1.5 text-xs"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                </span>
              </div>

              <h2 className="mt-5 text-lg font-extrabold">Description</h2>
              <p className="mt-2 text-sm leading-relaxed">{listing.description}</p>

              <h2 className="mt-6 text-lg font-extrabold">Features</h2>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {listing.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {f}
                  </li>
                ))}
              </ul>

              <h2 className="mt-6 text-lg font-extrabold">Property details</h2>
              <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {[
                  ["Type", listing.type],
                  ["Listing", `For ${listing.listing}`],
                  ["Furnishing", listing.furnished ? "Furnished" : "Unfurnished"],
                  ["Serviced", listing.serviced ? "Yes" : "No"],
                  [
                    "Added to site",
                    listing.addedDaysAgo === 0 ? "Today" : `${listing.addedDaysAgo} days ago`,
                  ],
                  ["Reference", listing.ref],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border py-1.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-bold text-foreground-strong">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="surface-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Marketed by
              </p>
              <h3 className="mt-1 text-sm font-extrabold text-foreground-strong">
                AMDERN PROPERTIES SMC LTD
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Verified Real Estate Agency · Kampala, Uganda
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:+256702104499`}
                  className="btn-base btn-ink text-[10px] px-2 py-2 w-full"
                >
                  <Phone className="h-3.5 w-3.5" /> Call +256 702 104 499
                </a>
                <a
                  href={`tel:+256786793139`}
                  className="btn-base btn-ink text-[10px] px-2 py-2 w-full"
                >
                  <Phone className="h-3.5 w-3.5" /> Call +256 786 793 139
                </a>
              </div>

              <a
                href={`https://wa.me/256702104499?text=${encodeURIComponent(`Hello AMDERN PROPERTIES SMC LTD, I am interested in: ${listing.title} (Ref: ${listing.ref}, Price: ${formatWithCurrency(listing.price, currency.code)}). Please provide more details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white mt-2 w-full text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Inquire via WhatsApp
              </a>

              <div className="my-4 border-t border-border pt-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email Enquiry to amdernsmcpropertiesltd@gmail.com
                </h4>

                {sent ? (
                  <div className="mt-3 rounded-md bg-success-bg p-3 text-xs font-bold text-success">
                    Enquiry saved successfully! Our team will get back to you shortly.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const uName =
                        (form.elements.namedItem("uName") as HTMLInputElement)?.value || "Client";
                      const uEmail =
                        (form.elements.namedItem("uEmail") as HTMLInputElement)?.value || "";
                      const uPhone =
                        (form.elements.namedItem("uPhone") as HTMLInputElement)?.value || "";
                      const uMsg =
                        (form.elements.namedItem("uMsg") as HTMLTextAreaElement)?.value || "";

                      saveEnquiryLocal({
                        listing: listing.id,
                        listingTitle: listing.title,
                        name: uName,
                        email: uEmail,
                        phone: uPhone,
                        message: uMsg,
                      });

                      const mailto = `mailto:amdernsmcpropertiesltd@gmail.com?subject=${encodeURIComponent(`[Property Enquiry Ref:${listing.ref}] ${listing.title}`)}&body=${encodeURIComponent(`Property: ${listing.title}\nRef: ${listing.ref}\nPrice: ${formatWithCurrency(listing.price, currency.code)}\nLocation: ${listing.area}, ${listing.district}\n\nClient Name: ${uName}\nClient Email: ${uEmail}\nClient Phone: ${uPhone}\n\nMessage:\n${uMsg}`)}`;
                      window.location.href = mailto;
                      setSent(true);
                    }}
                    className="mt-3 space-y-2"
                  >
                    <input
                      name="uName"
                      required
                      placeholder="Your full name *"
                      className="w-full rounded-md border border-input px-3 py-2 text-xs"
                    />
                    <input
                      name="uEmail"
                      required
                      type="email"
                      placeholder="Your email address *"
                      className="w-full rounded-md border border-input px-3 py-2 text-xs"
                    />
                    <input
                      name="uPhone"
                      required
                      placeholder="Your phone / WhatsApp *"
                      className="w-full rounded-md border border-input px-3 py-2 text-xs"
                    />
                    <textarea
                      name="uMsg"
                      rows={3}
                      defaultValue={`I am interested in ${listing.title} (Ref ${listing.ref}) listed at ${formatWithCurrency(listing.price, currency.code)}. Please send me more details and schedule a viewing.`}
                      className="w-full rounded-md border border-input px-3 py-2 text-xs"
                    />
                    <button
                      type="submit"
                      className="btn-base btn-primary hover:btn-primary-hover w-full py-2 text-[10px]"
                    >
                      <Mail className="h-3.5 w-3.5" /> Send Email to
                      amdernsmcpropertiesltd@gmail.com
                    </button>
                  </form>
                )}
              </div>
            </div>
            <div className="surface-card p-5">
              <h2 className="text-sm font-extrabold">Safety & Viewing Tips</h2>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li>
                  • Always inspect the property in person with verified AMDERN representatives.
                </li>
                <li>
                  • Never make cash or mobile money deposits before official site verification.
                </li>
                <li>• Verify land title search reports directly at the Ministry of Lands.</li>
                <li>• Contact our office directly on +256 702 104 499 for any clarifications.</li>
              </ul>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-xl font-extrabold">Similar properties</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l: Listing) => (
                <PropertyCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Quick Contact Bar */}
      <div className="fixed bottom-[calc(3.5rem+max(0.35rem,env(safe-area-inset-bottom)))] left-0 right-0 z-30 block border-t border-border bg-white dark:bg-card p-2.5 shadow-md xl:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <a
            href="tel:+256702104499"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition-all"
          >
            <Phone className="h-3.5 w-3.5" /> Call Agent
          </a>
          <a
            href={`https://wa.me/256702104499?text=${encodeURIComponent(
              `Hello AMDERN PROPERTIES, I am interested in: ${listing.title} (Ref: ${listing.ref}, Price: ${formatWithCurrency(listing.price, currency.code)}). Please provide more details.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>

      {/* Photo Expand Modal — Full Responsive Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-6"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative flex flex-col items-center justify-center w-full max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center w-full max-h-[80vh] overflow-hidden rounded-xl">
              <img
                src={listing.images[active] || "/placeholder.png"}
                alt={`${listing.title} — photo ${active + 1}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                }}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />

              {/* Prev / Next photo buttons in lightbox */}
              {listing.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive((a) => (a - 1 + listing.images.length) % listing.images.length);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive((a) => (a + 1) % listing.images.length);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            {/* Photo Counter and Close button */}
            <div className="mt-3 flex items-center justify-between w-full px-2 text-white text-xs">
              <span className="font-semibold">
                Photo {active + 1} of {listing.images.length}
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 font-bold hover:bg-white/30 transition-colors"
                aria-label="Close photo preview"
              >
                <X className="size-4" /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

function CompareButton({ listing }: { listing: Listing }) {
  const { items, add, remove } = useCompare();
  const isCompared = items.some((p) => p.id === listing.id);

  return (
    <button
      type="button"
      onClick={() => (isCompared ? remove(listing.id) : add(listing))}
      className={`btn-base px-3 py-1.5 text-xs ${isCompared ? "btn-primary" : "btn-outline"}`}
    >
      <GitCompare className="h-3.5 w-3.5" /> {isCompared ? "Comparing" : "Compare"}
    </button>
  );
}
