import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Page, PageHero } from "@/components/site/Page";
import { PROPERTY_TYPE_GROUPS, REGIONS } from "@/lib/site";
import { toast } from "sonner";
import { saveEnquiryLocal } from "@/lib/db";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "Advertise your property in Uganda — Amdern Properties SMC" },
      {
        name: "description",
        content:
          "List your house, land or commercial property with Amdern Properties SMC Limited and reach thousands of property seekers.",
      },
      { property: "og:title", content: "Advertise your property — Amdern Properties SMC" },
      {
        property: "og:description",
        content: "Post your property listing and reach serious buyers and renters in Uganda.",
      },
    ],
  }),
  component: ListProperty,
});

function ListProperty() {
  const [sent, setSent] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const title = String(data.get("title") || "");
    saveEnquiryLocal({
      listing: "LISTING",
      listingTitle: title || "New property listing request",
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      message: `Property listing request: ${title || "N/A"}`,
    });
    setSent(true);
    toast.success("Listing submitted", { description: "Our team will review and publish within 24 hours." });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  return (
    <Page>
      <PageHero
        eyebrow="Advertise"
        title="List your property"
        subtitle="Post your property in front of thousands of serious buyers and renters every day. Your first listing is free."
      />
      <div className="container-page py-10">
        {sent ? (
          <div className="surface-card mx-auto max-w-xl p-8 text-center">
            <h2 className="text-xl font-extrabold">Listing submitted</h2>
            <p className="mt-2 text-sm">
              Thanks — our team will review your property and publish it within 24 hours. We will
              contact you if we need more details or photos.
            </p>
            <button onClick={() => setSent(false)} className="btn-base btn-outline mt-5">
              Post another property
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="surface-card mx-auto max-w-3xl space-y-4 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Property title"
                placeholder="e.g. 3 Bedroom Bungalow in Naalya"
                required
              />
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Listing type
                </span>
                <select
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  <option value="sale">For sale</option>
                  <option value="rent">For rent</option>
                  <option value="shortlet">Shortlet</option>
                  <option value="jv">Joint venture</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Property type
                </span>
                <select
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  {PROPERTY_TYPE_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Region
                </span>
                <select
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-bold"
                >
                  {REGIONS.map((r) => (
                    <option key={r.slug} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="District" placeholder="e.g. Wakiso" required />
              <Field label="Area / neighbourhood" placeholder="e.g. Naalya" required />
              <Field label="Price (USh)" placeholder="e.g. 350000000" type="number" required />
              <Field label="Bedrooms" placeholder="e.g. 3" type="number" />
              <Field label="Bathrooms" placeholder="e.g. 2" type="number" />
              <Field label="Size (sqm)" placeholder="e.g. 240" type="number" />
              <Field label="Your name" placeholder="Full name" required />
              <Field label="Phone number" placeholder="+256 ..." required />
              <Field label="Email address" placeholder="you@example.com" type="email" required />
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Description
              </span>
              <textarea
                rows={5}
                required
                placeholder="Describe the property, its finishes, amenities and access."
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Photos
              </span>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.currentTarget.files)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {previews.map((src, i) => (
                  <div key={i} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <button className="btn-base btn-primary hover:btn-primary-hover w-full">
              Submit listing
            </button>
          </form>
        )}
      </div>
    </Page>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
      />
    </label>
  );
}
