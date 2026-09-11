import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl =
  import.meta.env["VITE_SUPABASE_URL"] ||
  import.meta.env["SUPABASE_URL"] ||
  "https://wfctuujqszubwjpnldrs.supabase.co";
const supabaseAnonKey =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  import.meta.env["SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_S3DMhYtVUAR8KZmWtLNNpA_qqwZupAR";

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    "Supabase environment variables are missing. The app will run in degraded mode until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
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
