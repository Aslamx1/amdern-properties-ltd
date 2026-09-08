import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdminPhotoUpload } from "@/components/admin/AdminPhotoUpload";
import { Image, FolderOpen, Tag, Upload, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/photos")({
  component: AdminPhotos,
});

interface PhotoSet {
  id: string;
  listingId: string;
  listingTitle: string;
  imageCount: number;
  coverImage: string;
  images: string[];
  category: string;
  updatedAt: string;
}

function AdminPhotos() {
  const [photoSets, setPhotoSets] = useState<PhotoSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("id, title, images, category, updated_at")
          .order("updated_at", { ascending: false });

        if (cancelled) return;
        if (error) {
          console.error("Error loading photo sets:", error);
          return;
        }

        const sets: PhotoSet[] = (
          (data || []) as Array<{
            id: string;
            title: string;
            images: string[];
            category: string;
            updated_at: string;
          }>
        )
          .filter((l) => l.images && l.images.length > 0)
          .map((l) => ({
            id: l.id,
            listingId: l.id,
            listingTitle: l.title,
            imageCount: l.images.length,
            coverImage: l.images[0],
            images: l.images,
            category: l.category,
            updatedAt: l.updated_at,
          }));

        setPhotoSets(sets);
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = photoSets.filter(
    (p) =>
      p.listingTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedListingData = selectedListing
    ? photoSets.find((p) => p.listingId === selectedListing)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Photo Asset Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload, organize, and assign property photos across all listing categories.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by listing or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Bulk Upload</p>
              <p className="text-xs text-slate-500">Drag & drop photos</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Photo Library</p>
              <p className="text-xs text-slate-500">
                {photoSets.reduce((acc, p) => acc + p.imageCount, 0)} verified photos
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Category Mapping</p>
              <p className="text-xs text-slate-500">Assign photos to routes</p>
            </div>
          </div>
        </Card>
      </div>

      {selectedListing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {selectedListingData?.listingTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedListingData?.imageCount} photos · {selectedListingData?.category}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedListing(null)}>
              Back to library
            </Button>
          </div>
          <AdminPhotoUpload
            listingId={selectedListing}
            existingImages={selectedListingData?.images ?? []}
            onImagesChange={(urls) => {
              setPhotoSets((prev) =>
                prev.map((p) =>
                  p.listingId === selectedListing
                    ? {
                        ...p,
                        images: urls,
                        imageCount: urls.length,
                        coverImage: urls[0] || p.coverImage,
                      }
                    : p,
                ),
              );
            }}
          />
        </div>
      ) : (
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading photo library...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Image className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-900">No photos in library</p>
              <p className="text-xs text-slate-500 mt-1">
                Photos will appear here when listings have images
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {filtered.map((set) => (
                <div
                  key={set.id}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedListing(set.listingId)}
                >
                  <img
                    src={set.coverImage}
                    alt={set.listingTitle}
                    className="h-40 w-full object-cover bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e2e8f0' width='200' height='150'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-semibold text-white truncate">{set.listingTitle}</p>
                    <p className="text-[10px] text-white/70">{set.imageCount} photos</p>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-white/90 text-slate-700 text-[10px]">
                    {set.category}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
