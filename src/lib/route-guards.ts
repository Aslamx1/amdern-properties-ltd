import { redirect } from "@tanstack/react-router";
import { getMe } from "@/lib/api-auth";
import type { AccountType } from "@/lib/auth";

export async function requireAuth() {
  try {
    const response = await getMe();
    return {
      id: response.user.id,
      email: response.user.email,
      full_name: response.user.name,
      phone: response.user.phone,
      account_type: (response.user.role || "seeker") as AccountType,
      created_at: response.user.createdAt,
    };
  } catch {
    throw redirect({ to: "/signin" });
  }
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
      try {
        await getMe();
        throw redirect({ to: "/dashboard" });
      } catch {
        // Not authenticated, allow access
      }
    }
  };
}
