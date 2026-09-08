import { supabase } from "@/integrations/supabase/client";

export type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    account_type?: string;
    [key: string]: unknown;
  } | null;
};

export async function loadProfileForUser(user: AuthUserLike | null | undefined) {
  if (!user) return null;

  const metaFullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const metaPhone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;
  const metaAccountType =
    typeof user.user_metadata?.account_type === "string" ? user.user_metadata.account_type : "seeker";

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: metaFullName || user.email?.split("@")[0] || "User",
    phone: metaPhone || null,
    account_type: metaAccountType,
  };
}

export async function ensureProfileForUser(user: AuthUserLike) {
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    "User";
  const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;
  const accountType =
    typeof user.user_metadata?.account_type === "string" ? user.user_metadata.account_type : "seeker";

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: fullName,
      phone,
      account_type: accountType,
    });

  if (error) {
    console.error("Failed to ensure profile:", error);
  }

  return {
    data: {
      id: user.id,
      full_name: fullName,
      phone,
      account_type: accountType,
    },
    error: error ? error.message : null,
  };
}
