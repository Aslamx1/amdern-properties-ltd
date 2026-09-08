import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { AccountType } from "@/lib/auth";

export async function requireAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw redirect({ to: "/signin" });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || null,
    phone: profile?.phone || user.user_metadata?.phone || null,
    account_type: (profile?.account_type || user.user_metadata?.account_type || "seeker") as AccountType,
    created_at: user.created_at,
  };
}

export async function requireRole(allowedRoles: AccountType[]) {
  const profile = await requireAuth();
  if (!allowedRoles.includes(profile.account_type)) {
    throw redirect({ to: "/dashboard" });
  }
  return profile;
}

export function createProtectedRoute(options: { roles?: AccountType[]; redirectTo?: string } = {}) {
  const { roles, redirectTo = "/signin" } = options;

  return {
    beforeLoad: async () => {
      try {
        if (roles) {
          await requireRole(roles);
        } else {
          await requireAuth();
        }
      } catch (error) {
        if (error instanceof Error && "to" in error) {
          throw error;
        }
        throw redirect({ to: redirectTo });
      }
    }
  };
}

export function createPublicRoute() {
  return {
    beforeLoad: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        throw redirect({ to: "/dashboard" });
      }
    }
  };
}
