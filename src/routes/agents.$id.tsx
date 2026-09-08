import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { Page } from "@/components/site/Page";
import { PropertyCard } from "@/components/site/PropertyCard";
import { agentByIdAsync } from "@/lib/listings";
import { SITE } from "@/lib/site";
import { getListings } from "@/lib/db";
import { useEffect, useState } from "react";
import type { Listing } from "@/lib/listings";

export const Route = createFileRoute("/agents/$id")({
  loader: async ({ params }) => {
    const agent = await agentByIdAsync(params.id);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Agent not found — Amdern Properties" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const a = loaderData.agent;
    return {
      meta: [
        { title: `${a.name} — property listings in ${a.area}` },
        { name: "description", content: `${a.about} View ${a.listings} listings from ${a.name}.` },
        { property: "og:title", content: `${a.name} — property listings in ${a.area}` },
        { property: "og:description", content: a.about },
      ],
    };
  },
  notFoundComponent: () => (
    <Page>
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-extrabold">Company not found</h1>
        <Link to="/agents" className="btn-base btn-primary mt-4">
          All estate agents
        </Link>
      </div>
    </Page>
  ),
  component: AgentProfile,
});

function AgentProfile() {
  const { agent } = Route.useLoaderData() as {
    agent: {
      id: string;
      name: string;
      kind: string;
      area: string;
      about: string;
      listings: number;
      email: string | null;
      phone: string;
    };
  };
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getListings({});
      if (!cancelled) {
        setSimilar(data.filter((l) => l.agentId === agent.id).slice(0, 6));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [agent.id]);

  return (
    <Page>
      <section className="border-b border-border bg-secondary">
        <div className="container-page flex flex-wrap items-center gap-6 py-10">
          <span className="grid h-20 w-20 place-items-center rounded-xl bg-primary text-3xl font-extrabold text-primary-foreground">
            {agent.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {agent.kind === "developer" ? "Property developer" : "Estate agent"}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{agent.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" /> {agent.area}, Uganda ·{" "}
              {listings.length} live listings
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="btn-base btn-outline">
                  <Mail className="mr-2 h-4 w-4" /> Email
                </a>
              )}
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="btn-base btn-outline">
                  <Phone className="mr-2 h-4 w-4" /> Call
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <h2 className="text-xl font-bold mb-4">About</h2>
        <p className="text-sm text-foreground-muted max-w-3xl">
          {agent.about || "No details provided yet."}
        </p>

        <h2 className="text-xl font-bold mt-10 mb-4">Listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-foreground-muted">No listings yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
