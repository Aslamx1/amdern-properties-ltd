/**
 * Frontend auth API client.
 *
 * Calls the real Express/Prisma backend at /api/auth/* using HttpOnly JWT
 * cookies. In local development, these requests are routed through the Vite
 * proxy to avoid cross-origin fetch failures.
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

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  privacyPolicyAgreed: boolean;
  marketingConsent: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  privacyPolicyAgreed: boolean;
  privacyAgreedAt: string | null;
  marketingConsent: boolean;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

const AUTH_TOKEN_KEY = "amdern_auth_token";

function persistAuthResponse(response: AuthResponse): AuthResponse {
  if (typeof window !== "undefined" && response.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  }
  return response;
}

export function getAuthToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(AUTH_TOKEN_KEY);
}

async function apiAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new TypeError("Authentication API is unavailable");
    }
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  try {
    return persistAuthResponse(await apiAuth<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }));
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    const { data, error: supabaseError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: { full_name: payload.name, phone: payload.phone, account_type: payload.role },
      },
    });
    if (supabaseError) throw new Error(supabaseError.message);
    if (!data.user || !data.session) {
      throw new Error("Check your email to confirm your account before signing in.");
    }
    return {
      message: "Account created successfully",
      user: {
        id: data.user.id,
        name: payload.name,
        email: data.user.email || payload.email,
        phone: payload.phone || null,
        role: payload.role || "SEEKER",
        isVerified: Boolean(data.user.email_confirmed_at),
        avatarUrl: null,
        createdAt: data.user.created_at,
        privacyPolicyAgreed: payload.privacyPolicyAgreed,
        privacyAgreedAt: new Date().toISOString(),
        marketingConsent: payload.marketingConsent,
      },
      token: data.session.access_token,
    };
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    return persistAuthResponse(await apiAuth<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }));
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
    if (supabaseError || !data.user || !data.session) {
      throw new Error(supabaseError?.message || "Unable to sign in.");
    }
    const metadata = data.user.user_metadata || {};
    return persistAuthResponse({
      message: "Login successful",
      user: {
        id: data.user.id,
        name: typeof metadata.full_name === "string" ? metadata.full_name : email.split("@")[0],
        email: data.user.email || email,
        phone: data.user.phone || null,
        role: typeof metadata.account_type === "string" ? metadata.account_type : "SEEKER",
        isVerified: Boolean(data.user.email_confirmed_at),
        avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
        createdAt: data.user.created_at,
        privacyPolicyAgreed: true,
        privacyAgreedAt: data.user.created_at,
        marketingConsent: false,
      },
      token: data.session.access_token,
    });
  }
}

export async function logout(): Promise<{ message: string }> {
  const response = await apiAuth<{ message: string }>("/api/auth/logout", { method: "POST" });
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  return response;
}

export async function getMe(): Promise<{ user: AuthUser }> {
  try {
    return await apiAuth<{ user: AuthUser }>("/api/auth/me");
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    const { data, error: supabaseError } = await supabase.auth.getUser();
    if (supabaseError || !data.user) throw new Error("Please sign in again.");
    const metadata = data.user.user_metadata || {};
    return {
      user: {
        id: data.user.id,
        name: typeof metadata.full_name === "string" ? metadata.full_name : data.user.email?.split("@")[0] || "User",
        email: data.user.email || "",
        phone: data.user.phone || null,
        role: typeof metadata.account_type === "string" ? metadata.account_type : "SEEKER",
        isVerified: Boolean(data.user.email_confirmed_at),
        avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
        createdAt: data.user.created_at,
        privacyPolicyAgreed: true,
        privacyAgreedAt: data.user.created_at,
        marketingConsent: false,
      },
    };
  }
}

export interface ConsentStatus {
  consent: {
    privacyPolicyAgreed: boolean;
    privacyAgreedAt: string | null;
    marketingConsent: boolean;
    marketingConsentAt: string | null;
  };
}

export async function getConsent(): Promise<ConsentStatus> {
  return apiAuth<ConsentStatus>("/api/user/privacy/consent");
}

export async function updateMarketingConsent(marketing: boolean): Promise<ConsentStatus> {
  return apiAuth<ConsentStatus>("/api/user/privacy/consent", {
    method: "PATCH",
    body: JSON.stringify({ marketingConsent: marketing }),
  });
}

export interface PersonalDataExport {
  exportedAt: string;
  dataController: {
    name: string;
    email: string;
    phone: string;
  };
  profile: AuthUser;
  property_listings: unknown[];
  search_alerts: unknown[];
  inquiries: unknown[];
}

export async function exportPersonalData(): Promise<PersonalDataExport> {
  return apiAuth<PersonalDataExport>("/api/user/privacy/data");
}

export async function deletePersonalData(
  mode: "anonymize" | "delete" = "anonymize",
): Promise<{ message: string }> {
  return apiAuth<{ message: string }>(`/api/user/privacy/data?mode=${mode}`, {
    method: "DELETE",
  });
}
import { supabase } from "@/integrations/supabase/client";
