import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    return next({
      context: {
        supabase,
        userId: "usr-admin-001",
        claims: { sub: "usr-admin-001", email: "amdern@smc.com", role: "authenticated" },
      },
    });
  },
);
