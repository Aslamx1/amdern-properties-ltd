import { useEffect, useState } from "react";
import { type AdPlacement, getActiveAds, recordImpression, recordClick } from "@/lib/ads";
import { ExternalLink } from "lucide-react";

interface AdSlotBannerProps {
  slot: string;
  className?: string;
  variant?: "leaderboard" | "rectangle" | "banner";
}

export function AdSlotBanner({ slot, className = "", variant = "rectangle" }: AdSlotBannerProps) {
  const [ad, setAd] = useState<AdPlacement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const ads = await getActiveAds(slot);
      if (!cancelled && ads.length > 0) {
        const selected = ads[0];
        setAd(selected);
        recordImpression(selected.id);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!ad) return null;

  const handleClick = () => {
    recordClick(ad.id);
  };

  if (ad.adType === "SCRIPT" && ad.adCode) {
    return (
      <div
        className={`ad-container my-4 overflow-hidden rounded-xl border border-border bg-white p-2 ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.adCode }}
      />
    );
  }

  const isExternal = ad.targetUrl?.startsWith("http://") || ad.targetUrl?.startsWith("https://");

  const heightClass =
    variant === "leaderboard"
      ? "h-[90px] sm:h-[120px]"
      : variant === "banner"
        ? "h-[160px] sm:h-[220px]"
        : "h-[250px]";

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <span className="absolute right-2 top-2 z-10 rounded bg-slate-900/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
        Advertisement
      </span>

      <a
        href={ad.targetUrl || "#"}
        onClick={handleClick}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block h-full w-full"
      >
        <div className={`relative w-full ${heightClass} overflow-hidden bg-slate-100`}>
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 p-4 text-center">
              <p className="text-sm font-bold text-slate-700">{ad.title}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-white border-t border-slate-100">
          <p className="line-clamp-1 text-xs font-bold text-slate-800 group-hover:text-primary">
            {ad.title}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary shrink-0 ml-2">
            Visit <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </a>
    </div>
  );
}
