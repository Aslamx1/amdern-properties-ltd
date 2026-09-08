import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, CheckCircle2, X } from "lucide-react";
import { ALL_UPC_IMAGES } from "@/lib/verified-upc-images";

interface AdminPhotoUploadProps {
  listingId?: string;
  existingImages?: string[];
  onImagesChange?: (images: string[]) => void;
  maxFiles?: number;
}

export function AdminPhotoUpload({
  existingImages = [],
  onImagesChange,
  maxFiles = 20,
}: AdminPhotoUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [showLibrary, setShowLibrary] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const photoLibrary = useMemo(() => ALL_UPC_IMAGES.slice(0, 24), []);

  const updateImages = (nextImages: string[]) => {
    setImages(nextImages);
    onImagesChange?.(nextImages);
  };

  const handleAddFromLibrary = (url: string) => {
    if (images.includes(url)) {
      return;
    }

    if (images.length >= maxFiles) {
      setSuccess(`Maximum ${maxFiles} photos allowed`);
      return;
    }

    const newImages = [...images, url];
    updateImages(newImages);
    setSuccess("Property photo added from the site media library");
  };

  const handleDelete = (url: string) => {
    const newImages = images.filter((img) => img !== url);
    updateImages(newImages);
    setSuccess("Photo removed");
  };

  const handleSetCover = (url: string) => {
    const newImages = [url, ...images.filter((img) => img !== url)];
    updateImages(newImages);
    setSuccess("Cover photo updated");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Property Photos</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {images.length} / {maxFiles} photos selected
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowLibrary((current) => !current)}
          disabled={images.length >= maxFiles}
          className="btn-base btn-primary hover:btn-primary-hover"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {showLibrary ? "Hide library" : "Use site photos"}
        </Button>
      </div>

      {success && (
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {showLibrary && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Website photo library
            </p>
            <button
              type="button"
              onClick={() => setShowLibrary(false)}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              aria-label="Close photo library"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {photoLibrary.map((url) => {
              const selected = images.includes(url);

              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    if (selected) {
                      handleDelete(url);
                    } else {
                      handleAddFromLibrary(url);
                    }
                  }}
                  className={`relative overflow-hidden rounded-lg border-2 transition ${
                    selected ? "border-red-500 ring-2 ring-red-200" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img src={url} alt="Property" className="h-20 w-full object-cover" />
                  {selected && (
                    <span className="absolute inset-x-0 bottom-0 bg-red-600/85 px-1 py-0.5 text-[10px] font-bold text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className={`relative group rounded-lg overflow-hidden border-2 ${
              idx === 0 ? "border-red-500" : "border-slate-200"
            }`}
          >
            <img
              src={url}
              alt=""
              className="h-32 w-full object-cover bg-slate-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e2e8f0' width='200' height='150'/%3E%3C/svg%3E";
              }}
            />
            {idx === 0 && (
              <div className="absolute top-1 left-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                COVER
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => handleSetCover(url)}
                className="p-1.5 rounded bg-white/20 hover:bg-white/40 text-white"
                title="Set as cover"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(url)}
                className="p-1.5 rounded bg-red-500/80 hover:bg-red-600 text-white"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-900">No property photos selected</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Use site photos" to choose from the existing website media library
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
