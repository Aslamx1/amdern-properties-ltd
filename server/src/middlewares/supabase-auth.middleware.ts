import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { AuthUserPayload } from "./auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_please_change_in_production";

type SupabaseUserResponse = {
  id?: unknown;
  email?: unknown;
  user_metadata?: Record<string, unknown> | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function authenticateSupabaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const token = authorization.slice(7).trim();

    // 1. Check if token is a local backend JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      if (decoded && decoded.id) {
        req.user = {
          id: decoded.id,
          email: decoded.email || "",
          role: decoded.role || Role.SEEKER,
          name: decoded.name || "User",
        };
        next();
        return;
      }
    } catch {
      // Not a local JWT, continue to Supabase verification
    }

    // 2. Verify with Supabase Auth
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: "Supabase authentication is not configured" });
      return;
    }

    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      res.status(401).json({ error: "Invalid or expired authentication token" });
      return;
    }

    const payload = (await response.json()) as SupabaseUserResponse;
    if (typeof payload.id !== "string") {
      res.status(401).json({ error: "Invalid authentication token payload" });
      return;
    }

    const metadata = isObject(payload.user_metadata) ? payload.user_metadata : {};
    const email = typeof payload.email === "string" ? payload.email : undefined;
    const fullName = typeof metadata.full_name === "string" ? metadata.full_name : undefined;

    req.user = {
      id: payload.id,
      email: email || "",
      role: Role.SEEKER,
      name: fullName || email?.split("@")[0] || "User",
    };

    next();
  } catch (error) {
    console.error("[Supabase Auth Error]:", error);
    res.status(500).json({ error: "Unable to verify authentication" });
  }
}
