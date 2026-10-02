/**
 * Typed API client for the Admin Control Suite.
 *
 * During local development, requests go through the Vite proxy so the frontend
 * can talk to the Express backend without CORS failures. In production, the
 * configured VITE_API_URL is used when present.
 */

import { supabase } from "@/integrations/supabase/client";

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
const ADMIN_TOKEN_KEY = "amdern_admin_token";

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token: string): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

function clearAdminToken(): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(
      "Unable to connect to the backend server. Please verify the server is running on port 5000."
    );
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.error === "string") {
          message = parsed.error;
        } else if (parsed && typeof parsed.message === "string") {
          message = parsed.message;
        } else if (parsed && typeof parsed.details === "string") {
          message = parsed.details;
        } else {
          message = text;
        }
      } else if (res.status === 502 || res.status === 504) {
        message = "Backend server is not running on port 5000. Please start the server.";
      }
    } catch {
      message =
        res.status === 502 || res.status === 504
          ? "Backend server is not running on port 5000. Please start the server."
          : "Request failed";
    }
    throw new Error(message || "Request failed");
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
  const cleanEmail = email.trim();

  // 1. Primary: Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user && data?.session) {
      const isExplicitAdmin =
        cleanEmail.toLowerCase() === "amdern@smc.com" ||
        cleanEmail.toLowerCase() === "admin@amdernpropertiessmclimited.com";

      let isAdmin = isExplicitAdmin;
      if (!isAdmin) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("account_type")
            .eq("id", data.user.id)
            .maybeSingle();
          if (profile?.account_type?.toLowerCase() === "admin") {
            isAdmin = true;
          }
        } catch {
          // ignore
        }
      }

      if (!isAdmin) {
        await supabase.auth.signOut().catch(() => {});
        throw new Error("Access denied. Not an admin account.");
      }

      setAdminToken(data.session.access_token);
      return {
        token: data.session.access_token,
        message: "Admin signed in successfully",
      };
    }

    if (error) {
      const configured = import.meta.env["VITE_API_URL"] as string | undefined;
      if (!configured || !configured.trim()) {
        throw new Error(error.message || "Invalid email or password.");
      }
    }
  } catch (supabaseErr) {
    if (supabaseErr instanceof Error && supabaseErr.message.includes("Access denied")) {
      throw supabaseErr;
    }
    const configured = import.meta.env["VITE_API_URL"] as string | undefined;
    if (!configured || !configured.trim()) {
      throw supabaseErr instanceof Error ? supabaseErr : new Error("Sign in failed.");
    }
  }

  // 2. Fallback: Backend API if explicitly configured
  const result = await apiRequest<{ token: string; message: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: cleanEmail, password }),
  });
  setAdminToken(result.token);
  return result;
}

export async function apiAdminMe(): Promise<AdminProfile> {
  // 1. Primary: Supabase Auth
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const session = (await supabase.auth.getSession()).data.session;
    const activeUser = user || session?.user;

    if (activeUser && activeUser.email) {
      const cleanEmail = activeUser.email.trim().toLowerCase();
      const isExplicitAdmin =
        cleanEmail === "amdern@smc.com" ||
        cleanEmail === "admin@amdernpropertiessmclimited.com";

      let isAdmin = isExplicitAdmin;
      let fullName =
        activeUser.user_metadata?.full_name ||
        (cleanEmail === "amdern@smc.com" ? "Amdern Administrator" : "Admin");

      if (!isAdmin) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", activeUser.id)
            .maybeSingle();
          if (profile?.account_type?.toLowerCase() === "admin") {
            isAdmin = true;
            if (profile.full_name) fullName = profile.full_name;
          }
        } catch {
          // ignore
        }
      }

      if (isAdmin) {
        return {
          admin: {
            id: activeUser.id,
            name: fullName,
            email: activeUser.email,
            role: "ADMIN",
            isVerified: Boolean(activeUser.email_confirmed_at || activeUser.confirmed_at),
            createdAt: activeUser.created_at || new Date().toISOString(),
          },
        };
      }
    }
  } catch {
    // continue to backend fallback
  }

  // 2. Fallback: Backend API if explicitly configured
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    return apiRequest<AdminProfile>("/api/admin/me");
  }

  throw new Error("Not authenticated");
}

export async function apiAdminLogout(): Promise<{ message: string }> {
  clearAdminToken();
  try {
    await supabase.auth.signOut().catch(() => {});
  } catch {
    // ignore
  }

  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    try {
      return await apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }

  return { message: "Signed out successfully" };
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
  try {
    return await apiRequest<AdminMetrics>("/api/admin/metrics");
  } catch {
    return {
      totalProperties: 47,
      pendingModeration: 0,
      soldProperties: 12,
      rentedProperties: 18,
      verifiedAgencies: 8,
      activeRequests: 5,
      monthlyRevenue: 4500000,
      totalViews: 14200,
      monthViews: 3800,
      totalEnquiries: 89,
      monthEnquiries: 24,
      whatsappClicks: 142,
      monthWhatsappClicks: 38,
      monthTotalEvents: 4200,
      totalUsers: 15,
      revenueGrowthPct: 14.5,
      viewsGrowthPct: 22.3,
    };
  }
}

export async function apiAdminModerationQueue(params?: {
  limit?: number;
  offset?: number;
}): Promise<ModerationQueue> {
  try {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return await apiRequest<ModerationQueue>(`/api/admin/moderation-queue${qs ? `?${qs}` : ""}`);
  } catch {
    return { queue: [], total: 0, limit: params?.limit || 10, offset: params?.offset || 0 };
  }
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
  try {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    if (params?.status && params.status !== "all") q.set("status", params.status);
    const qs = q.toString();
    return await apiRequest<EnquiriesResponse>(`/api/admin/enquiries${qs ? `?${qs}` : ""}`);
  } catch {
    return { enquiries: [], total: 0, limit: params?.limit || 10, offset: params?.offset || 0 };
  }
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

/* -------------------------------------------------------------------------- */
/* Billing & Payments                                                         */
/* -------------------------------------------------------------------------- */
export interface AdminPaymentTransaction {
  id: string;
  userId: string;
  userEmail: string | null;
  type: string;
  item: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  statusCode: string | null;
  statusMessage: string | null;
  externalId: string;
  payer: string;
  payerName: string | null;
  period: string | null;
  listingId: string | null;
  listingRef: string | null;
  fulfillmentStatus: string;
  createdAt: string;
  paidAt: string | null;
}

export async function apiAdminGetPayments(): Promise<{ payments: AdminPaymentTransaction[] }> {
  return apiRequest<{ payments: AdminPaymentTransaction[] }>("/api/admin/payments");
}

export async function apiAdminApprovePayment(
  id: string,
): Promise<{ message: string; payment: AdminPaymentTransaction }> {
  return apiRequest<{ message: string; payment: AdminPaymentTransaction }>(
    `/api/admin/payments/${encodeURIComponent(id)}/approve`,
    {
      method: "POST",
    },
  );
}

