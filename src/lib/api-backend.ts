/**
 * Typed API client connecting the Amdern Properties frontend to the backend Node.js API service
 */

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    return configured.replace(/\/$/, "");
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "";
  }

  return "http://localhost:5000";
}

const API_BASE_URL = getApiBaseUrl();

export interface SearchApiParams {
  q?: string;
  category?: string;
  listingType?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function apiSearchProperties(params: SearchApiParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, String(val));
    }
  });

  const res = await fetch(`${API_BASE_URL}/api/properties?${query.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

export async function apiGetProperty(slugOrId: string) {
  const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(slugOrId)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Get property failed: ${res.statusText}`);
  return res.json();
}

export async function apiUploadImages(formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/api/upload/images`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Image upload failed: ${res.statusText}`);
  return res.json();
}
