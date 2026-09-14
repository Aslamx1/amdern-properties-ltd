import { getAuthHeaders } from "./api-auth";

function getApiBaseUrl(): string {
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "";
  }

  return window.location.origin;
}

export const API_BASE_URL = getApiBaseUrl();

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

  try {
    const res = await fetch(`${API_BASE_URL}/api/properties?${query.toString()}`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    return res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Unable to connect to property search service. Please ensure the backend is running.");
    }
    throw err;
  }
}

export async function apiGetProperty(slugOrId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/properties/${encodeURIComponent(slugOrId)}`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Get property failed: ${res.statusText}`);
    return res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Unable to load property details. Please ensure the backend is running.");
    }
    throw err;
  }
}

export async function apiUploadImages(formData: FormData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Image upload failed: ${res.statusText}`);
    return res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error("Unable to upload images. Please ensure the backend server is running.");
    }
    throw err;
  }
}

