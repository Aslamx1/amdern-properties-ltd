import { supabase } from "@/integrations/supabase/client";

export type AccountType = "seeker" | "owner" | "agent" | "developer";

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: user.email,
    full_name: data.full_name,
    phone: data.phone,
    account_type: (data.account_type as AccountType) || "seeker",
  };
}

export async function updateProfile(updates: {
  full_name?: string;
  phone?: string;
  account_type?: AccountType;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...updates })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signInWithPasskey() {
  try {
    const { data, error } = await supabase.auth.signInWithPasskey();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Passkey sign-in error:", error);
    throw error;
  }
}

export async function registerPasskey() {
  throw new Error("Passkey registration should be initiated from the account settings after signing in.");
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

export function hasRole(profile: { account_type: string } | null, allowedRoles: AccountType[]): boolean {
  if (!profile) return false;
  return allowedRoles.includes(profile.account_type as AccountType);
}
