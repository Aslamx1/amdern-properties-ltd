/**
 * Typed API client for the Admin Control Suite.
 *
 * During local development, requests go through the Vite proxy so the frontend
 * can talk to the Express backend without CORS failures. In production, the
 * configured VITE_API_URL is used when present.
 */

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

const API_BASE_URL = getApiBaseUrl();

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Admin auth                                                              */
/* -------------------------------------------------------------------------- */
export interface AdminProfile {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
  };
}

export async function apiAdminLogin(
  email: string,
  password: string,
): Promise<{ token: string; message: string }> {
  return apiRequest<{ token: string; message: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiAdminMe(): Promise<AdminProfile> {
  return apiRequest<AdminProfile>("/api/admin/me");
}

export async function apiAdminLogout(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" });
}

/* -------------------------------------------------------------------------- */
/* Dashboard metrics                                                       */
/* -------------------------------------------------------------------------- */
export interface AdminMetrics {
  totalProperties: number;
  pendingModeration: number;
  soldProperties: number;
  rentedProperties: number;
  verifiedAgencies: number;
  activeRequests: number;
  monthlyRevenue: number;
  totalViews: number;
  monthViews: number;
  totalEnquiries: number;
  monthEnquiries: number;
  whatsappClicks: number;
  monthWhatsappClicks: number;
  monthTotalEvents: number;
  totalUsers: number;
  revenueGrowthPct: number;
  viewsGrowthPct: number;
}

export interface ModerationItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  category: string;
  listingType: string;
  status: string;
  moderationStatus: string;
  district: string;
  area: string;
  region: string;
  image: string | null;
  submitter: string;
  submitterEmail: string | null;
  submittedAt: string;
}

export interface ModerationQueue {
  queue: ModerationItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function apiAdminMetrics(): Promise<AdminMetrics> {
  return apiRequest<AdminMetrics>("/api/admin/metrics");
}

export async function apiAdminModerationQueue(params?: {
  limit?: number;
  offset?: number;
}): Promise<ModerationQueue> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  const qs = q.toString();
  return apiRequest<ModerationQueue>(`/api/admin/moderation-queue${qs ? `?${qs}` : ""}`);
}

export async function apiAdminModerateProperty(
  id: string,
  status: "approved" | "pending" | "flagged" | "rejected",
): Promise<{ property: { id: string; title: string; moderationStatus: string } }> {
  return apiRequest(`/api/admin/properties/${id}/moderate`, {
    method: "PATCH",
    body: JSON.stringify({ moderationStatus: status }),
  });
}

/* -------------------------------------------------------------------------- */
/* Enquiries                                                              */
/* -------------------------------------------------------------------------- */
export interface EnquiryItem {
  id: string;
  propertyId: string | null;
  propertyTitle: string | null;
  propertySlug: string | null;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  channel: string;
  status: string;
  createdAt: string;
}

export interface EnquiriesResponse {
  enquiries: EnquiryItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function apiAdminEnquiries(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<EnquiriesResponse> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  if (params?.status && params.status !== "all") q.set("status", params.status);
  const qs = q.toString();
  return apiRequest<EnquiriesResponse>(`/api/admin/enquiries${qs ? `?${qs}` : ""}`);
}

export type EnquiryStatus = "new" | "contacted" | "replied" | "in_progress" | "closed";

export async function apiAdminUpdateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<{ inquiry: { id: string; status: string } }> {
  return apiRequest(`/api/admin/enquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/* -------------------------------------------------------------------------- */
/* Users                                                                     */
/* -------------------------------------------------------------------------- */
export interface UserItem {
  id: string;
  full_name: string;
  email: string;
  account_type: string;
  phone: string | null;
  created_at: string;
  isAdmin: boolean;
  isVerified: boolean;
  privacyPolicyAgreed: boolean;
  marketingConsent: boolean;
  role: string;
}

export interface UsersResponse {
  users: UserItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function apiAdminUsers(params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<UsersResponse> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  if (params?.search) q.set("search", params.search);
  const qs = q.toString();
  return apiRequest<UsersResponse>(`/api/admin/users${qs ? `?${qs}` : ""}`);
}

export async function apiAdminDeleteUser(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/admin/users/${id}`, { method: "DELETE" });
}

/* -------------------------------------------------------------------------- */
/* Admin property management (real CRUD against PostgreSQL)                  */
/* -------------------------------------------------------------------------- */

export interface AdminProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  category: string;
  listingType: string;
  status: string;
  moderationStatus: string;
  district: string;
  area: string;
  region: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parking: number;
  sizeSqm: number | null;
  viewsCount: number;
  image: string | null;
  owner: { name: string; email: string; phone: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPropertiesResponse {
  properties: AdminProperty[];
  total: number;
  limit: number;
  offset: number;
}

export async function apiAdminProperties(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  listingType?: string;
  status?: string;
}): Promise<AdminPropertiesResponse> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  if (params?.category) q.set("category", params.category);
  if (params?.listingType) q.set("listingType", params.listingType);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return apiRequest<AdminPropertiesResponse>(`/api/admin/properties${qs ? `?${qs}` : ""}`);
}

export interface AdminPropertyCreateInput {
  title: string;
  price: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  parking?: number;
  sizeSqm?: number;
  description: string;
  propertyType?: string;
  category: string;
  listingType: string;
  status?: string;
  moderationStatus?: string;
  district?: string;
  area?: string;
  region?: string;
  lat?: number;
  lng?: number;
  amenities?: string[];
  features?: string[];
  images?: Array<{
    imageUrl: string;
    webpUrl?: string;
    thumbUrl?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
}

export async function apiAdminCreateProperty(
  data: AdminPropertyCreateInput,
): Promise<{ property: AdminProperty }> {
  return apiRequest<{ property: AdminProperty }>("/api/admin/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiAdminUpdateProperty(
  id: string,
  updates: Partial<AdminPropertyCreateInput>,
): Promise<{ property: AdminProperty }> {
  return apiRequest<{ property: AdminProperty }>(`/api/admin/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function apiAdminDeleteProperty(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/admin/properties/${id}`, { method: "DELETE" });
}

/* -------------------------------------------------------------------------- */
/* Admin notifications                                                       */
/* -------------------------------------------------------------------------- */
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedListingId: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AdminNotification[];
  unreadCount: number;
}

export async function apiAdminNotifications(): Promise<NotificationsResponse> {
  return apiRequest<NotificationsResponse>("/api/admin/notifications");
}

export async function apiAdminMarkNotificationRead(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/admin/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function apiAdminMarkAllNotificationsRead(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/admin/notifications/read-all", { method: "POST" });
}
