import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Page, PageHero } from "@/components/site/Page";
import { REGIONS } from "@/lib/site";

export const Route = createFileRoute("/area-guides")({
  head: () => ({
    meta: [
      { title: "Uganda area guides — neighbourhoods, prices and access" },
      {
        name: "description",
        content:
          "Area guides for districts across Uganda: what each neighbourhood is like, typical prices and who it suits.",
      },
      { property: "og:title", content: "Uganda area guides — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Explore districts across Uganda and the property available in each.",
      },
    ],
  }),
  component: AreaGuides,
});

const NOTES: Record<string, string> = {
  Kampala: "The commercial heart of Uganda — apartments, office space and arcade shops dominate.",
  Wakiso: "Fast growing residential belt with larger plots and new gated estates.",
  Mukono: "Industrial and residential mix along the Jinja road corridor.",
  Luweero: "Affordable land and farms within reach of the capital.",
  Mityana: "Larger acreages and mixed-use land at lower prices per acre.",
  Iganga: "Regional trading centre with steady rental demand.",
  Mayuge: "Agricultural land and small town housing.",
  Pallisa: "Affordable residential plots and family homes.",
  Soroti: "Growing town with demand for modern family houses.",
  Bugiri: "Highway frontage plots suited to commercial use.",
  Arua: "Northern commercial hub with rental demand from institutions.",
  Gulu: "Strong rental market driven by NGOs and institutions.",
  Moroto: "Emerging market with low entry prices.",
  Mbarara: "Western Uganda's largest city — bungalows and commercial plots.",
  Kabarole: "Tourism-driven demand around Fort Portal, including guest houses.",
  Hoima: "Oil-region growth with rising land values.",
  Isingiro: "Agricultural land and affordable housing.",
  Kyenjojo: "Roadside commercial plots and farmland.",
};

function AreaGuides() {
  return (
    <Page>
      <PageHero
        eyebrow="Explore"
        title="Area guides"
        subtitle="What each district is like, what it costs, and the property you will find there."
      />
      <div className="container-page space-y-10 py-10">
        {REGIONS.map((r) => (
          <section key={r.slug}>
            <h2 className="text-xl font-extrabold">{r.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {r.districts.map((d) => (
                <Link
                  key={d}
                  to="/search"
                  search={{ location: d } as never}
                  className="surface-card p-5 transition-shadow hover:shadow-pop"
                >
                  <h3 className="text-base font-extrabold">{d}</h3>
                  <p className="mt-1 text-sm">
                    {NOTES[d] ?? "Browse available property in this district."}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    View property <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
