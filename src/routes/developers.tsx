import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, HardHat, Loader2 } from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";
import { getAgents } from "@/lib/db";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Property developers in Uganda — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "Discover property developers building apartment, townhouse and bungalow estates across Uganda.",
      },
      { property: "og:title", content: "Property developers in Uganda — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Browse developers and their new-build projects across Uganda.",
      },
    ],
  }),
  component: DevelopersPage,
});

function DevelopersPage() {
  const [devs, setDevs] = useState<
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
        setDevs(data.filter((a) => a.kind === "developer"));
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
        title="Property developers in Uganda"
        subtitle="Developers building new homes, apartment blocks and estates — browse their projects and enquire directly."
      />
      <div className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {devs.map((a) => (
          <div key={a.id} className="surface-card p-5">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-secondary">
              <HardHat className="h-5 w-5 text-primary" />
            </span>
            <h2 className="mt-3 text-base font-extrabold">
              <Link to="/agents/$id" params={{ id: a.id }} className="hover:text-primary">
                {a.name}
              </Link>
            </h2>
            <p className="text-xs text-muted-foreground">
              {a.listings} projects · {a.area}
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
