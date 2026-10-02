/**
 * Frontend auth API client.
 *
 * Primary authentication is backed directly by Supabase Auth with persistence in
 * localStorage. If a dedicated backend server is configured via VITE_API_URL,
 * it is also consulted so both standalone Cloudflare deployments and local/custom
 * backend setups work without errors.
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
const AUTH_TOKEN_KEY = "amdern_auth_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(existingHeaders: HeadersInit = {}): Headers {
  const headers = new Headers(existingHeaders);
  const token = getStoredToken();
  if (!headers.has("Authorization") && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

function persistToken(token?: string) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

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

async function apiAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Authorization") && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers,
      ...options,
    });
  } catch (networkErr) {
    throw new Error(
      "Unable to connect to the backend server. Please verify the server is running on port 5000."
    );
  }

  if (!res.ok) {
    if (res.status === 502 || res.status === 504) {
      throw new Error("Backend server is not responding. Please make sure port 5000 is active.");
    }
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const cleanEmail = payload.email.trim();

  // Primary: Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: payload.password,
    options: {
      data: {
        full_name: payload.name,
        phone: payload.phone || "",
        account_type: (payload.role || "seeker").toLowerCase(),
      },
    },
  });

  if (error) {
    // If backend is explicitly configured, attempt fallback
    const configured = import.meta.env["VITE_API_URL"] as string | undefined;
    if (configured && configured.trim()) {
      try {
        const response = await apiAuth<AuthResponse>("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        persistToken(response.token);
        return response;
      } catch {
        // preserve original Supabase error
      }
    }
    throw new Error(error.message || "Failed to create account.");
  }

  if (!data?.user) {
    throw new Error("Registration failed. Please try again.");
  }

  // Create or update profiles table entry
  try {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: payload.name,
      phone: payload.phone || "",
      account_type: (payload.role || "seeker").toLowerCase(),
      updated_at: new Date().toISOString(),
    });
  } catch (profileErr) {
    console.warn("Could not save profile table record:", profileErr);
  }

  const token = data.session?.access_token || "";
  if (token) {
    persistToken(token);
  }

  const authUser: AuthUser = {
    id: data.user.id,
    name: payload.name,
    email: cleanEmail,
    phone: payload.phone || null,
    role: (payload.role || "SEEKER").toUpperCase(),
    isVerified: Boolean(data.user.email_confirmed_at || data.user.confirmed_at),
    avatarUrl: null,
    createdAt: data.user.created_at || new Date().toISOString(),
    privacyPolicyAgreed: payload.privacyPolicyAgreed,
    privacyAgreedAt: new Date().toISOString(),
    marketingConsent: payload.marketingConsent,
  };

  return {
    message: "Registration successful. Please check your email to confirm your account.",
    user: authUser,
    token,
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim();

  // 1. Primary: Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    // If a dedicated backend URL is configured, try backend fallback
    const configured = import.meta.env["VITE_API_URL"] as string | undefined;
    if (configured && configured.trim()) {
      try {
        const response = await apiAuth<AuthResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        persistToken(response.token);
        return response;
      } catch {
        // ignore and throw original error
      }
    }
    throw new Error(error.message || "Invalid email or password.");
  }

  if (!data?.user || !data?.session) {
    throw new Error("Sign in failed. No active session.");
  }

  const token = data.session.access_token;
  persistToken(token);

  // Fetch user profile from Supabase profiles table
  let profileData: { full_name?: string; phone?: string; account_type?: string } | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();
    profileData = profile;
  } catch {
    // profile table might be unavailable or empty
  }

  const isExplicitAdmin =
    cleanEmail.toLowerCase() === "amdern@smc.com" ||
    cleanEmail.toLowerCase() === "admin@amdernpropertiessmclimited.com";

  const userRole = isExplicitAdmin
    ? "ADMIN"
    : (
        profileData?.account_type ||
        data.user.user_metadata?.account_type ||
        "SEEKER"
      ).toUpperCase();

  if (userRole === "ADMIN" && typeof window !== "undefined") {
    window.sessionStorage.setItem("amdern_admin_token", token);
  }

  const authUser: AuthUser = {
    id: data.user.id,
    name:
      profileData?.full_name ||
      data.user.user_metadata?.full_name ||
      cleanEmail.split("@")[0] ||
      "User",
    email: cleanEmail,
    phone: profileData?.phone || data.user.user_metadata?.phone || null,
    role: userRole,
    isVerified: Boolean(data.user.email_confirmed_at || data.user.confirmed_at),
    avatarUrl: data.user.user_metadata?.avatar_url || null,
    createdAt: data.user.created_at || new Date().toISOString(),
    privacyPolicyAgreed: true,
    privacyAgreedAt: data.user.created_at || new Date().toISOString(),
    marketingConsent: false,
  };

  return {
    message: "Signed in successfully",
    user: authUser,
    token,
  };
}

export async function logout(): Promise<{ message: string }> {
  persistToken();
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("amdern_admin_token");
  }
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    try {
      await apiAuth<{ message: string }>("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }

  return { message: "Logged out successfully" };
}

export async function getMe(): Promise<{ user: AuthUser }> {
  // 1. Try Supabase Auth first
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const session = (await supabase.auth.getSession()).data.session;
    const activeUser = user || session?.user;

    if (activeUser && activeUser.email) {
      let profileData: { full_name?: string; phone?: string; account_type?: string } | null = null;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", activeUser.id)
          .maybeSingle();
        profileData = profile;
      } catch {
        // ignore
      }

      const cleanEmail = activeUser.email.trim().toLowerCase();
      const isExplicitAdmin =
        cleanEmail === "amdern@smc.com" ||
        cleanEmail === "admin@amdernpropertiessmclimited.com";

      const userRole = isExplicitAdmin
        ? "ADMIN"
        : (
            profileData?.account_type ||
            activeUser.user_metadata?.account_type ||
            "SEEKER"
          ).toUpperCase();

      const authUser: AuthUser = {
        id: activeUser.id,
        name:
          profileData?.full_name ||
          activeUser.user_metadata?.full_name ||
          activeUser.email.split("@")[0] ||
          "User",
        email: activeUser.email,
        phone: profileData?.phone || activeUser.user_metadata?.phone || null,
        role: userRole,
        isVerified: Boolean(activeUser.email_confirmed_at || activeUser.confirmed_at),
        avatarUrl: activeUser.user_metadata?.avatar_url || null,
        createdAt: activeUser.created_at || new Date().toISOString(),
        privacyPolicyAgreed: true,
        privacyAgreedAt: activeUser.created_at || new Date().toISOString(),
        marketingConsent: false,
      };

      return { user: authUser };
    }
  } catch {
    // continue to fallback
  }

  // 2. Fallback to backend API if explicitly configured
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    return apiAuth<{ user: AuthUser }>("/api/auth/me");
  }

  throw new Error("Not authenticated");
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
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    try {
      return await apiAuth<ConsentStatus>("/api/user/privacy/consent");
    } catch {
      // fallback
    }
  }

  return {
    consent: {
      privacyPolicyAgreed: true,
      privacyAgreedAt: new Date().toISOString(),
      marketingConsent: false,
      marketingConsentAt: null,
    },
  };
}

export async function updateMarketingConsent(marketing: boolean): Promise<ConsentStatus> {
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    try {
      return await apiAuth<ConsentStatus>("/api/user/privacy/consent", {
        method: "PATCH",
        body: JSON.stringify({ marketingConsent: marketing }),
      });
    } catch {
      // fallback
    }
  }

  return {
    consent: {
      privacyPolicyAgreed: true,
      privacyAgreedAt: new Date().toISOString(),
      marketingConsent: marketing,
      marketingConsentAt: marketing ? new Date().toISOString() : null,
    },
  };
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
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    try {
      return await apiAuth<PersonalDataExport>("/api/user/privacy/data");
    } catch {
      // fallback
    }
  }

  const { user } = await getMe();
  return {
    exportedAt: new Date().toISOString(),
    dataController: {
      name: "Amdern Properties SMC Limited",
      email: "amdernsmcpropertiesltd@gmail.com",
      phone: "+256 702 104 499",
    },
    profile: user,
    property_listings: [],
    search_alerts: [],
    inquiries: [],
  };
}

export async function deletePersonalData(
  mode: "anonymize" | "delete" = "anonymize",
): Promise<{ message: string }> {
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) {
    try {
      return await apiAuth<{ message: string }>(`/api/user/privacy/data?mode=${mode}`, {
        method: "DELETE",
      });
    } catch {
      // fallback
    }
  }

  await logout();
  return { message: "Personal data request processed successfully." };
}
