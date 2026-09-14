import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import prisma from "../config/db";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_please_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const IS_PROD = process.env.NODE_ENV === "production";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const isLocalHostOrigin = (origin: string) => /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(origin);

function isSecureCookieRequest(req: Request | undefined): boolean {
  if (!req) return IS_PROD;

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  if (proto) {
    return proto.toLowerCase().startsWith("https");
  }

  const origin = process.env.CLIENT_URL || CLIENT_URL;
  return IS_PROD || !!origin.startsWith("https://") || req.secure;
}

function getCookiePolicy(req: Request | undefined) {
  const secure = isSecureCookieRequest(req);
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  } as const;
}

// Helper: send JWT in HttpOnly cookie
function setAuthCookie(req: Request, res: Response, token: string) {
  res.cookie("token", token, getCookiePolicy(req));
}

function generateToken(payload: { id: string; email: string; role: Role; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

// Zod Schemas
const roleSchema = z
  .enum(["SEEKER", "OWNER", "AGENT", "DEVELOPER", "ADMIN", "seeker", "owner", "agent", "developer", "admin"])
  .transform((value) => value.toUpperCase() as Role);

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: roleSchema.default(Role.SEEKER),
  // —— Uganda Data Protection and Privacy Act, 2019 ——
  // Article 9 requires explicit, affirmative consent before personal data
  // can be processed. The checkbox must be checked at registration.
  privacyPolicyAgreed: z.boolean().refine((v) => v === true, {
    message:
      "You must agree to the Privacy Policy before creating an account, as required by the Uganda Data Protection and Privacy Act, 2019.",
  }),
  // Article 9(3) requires a separate, opt-in consent for direct marketing.
  marketingConsent: z.boolean().default(false),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { name, email, password, phone, role, privacyPolicyAgreed, marketingConsent } =
      parse.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // —— Consent capture (Uganda DPPA 2019, Article 9) ——
    // Store the exact timestamp when consent was given so we have an auditable
    // record. marketingConsent defaults to false — only true when the user
    // explicitly opts in to promotional communications.
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role,
        isVerified: false,
        privacyPolicyAgreed: true, // Guarded by Zod — always true here
        privacyAgreedAt: new Date(),
        marketingConsent,
        marketingConsentAt: marketingConsent ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    setAuthCookie(req, res, token);

    res.status(201).json({
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("[Signup Error]:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { email, password } = parse.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    setAuthCookie(req, res, token);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        privacyPolicyAgreed: true,
        privacyAgreedAt: true,
        marketingConsent: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("[GetMe Error]:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
}

export function logout(req: Request, res: Response): void {
  const cookiePolicy = getCookiePolicy(req);

  res.clearCookie("token", {
    httpOnly: cookiePolicy.httpOnly,
    secure: cookiePolicy.secure,
    sameSite: cookiePolicy.sameSite,
    path: cookiePolicy.path,
  });
  res.json({ message: "Logged out successfully" });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const parse = forgotPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { email } = parse.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't leak user existence
    if (!user) {
      res.json({
        message: "If that email exists, a password reset link has been generated",
      });
      return;
    }

    // Generate single-use crypto token with 15-minute expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: tokenHash,
        resetTokenExpires: expiresAt,
      },
    });

    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    // In production, send email via SendGrid/SES. For development, we return link in response.
    console.log(`[Password Reset Token for ${user.email}]: ${resetLink}`);

    res.json({
      message: "If that email exists, a password reset link has been generated",
      devResetLink: !IS_PROD ? resetLink : undefined,
    });
  } catch (error) {
    console.error("[Forgot Password Error]:", error);
    res.status(500).json({ error: "Failed to process forgot password request" });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const parse = resetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { token, newPassword } = parse.data;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired password reset token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ message: "Password has been successfully updated. You may now log in." });
  } catch (error) {
    console.error("[Reset Password Error]:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

/**
 * POST /api/auth/verify-password
 *
 * Verify the current user's password. Used for sensitive operations like account deletion.
 */
const verifyPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function verifyPassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const parse = verifyPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { password } = parse.data;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    res.json({ message: "Password verified" });
  } catch (error) {
    console.error("[Verify Password Error]:", error);
    res.status(500).json({ error: "Failed to verify password" });
  }
}

export function handleGoogleOAuthCallback(req: Request, res: Response): void {
  const user = req.user as any;
  if (!user) {
    res.redirect(`${CLIENT_URL}/signin?error=oauth_failed`);
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  setAuthCookie(req, res, token);
  res.redirect(`${CLIENT_URL}/dashboard?login=google_success`);
}
