import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || import.meta.env["SUPABASE_URL"];
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["SUPABASE_PUBLISHABLE_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    experimental: {
      passkey: true,
    },
  },
});

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
