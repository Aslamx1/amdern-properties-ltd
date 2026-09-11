/**
 * Frontend auth API client.
 *
 * Uses Supabase Auth so sign-in works from the Cloudflare-hosted frontend
 * without depending on a separately hosted Express server.
 */

import { supabase } from "@/integrations/supabase/client";

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

function toAuthUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at: string;
}): AuthUser {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    name: typeof metadata.full_name === "string" ? metadata.full_name : user.email?.split("@")[0] || "",
    email: user.email || "",
    phone: typeof metadata.phone === "string" ? metadata.phone : null,
    role: typeof metadata.role === "string" ? metadata.role : "SEEKER",
    isVerified: Boolean(user.email),
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    createdAt: user.created_at,
    privacyPolicyAgreed: true,
    privacyAgreedAt: user.created_at,
    marketingConsent: false,
  };
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.name,
        phone: payload.phone,
        account_type: payload.role || "seeker",
        privacy_policy_agreed: payload.privacyPolicyAgreed,
        marketing_consent: payload.marketingConsent,
      },
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user || !data.session) {
    throw new Error("Account created. Check your email to confirm your account before signing in.");
  }
  return {
    message: "Account created successfully",
    user: toAuthUser(data.user),
    token: data.session.access_token,
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw new Error(error.message);
  if (!data.user || !data.session) {
    throw new Error("Login did not return an active session. Please try again.");
  }
  return {
    message: "Login successful",
    user: toAuthUser(data.user),
    token: data.session.access_token,
  };
}

export async function logout(): Promise<{ message: string }> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { message: "Logged out successfully" };
}

export async function getMe(): Promise<{ user: AuthUser }> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Authentication required");
  return { user: toAuthUser(data.user) };
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
