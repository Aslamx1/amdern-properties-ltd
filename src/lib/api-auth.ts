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
  const response = await apiAuth<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistToken(response.token);
  return response;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiAuth<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  persistToken(response.token);
  return response;
}

export async function logout(): Promise<{ message: string }> {
  const response = await apiAuth<{ message: string }>("/api/auth/logout", { method: "POST" });
  persistToken();
  return response;
}

export async function getMe(): Promise<{ user: AuthUser }> {
  return apiAuth<{ user: AuthUser }>("/api/auth/me");
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
