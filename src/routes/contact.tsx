import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Page, PageHero } from "@/components/site/Page";
import { SITE, getMailtoLink, getWhatsAppLink } from "@/lib/site";
import { saveEnquiryLocal } from "@/lib/db";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact AMDERN PROPERTIES SMC LTD — Kampala, Uganda" },
      {
        name: "description",
        content:
          "Get in touch with AMDERN PROPERTIES SMC LTD by phone (+256 702 104 499 / +256 786 793 139), email (amdernsmcpropertiesltd@gmail.com) or WhatsApp.",
      },
      { property: "og:title", content: "Contact AMDERN PROPERTIES SMC LTD" },
      {
        property: "og:description",
        content: "Phone, email and office details for AMDERN PROPERTIES SMC LTD in Uganda.",
      },
      { property: "og:image", content: "https://amdernpropertiessmclimited.com/og-image.png" },
      { property: "og:url", content: "https://amdernpropertiessmclimited.com/contact" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://amdernpropertiessmclimited.com/contact" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General enquiry");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = getMailtoLink(
      `[Amdern Website Enquiry] ${subject} - from ${name}`,
      `Sender Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nEnquiry Type: ${subject}\n\nMessage:\n${message}\n\nSent from AMDERN PROPERTIES SMC LTD website.`,
    );
    saveEnquiryLocal({
      listing: "CONTACT",
      listingTitle: "General Contact Enquiry",
      name,
      email,
      phone,
      message: `[${subject}] ${message}`,
    });
    window.location.href = mailtoUrl;
    setSent(true);
    toast.success("Email client opened", { description: "Please confirm sending your enquiry in your email app." });
  };

  return (
    <Page>
      <PageHero
        eyebrow="Support & Enquiries"
        title="Contact AMDERN PROPERTIES SMC LTD"
        subtitle="Questions about a listing, property request, land due diligence, or advertising? Reach our Kampala team directly."
      />
      <div className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <div className="surface-card flex gap-4 p-5">
            <Phone className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Phone & WhatsApp
              </p>
              <div className="mt-1 space-y-1">
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="block text-sm font-extrabold text-foreground-strong hover:text-primary"
                >
                  {SITE.phone}
                </a>
                <a
                  href={`tel:${SITE.phone2.replace(/\s/g, "")}`}
                  className="block text-sm font-extrabold text-foreground-strong hover:text-primary"
                >
                  {SITE.phone2}
                </a>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={getWhatsAppLink(
                    SITE.whatsapp,
                    "Hello AMDERN PROPERTIES SMC LTD, I'm reaching out from your website.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-md"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Us
                </a>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="btn-base btn-primary hover:btn-primary-hover text-xs px-3 py-1.5 rounded-md"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Now
                </a>
              </div>
            </div>
          </div>

          <div className="surface-card flex gap-4 p-5">
            <Mail className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Direct Email
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="text-sm font-bold text-foreground-strong hover:text-primary"
              >
                {SITE.email}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">
                Messages are answered within 2 hours during business hours.
              </p>
            </div>
          </div>

          <div className="surface-card flex gap-4 p-5">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Office Location
              </p>
              <p className="text-sm font-bold text-foreground-strong">{SITE.address}</p>
            </div>
          </div>

          <div className="surface-card flex gap-4 p-5">
            <Clock className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Opening hours
              </p>
              <p className="text-sm font-bold text-foreground-strong">
                Mon – Fri, 8:00am – 6:00pm · Sat, 9:00am – 4:00pm
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          {sent ? (
            <div className="py-10 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground-strong">Message Prepared</h2>
              <p className="mx-auto max-w-md text-sm text-foreground-muted">
                Your email has been generated to <strong>{SITE.email}</strong>. If your email client
                did not launch automatically, you can also send directly via WhatsApp below.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppLink(
                    SITE.whatsapp,
                    `Hello AMDERN PROPERTIES, my name is ${name}. ${message}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-base bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <MessageSquare className="h-4 w-4" /> Message on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn-base btn-outline"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-foreground-strong">
                  Send us an email enquiry
                </h2>
                <p className="text-xs text-foreground-muted">Directly delivers to {SITE.email}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name *"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address *"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone / WhatsApp (e.g. +256 ...)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  <option>General enquiry</option>
                  <option>About a specific listing</option>
                  <option>Buy property / Land search</option>
                  <option>Rent property</option>
                  <option>List / Advertise my property</option>
                  <option>Joint venture proposal</option>
                  <option>Title verification & legal advice</option>
                </select>
              </div>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you with property in Uganda? *"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
              <button
                type="submit"
                className="btn-base btn-primary hover:btn-primary-hover w-full py-3 text-base"
              >
                <Send className="h-4 w-4" /> Send Email to {SITE.email}
              </button>
            </form>
          )}
        </div>
      </div>
    </Page>
  );
}
