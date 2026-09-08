/**
 * Ads & Monetization Engine for Amdern Properties SMC Limited
 * Supports dynamic slot querying, impression/click tracking,
 * and in-feed sponsored ad injection after every 5th result.
 */

export type AdType = "IMAGE" | "SCRIPT";

export interface AdPlacement {
  id: string;
  title: string;
  slot: string;
  adType: AdType;
  imageUrl?: string | null;
  targetUrl?: string | null;
  adCode?: string | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  impressions?: number;
  clicks?: number;
}

export type FeedItem<T, A = AdPlacement> =
  | { type: "property"; data: T }
  | { type: "ad"; data: A };

// Fallback curated ads for Amdern Properties when backend API is offline
export const FALLBACK_ADS: AdPlacement[] = [
  {
    id: "ad-fallback-1",
    title: "Centenary Bank Home Loans — Fast Approvals & Flexible Rates",
    slot: "search_feed",
    adType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80",
    targetUrl: "https://centenarybank.co.ug",
    isActive: true,
  },
  {
    id: "ad-fallback-2",
    title: "Stanbic Bank Uganda — Diaspora Mortgage Financing",
    slot: "search_feed",
    adType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80",
    targetUrl: "https://stanbicbank.co.ug",
    isActive: true,
  },
  {
    id: "ad-fallback-3",
    title: "Amdern Verified Photo Shoot & Valuation Services",
    slot: "sidebar_rect",
    adType: "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80",
    targetUrl: "/advertise/verified-photos",
    isActive: true,
  },
];

const API_BASE_URL = typeof window !== "undefined"
  ? (import.meta.env["VITE_API_URL"] || "http://localhost:5000")
  : "http://localhost:5000";

/**
 * Fetches active ads by slot from the backend API, falling back to local ads
 */
export async function getActiveAds(slot?: string): Promise<AdPlacement[]> {
  try {
    const url = slot
      ? `${API_BASE_URL}/api/ads?slot=${encodeURIComponent(slot)}`
      : `${API_BASE_URL}/api/ads`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.ads && Array.isArray(data.ads) && data.ads.length > 0) {
      return data.ads;
    }
  } catch {
    // Graceful fallback to static ads
  }

  // Filter fallback ads
  if (!slot) return FALLBACK_ADS;
  return FALLBACK_ADS.filter((a) => a.slot === slot || a.slot === "search_feed");
}

/**
 * Increments ad impression counter
 */
export async function recordImpression(adId: string): Promise<void> {
  if (adId.startsWith("ad-fallback-")) return;
  try {
    await fetch(`${API_BASE_URL}/api/ads/${adId}/impression`, { method: "POST" });
  } catch {
    // Ignore tracking failures
  }
}

/**
 * Increments ad click counter
 */
export async function recordClick(adId: string): Promise<void> {
  if (adId.startsWith("ad-fallback-")) return;
  try {
    await fetch(`${API_BASE_URL}/api/ads/${adId}/click`, { method: "POST" });
  } catch {
    // Ignore tracking failures
  }
}

/**
 * In-feed ad injection helper: returns an ad item after every 5th property result
 */
export function injectInFeedAds<T>(
  properties: T[],
  ads: AdPlacement[],
  interval: number = 5
): FeedItem<T, AdPlacement>[] {
  if (!properties || properties.length === 0) return [];
  if (!ads || ads.length === 0) {
    return properties.map((data) => ({ type: "property", data }));
  }

  const result: FeedItem<T, AdPlacement>[] = [];
  let adCursor = 0;

  for (let i = 0; i < properties.length; i++) {
    result.push({ type: "property", data: properties[i] });

    // After every interval (e.g. 5th, 10th, 15th...), insert an ad
    if ((i + 1) % interval === 0) {
      const ad = ads[adCursor % ads.length];
      result.push({ type: "ad", data: ad });
      adCursor++;
    }
  }

  return result;
}
