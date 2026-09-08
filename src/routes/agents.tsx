import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Building2, Loader2 } from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";
import { getAgents } from "@/lib/db";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Estate agents in Uganda — Amdern Properties SMC Limited" },
      {
        name: "description",
        content:
          "Browse estate agents listing property for sale and rent across Uganda and contact them directly.",
      },
      { property: "og:title", content: "Estate agents in Uganda — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Find and contact estate agents listing property across Uganda.",
      },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const [agents, setAgents] = useState<
    {
      id: string;
      name: string;
      kind: string;
      area: string;
      about: string | null;
      listings: number;
      phone: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getAgents();
      if (!cancelled) {
        setAgents(data.filter((a) => a.kind === "agent"));
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
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
        eyebrow="Companies"
        title="Estate agents in Uganda"
        subtitle="Browse agencies marketing property for sale, rent and lease across the country, and get in touch directly."
      />
      <div className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div key={a.id} className="surface-card p-5">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-secondary">
              <Building2 className="h-5 w-5 text-primary" />
            </span>
            <h2 className="mt-3 text-base font-extrabold">
              <Link to="/agents/$id" params={{ id: a.id }} className="hover:text-primary">
                {a.name}
              </Link>
            </h2>
            <p className="text-xs text-muted-foreground">
              {a.listings} listings · {a.area}
            </p>
            <p className="mt-2 text-sm">{a.about || ""}</p>
            <div className="mt-4 flex gap-2">
              <Link to="/agents/$id" params={{ id: a.id }} className="btn-base btn-outline flex-1">
                View profile
              </Link>
              <a
                href={`tel:${a.phone.replace(/\s/g, "")}`}
                className="btn-base btn-primary hover:btn-primary-hover"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
