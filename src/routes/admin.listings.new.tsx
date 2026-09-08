import { createFileRoute, Link } from "@tanstack/react-router";
import { LISTINGS } from "@/lib/listings";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminPhotoUpload } from "@/components/admin/AdminPhotoUpload";
import {
  Home,
  PlusCircle,
  Search,
  MapPin,
  DollarSign,
  Image,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/admin/listings/new")({
  component: AdminNewListing,
});

const STEPS = ["Basic Details", "Location & Price", "Features", "Photos", "Review & Publish"];

function AdminNewListing() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    category: "houses",
    listingType: "sale",
    price: "",
    district: "",
    region: "",
    beds: "",
    baths: "",
    toilets: "",
    size: "",
    description: "",
    features: [] as string[],
    images: [] as string[],
    status: "active",
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSave = async (asDraft = false) => {
    setSaving(true);

    // Basic validation: category must be selected
    if (!formData.category) {
      alert("Please select a Category (Houses, Flats, Land, etc.) before saving.");
      setSaving(false);
      return;
    }

    try {
      // If editing an existing listing, verify category change and confirm with user
      if (listingId) {
        const { data: existing, error: fetchErr } = await supabase.from("listings").select("category").eq("id", listingId).maybeSingle();
        if (!fetchErr && existing && existing.category && existing.category !== formData.category) {
          const ok = window.confirm(
            `You are changing the Category from '${existing.category}' to '${formData.category}'. This will move the listing to a different section. Are you sure you want to continue?`
          );
          if (!ok) {
            setSaving(false);
            return;
          }
        }
      } else {
        // If creating a new listing, warn if a seed item with the same title exists (to avoid accidental duplication/overwriting of seeded samples)
        try {
          const conflict = LISTINGS.find((l) => l.title.toLowerCase().trim() === formData.title.toLowerCase().trim());
          if (conflict) {
            const ok = window.confirm(
              `A listing with the same title already exists in the site's seeded data (category: ${conflict.category}). Creating a new listing with the same title may cause duplicates in the UI. Continue?`
            );
            if (!ok) {
              setSaving(false);
              return;
            }
          }
        } catch (e) {
          // ignore LISTINGS lookup errors
          console.warn("Seed lookup failed", e);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: agents } = await supabase.from("agents").select("id").limit(1);
      const agentId = agents?.[0]?.id || "amdern-hq";

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + "-" + Date.now();

      const listingData: any = {
        title: formData.title,
        type: formData.type,
        category: formData.category,
        listing_type: formData.listingType,
        price: Number(formData.price) || 0,
        district: formData.district || "Kampala",
        region: formData.region || "Central Region",
        beds: Number(formData.beds) || 0,
        baths: Number(formData.baths) || 0,
        toilets: Number(formData.toilets) || 0,
        size_sqm: Number(formData.size) || 0,
        description: formData.description,
        features: formData.features,
        images: formData.images,
        agent_id: agentId,
        status: asDraft ? "draft" : "active",
        moderation_status: asDraft ? "draft" : "approved",
        slug,
        ref: `AMD${Math.floor(1000 + Math.random() * 9000)}`,
      };

      let savedId: string | null = null;

      if (listingId) {
        const { error } = await supabase.from("listings").update(listingData).eq("id", listingId);
        if (error) throw error;
        savedId = listingId;
      } else {
        const { data, error } = await supabase.from("listings").insert(listingData).select("id").single();
        if (error) throw error;
        savedId = data.id;
        setListingId(data.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/listings" className="btn-base btn-outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground-strong">
          {listingId ? "Edit Listing" : "Add New Property"}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Create a new listing to reach thousands of property seekers.
        </p>
      </div>

      {saved && (
        <div className="rounded-md bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
          Listing saved successfully!
        </div>
      )}

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center size-8 rounded-full text-xs font-bold ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground-muted"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden sm:block text-xs font-medium ${
                i <= step ? "text-foreground-strong" : "text-foreground-muted"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-4 bg-border hidden sm:block" />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Basic Details</h3>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Property Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 3 Bedroom House in Wakiso"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Property Type *
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
                  <option value="houses">Houses</option>
                  <option value="flats">Flats / Apartments</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="offices">Offices</option>
                  <option value="shortlets">Shortlets</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Listing Type *
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
                  Price (UGX) *
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 50000000"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Location & Price</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                >
                  <option value="Central Region">Central Region</option>
                  <option value="Eastern Region">Eastern Region</option>
                  <option value="Western Region">Western Region</option>
                  <option value="Northern Region">Northern Region</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  District / Area
                </label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Wakiso, Kampala"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Price (UGX)
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 50000000"
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
                <Input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Bathrooms
                </label>
                <Input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                  Toilets
                </label>
                <Input
                  type="number"
                  value={formData.toilets}
                  onChange={(e) => setFormData({ ...formData, toilets: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-strong mb-1.5">
                Size (sqm)
              </label>
              <Input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
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
            <AdminPhotoUpload
              listingId={listingId || undefined}
              existingImages={formData.images}
              onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
            />
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
                <span className="font-medium text-foreground-muted">Category:</span>{" "}
                <span className="text-foreground-strong">{formData.category || "—"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Listing Type:</span>{" "}
                <span className="text-foreground-strong">{formData.listingType || "—"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Price:</span>{" "}
                <span className="text-foreground-strong">
                  {formData.price ? `UGX ${Number(formData.price).toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground-muted">Location:</span>{" "}
                <span className="text-foreground-strong">
                  {formData.district ? `${formData.district}, ${formData.region}` : "—"}
                </span>
              </div>
            </div>
            {formData.images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground-strong mb-2">
                  Photos ({formData.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {formData.images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-24 w-full rounded-lg object-cover bg-slate-100"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={prev} disabled={step === 0}>
            Previous
          </Button>
          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={step === 0 && !formData.title}>
                Next Step
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button onClick={() => handleSave(false)} disabled={saving}>
                  {saving ? "Publishing..." : "Publish Listing"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
