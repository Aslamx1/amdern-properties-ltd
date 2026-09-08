import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, PageHero } from "@/components/site/Page";
import { PROPERTY_TYPE_GROUPS, REGIONS, SITE, getMailtoLink, getWhatsAppLink } from "@/lib/site";
import { Send, CheckCircle2, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { saveEnquiryLocal } from "@/lib/db";

export const Route = createFileRoute("/requests/new")({
  head: () => ({
    meta: [
      { title: "Post a Property Request — AMDERN PROPERTIES SMC LTD" },
      {
        name: "description",
        content:
          "Tell AMDERN PROPERTIES SMC LTD what you are looking for and our team will find matching properties for you across Uganda.",
      },
      { property: "og:title", content: "Post a Property Request — AMDERN PROPERTIES SMC LTD" },
      {
        property: "og:description",
        content:
          "Describe your ideal property and budget, and get matched with verified Ugandan listings.",
      },
    ],
  }),
  component: NewRequest,
});

function NewRequest() {
  const [intent, setIntent] = useState("Buy");
  const [propType, setPropType] = useState("House");
  const [region, setRegion] = useState("Central Region");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [beds, setBeds] = useState("3");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = getMailtoLink(
      `[Property Request] ${intent} ${propType} in ${area || region} - Budget: USh ${budget}`,
      `PROPERTY REQUEST DETAILS:\n\nIntent: ${intent}\nProperty Type: ${propType}\nRegion: ${region}\nPreferred Area: ${area}\nBudget: USh ${budget}\nBedrooms: ${beds}\n\nClient Name: ${name}\nClient Contact (Phone/Email): ${contact}\n\nAdditional Requirements / Notes:\n${details}\n\nSubmitted to AMDERN PROPERTIES SMC LTD.`,
    );
    saveEnquiryLocal({
      listing: "REQUEST",
      listingTitle: `${intent} ${propType} in ${area || region}`,
      name,
      email: contact.includes("@") ? contact : `${contact}@phone`,
      phone: contact,
      message: `Budget: USh ${budget}, Beds: ${beds}. ${details}`,
    });
    window.location.href = mailto;
    setSent(true);
    toast.success("Request submitted", { description: "Our team will contact you shortly." });
  };

  return (
    <Page>
      <PageHero
        eyebrow="Custom Property Sourcing"
        title="Post a Property Request"
        subtitle="Cannot find your exact match? Tell our team at AMDERN PROPERTIES SMC LTD what you need and we will source verified properties for you."
      />
      <div className="container-page py-10">
        {sent ? (
          <div className="surface-card mx-auto max-w-xl p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground-strong">
              Property Request Received
            </h2>
            <p className="text-sm text-foreground-muted">
              Your request is addressed to <strong>{SITE.email}</strong>. Our sourcing team will
              contact you with matching properties.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href={getWhatsAppLink(
                  SITE.whatsapp,
                  `Hello AMDERN PROPERTIES SMC LTD, I posted a request for ${intent} ${propType} in ${area} (Budget: USh ${budget}). My name is ${name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageSquare className="h-4 w-4" /> Message on WhatsApp
              </a>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="btn-base btn-primary hover:btn-primary-hover"
              >
                <Phone className="h-4 w-4" /> Call Agent: {SITE.phone}
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface-card mx-auto max-w-2xl space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  I want to *
                </span>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  <option>Buy</option>
                  <option>Rent</option>
                  <option>Shortlet</option>
                  <option>Joint venture</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Property type *
                </span>
                <select
                  value={propType}
                  onChange={(e) => setPropType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  {PROPERTY_TYPE_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.types.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Region *
                </span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  {REGIONS.map((r) => (
                    <option key={r.slug}>{r.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Preferred area / neighborhood *
                </span>
                <input
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Kira, Naalya, Kololo, Mukono"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Budget (USh) *
                </span>
                <input
                  required
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 500,000,000"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Bedrooms
                </span>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Your name *
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Phone / WhatsApp or Email *
                </span>
                <input
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. +256 700 000 000"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                More details / specific preferences
              </span>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. Must have a swimming pool, ready land title, quiet neighbourhood, paved access..."
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </label>
            <button
              type="submit"
              className="btn-base btn-primary hover:btn-primary-hover w-full py-3 text-base"
            >
              <Send className="h-4 w-4" /> Submit Request to {SITE.email}
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}
