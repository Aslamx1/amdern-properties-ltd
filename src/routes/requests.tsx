import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Bed, Wallet } from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Property requests in Uganda — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "See what property seekers in Uganda are looking for, with budgets, locations and requirements.",
      },
      { property: "og:title", content: "Property requests in Uganda — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Browse live property requests from buyers and renters in Uganda.",
      },
    ],
  }),
  component: RequestsPage,
});

const REQUESTS = [
  {
    id: "r1",
    want: "3 bedroom house to rent",
    area: "Ntinda, Kampala",
    budget: "USh 2.5M – 3.5M /month",
    beds: 3,
    when: "2 days ago",
  },
  {
    id: "r2",
    want: "Residential land to buy",
    area: "Kira, Wakiso",
    budget: "Up to USh 200M",
    beds: 0,
    when: "3 days ago",
  },
  {
    id: "r3",
    want: "2 bedroom furnished apartment",
    area: "Kololo, Kampala",
    budget: "USh 3M /month",
    beds: 2,
    when: "5 days ago",
  },
  {
    id: "r4",
    want: "Warehouse to lease",
    area: "Industrial Area, Kampala",
    budget: "USh 10M – 15M /month",
    beds: 0,
    when: "1 week ago",
  },
  {
    id: "r5",
    want: "4 bedroom family house to buy",
    area: "Mbarara",
    budget: "Up to USh 400M",
    beds: 4,
    when: "1 week ago",
  },
  {
    id: "r6",
    want: "Shop in busy arcade",
    area: "Kikuubo, Kampala",
    budget: "USh 2M /month",
    beds: 0,
    when: "2 weeks ago",
  },
];

function RequestsPage() {
  return (
    <Page>
      <PageHero
        eyebrow="Requests"
        title="Property requests"
        subtitle="These are live requirements from property seekers. If you have a matching property, get in touch."
      />
      <div className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">{REQUESTS.length} open requests</p>
          <Link to="/requests/new" className="btn-base btn-primary hover:btn-primary-hover">
            Post a request
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REQUESTS.map((r) => (
            <div key={r.id} className="surface-card p-5">
              <p className="text-xs text-muted-foreground">{r.when}</p>
              <h2 className="mt-1 text-base font-extrabold">{r.want}</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {r.area}
                </li>
                <li className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" /> {r.budget}
                </li>
                {r.beds > 0 && (
                  <li className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" /> {r.beds} bedrooms
                  </li>
                )}
              </ul>
              <Link to="/contact" className="btn-base btn-outline mt-4 w-full">
                I have a match
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
