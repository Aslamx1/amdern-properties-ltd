import { Link } from "@tanstack/react-router";
import { Page, PageHero } from "./Page";

export type Section = { heading: string; body: string; bullets?: string[] };

export function InfoPage({
  eyebrow,
  title,
  subtitle,
  sections,
  cta,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  sections: Section[];
  cta?: { label: string; to: string };
}) {
  return (
    <Page>
      <PageHero
        {...(eyebrow ? { eyebrow } : {})}
        title={title}
        {...(subtitle ? { subtitle } : {})}
      />
      <div className="container-page grid gap-6 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {sections.map((s) => (
            <section key={s.heading} className="surface-card p-6">
              <h2 className="text-lg font-extrabold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed">{s.body}</p>
              {s.bullets && (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="surface-card p-6">
            <h2 className="text-sm font-extrabold">Quick links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  to="/search"
                  search={{ listing: "sale" } as never}
                  className="hover:text-primary"
                >
                  Property for sale
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  search={{ listing: "rent" } as never}
                  className="hover:text-primary"
                >
                  Property for rent
                </Link>
              </li>
              <li>
                <Link to="/agents" className="hover:text-primary">
                  Estate agents
                </Link>
              </li>
              <li>
                <Link to="/developers" className="hover:text-primary">
                  Property developers
                </Link>
              </li>
              <li>
                <Link to="/list-property" className="hover:text-primary">
                  Advertise your property
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
          {cta && (
            <Link
              to={cta.to as never}
              className="btn-base btn-primary hover:btn-primary-hover w-full"
            >
              {cta.label}
            </Link>
          )}
        </aside>
      </div>
    </Page>
  );
}
