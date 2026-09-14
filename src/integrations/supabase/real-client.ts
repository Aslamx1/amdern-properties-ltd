import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || import.meta.env["SUPABASE_URL"];
const supabaseAnonKey =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["SUPABASE_PUBLISHABLE_KEY"];

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    "Supabase environment variables are missing. The app will run in degraded mode until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured."
  );
}

const getApiBaseUrl = () => {
  const configured = import.meta.env["VITE_API_URL"] as string | undefined;
  if (configured && configured.trim()) return configured.replace(/\/$/, "");
  if (typeof window === "undefined") return "";
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "";
  }
  return window.location.origin;
};

const backendAuthFallback = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data?.user) {
      return null;
    }

    return {
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.createdAt || new Date().toISOString(),
          user_metadata: {
            full_name: data.user.name,
            account_type: (data.user.role || "seeker").toLowerCase(),
          },
        },
      },
      error: null,
    };
  } catch {
    return null;
  }
};

export const supabase = createClient<Database>(
  supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey || "public-anon-key",
  {
    auth: {
      persistSession: hasSupabaseConfig,
      detectSessionInUrl: hasSupabaseConfig,
      autoRefreshToken: hasSupabaseConfig,
      experimental: {
        passkey: true,
      },
    },
  },
);

const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
const originalSignOut = supabase.auth.signOut.bind(supabase.auth);

supabase.auth.getUser = async () => {
  const fallback = await backendAuthFallback();
  if (fallback) return fallback;
  return originalGetUser();
};

supabase.auth.getSession = async () => {
  const fallback = await backendAuthFallback();
  if (fallback) return fallback as any;
  return originalGetSession();
};

supabase.auth.signOut = async () => {
  try {
    await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // ignore backend logout errors and proceed with Supabase logout if configured
  }
  return originalSignOut();
};

export const isSupabaseConfigured = () => hasSupabaseConfig;

export type { Database };

export type MockUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    phone?: string;
    account_type?: string;
  };
  role?: string;
  aud?: string;
  created_at?: string;
};
