import { useEffect } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { type AdPlacement, recordImpression, recordClick } from "@/lib/ads";

export function InFeedAdCard({ ad }: { ad: AdPlacement }) {
  useEffect(() => {
    recordImpression(ad.id);
  }, [ad.id]);

  const handleClick = () => {
    recordClick(ad.id);
  };

  const targetUrl = ad.targetUrl || "#";
  const isExternal = targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-white transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
            <span className="text-xs font-bold text-amber-900">Featured Partner</span>
          </div>
        )}

        {/* Sponsored Badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
          <Sparkles className="h-3 w-3" />
          Sponsored
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
            Partner Recommendation
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold text-foreground-strong group-hover:text-primary">
            {ad.title}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Amdern Verified Partner</span>
          <a
            href={targetUrl}
            onClick={handleClick}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary transition-colors"
          >
            <span>Learn More</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
