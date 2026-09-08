import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Page";
import { useCompare } from "@/hooks/use-compare";
import { X, GitCompare } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare properties — Amdern Properties SMC" },
      {
        name: "description",
        content: "Compare selected properties side by side.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { items, remove, clear } = useCompare();
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? items : items.slice(0, 2);

  if (items.length < 2) {
    return (
      <Page>
        <PageHero
          eyebrow="Compare"
          title="Compare properties"
          subtitle="Select at least 2 properties to compare."
        />
        <div className="container-page py-10 text-center">
          <GitCompare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No properties to compare</h2>
          <p className="text-sm text-slate-600 mt-1">
            Browse listings and click <strong>Compare</strong> to add properties here.
          </p>
          <Link to="/search" search={{ listing: "sale" } as never} className="btn-base btn-primary mt-4 inline-flex">
            Browse properties
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHero
        eyebrow="Compare"
        title={`Comparing ${items.length} properties`}
        subtitle="Side-by-side comparison to help you choose."
      />
      <div className="container-page py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground">
            Showing {display.length} of {items.length}
          </p>
          <div className="flex items-center gap-2">
            {items.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAll((p) => !p)}
                className="btn-base btn-outline text-xs"
              >
                {showAll ? "Show less" : `Show all (${items.length})`}
              </button>
            )}
            <button type="button" onClick={clear} className="btn-base btn-outline text-xs">
              Clear all
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-40">
                  Feature
                </th>
                {display.map((item) => (
                  <th key={item.id} className="p-3 text-left min-w-[220px]">
                    <div className="flex items-start gap-3">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={item.images[0] || "/placeholder.png"}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground-strong line-clamp-2">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.area}, {item.district}</p>
                        <Link to="/property/$id" params={{ id: item.slug || item.id }} className="text-xs font-bold text-primary hover:underline">
                          View details
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="ml-auto rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${item.title} from comparison`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <CompareRow label="Price" values={display.map((i) => `USh ${i.price.toLocaleString("en-US")}`)} />
              <CompareRow label="Type" values={display.map((i) => i.type)} />
              <CompareRow label="Listing" values={display.map((i) => `For ${i.listing}`)} />
              <CompareRow label="Bedrooms" values={display.map((i) => `${i.beds}`)} />
              <CompareRow label="Bathrooms" values={display.map((i) => `${i.baths}`)} />
              <CompareRow label="Toilets" values={display.map((i) => `${i.toilets}`)} />
              <CompareRow label="Size" values={display.map((i) => `${i.sizeSqm} sqm`)} />
              <CompareRow label="Furnished" values={display.map((i) => i.furnished ? "Yes" : "No")} />
              <CompareRow label="Serviced" values={display.map((i) => i.serviced ? "Yes" : "No")} />
              <CompareRow label="Location" values={display.map((i) => `${i.area}, ${i.district}, ${i.region}`)} />
              <CompareRow label="Reference" values={display.map((i) => i.ref)} />
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</td>
      {values.map((v, idx) => (
        <td key={idx} className="p-3 text-sm font-semibold text-foreground-strong">
          {v}
        </td>
      ))}
    </tr>
  );
}
