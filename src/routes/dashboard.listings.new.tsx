import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Page } from "@/components/site/Page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Upload,
  MapPin,
  Home,
  Building2,
  Landmark,
  Store,
  Loader2,
} from "lucide-react";
import { CATEGORIES, REGIONS } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/listings/new")({
  component: NewListingPage,
});

const STEPS = ["Basic Details", "Location", "Features", "Photos", "Review"];

function NewListingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    category: "houses",
    listingType: "sale",
    price: "",
    location: "",
    beds: "",
    baths: "",
    toilets: "",
    size: "",
    description: "",
    features: [] as string[],
    images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to upload photos");
        return;
      }
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${fileExt ? `.${fileExt}` : ""}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });
        if (uploadError) {
          setError(`Upload failed: ${uploadError.message}`);
          continue;
        }
        const { data } = supabase.storage.from("property-photos").getPublicUrl(filePath);
        urls.push(data.publicUrl);
      }
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submitListing = async (draft = false) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to publish");
        return;
      }

      const { data: agent } = await supabase
        .from("agents")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      let agentId = agent?.id;
      if (!agentId) {
        const { data: newAgent, error: agentError } = await supabase
          .from("agents")
          .insert({
            name: formData.title || "My Listing",
            kind: "agent",
            phone: "",
            email: user.email || "",
            profile_id: user.id,
            about: formData.description || "",
          })
          .select("id")
          .single();
        if (agentError || !newAgent) {
          setError("Failed to create agent profile. Please try again.");
          return;
        }
        agentId = newAgent.id;
      }

      const [area, district] = formData.location.split(",").map((s) => s.trim());
      const slug = `${formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}-${Date.now().toString(36)}`;

      const { data, error } = await supabase
        .from("listings")
        .insert({
          title: formData.title,
          type: formData.type || "House",
          category: formData.category,
          listing_type: formData.listingType,
          price: Number(formData.price) || 0,
          district: district || area || "Uganda",
          region: "Central Region",
          beds: Number(formData.beds) || 0,
          baths: Number(formData.baths) || 0,
          toilets: Number(formData.toilets) || 0,
          size_sqm: Number(formData.size) || 0,
          description: formData.description,
          features: formData.features,
          images: formData.images,
          agent_id: agentId,
          status: draft ? "draft" : "active",
          moderation_status: draft ? "draft" : "approved",
          slug,
          ref: `AMD-${formData.category.slice(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase()}`,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(draft ? "Draft saved successfully." : "Listing published successfully.");
      setTimeout(() => {
        window.location.href = "/dashboard/listings";
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save listing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground-strong">Add New Property</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Create a new listing to reach thousands of property seekers.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center size-8 rounded-full text-xs font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground-muted"}`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden sm:block text-xs font-medium ${i <= step ? "text-foreground-strong" : "text-foreground-muted"}`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-foreground-muted" />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Basic Details</h3>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Property Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 3 Bedroom House in Wakiso"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Property Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment / Flat</option>
                  <option value="land">Land / Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Listing Type
                </label>
                <select
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="shortlet">Shortlet</option>
                  <option value="jv">Joint Venture</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Price (UGX)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 50000000"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Location</h3>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Region
              </label>
              <select
                value={formData.location.split(",")[0] || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              >
                {REGIONS.map((r) => (
                  <option key={r.slug} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Area / District
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Wakiso, Kampala"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Property Features</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Bedrooms
                </label>
                <input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Toilets
                </label>
                <input
                  type="number"
                  value={formData.toilets}
                  onChange={(e) => setFormData({ ...formData, toilets: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Size (sqm)
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Photos</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto text-foreground-muted mb-3" />
              <p className="text-sm font-medium text-foreground-strong">
                {uploading ? "Uploading..." : "Click to upload photos"}
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                {formData.images.length} photo(s) selected · Max 10
              </p>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {formData.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    className="h-24 w-full rounded-md object-cover bg-slate-100"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Review & Publish</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Title:</span>{" "}
                <span className="text-foreground-strong">{formData.title || "—"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Type:</span>{" "}
                <span className="text-foreground-strong">{formData.type || "—"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Price:</span>{" "}
                <span className="text-foreground-strong">
                  {formData.price ? `UGX ${Number(formData.price).toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Location:</span>{" "}
                <span className="text-foreground-strong">{formData.location || "—"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Beds/Baths/Toilets:</span>{" "}
                <span className="text-foreground-strong">
                  {formData.beds || "0"} / {formData.baths || "0"} / {formData.toilets || "0"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Size:</span>{" "}
                <span className="text-foreground-strong">{formData.size || "0"} sqm</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-xs font-bold text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-md bg-emerald-50 p-3 text-xs font-bold text-emerald-600">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={prev} disabled={step === 0}>
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => submitListing(true)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as Draft"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>Next Step</Button>
            ) : (
              <Button
                className="btn-primary"
                onClick={() => submitListing(false)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Listing"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
