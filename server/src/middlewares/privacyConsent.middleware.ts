import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { Role } from "@prisma/client";

/**
 * Privacy consent middleware (Uganda Data Protection and Privacy Act, 2019 — Article 9).
 *
 * This guard is used on routes that process personal data. It verifies that the
 * authenticated user has an auditable record of having agreed to the Privacy
 * Policy (privacyPolicyAgreed === true && privacyAgreedAt is set). If consent
 * is missing the request is rejected with 403 so we never process data without
 * lawful consent.
 *
 * The ADMIN role is exempt — administrators need to inspect records to fulfil
 * their regulatory obligations under Article 10 (Data Subject Access Requests).
 */
export async function requirePrivacyConsent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Admins are exempt from the consent gate so they can service DSARs.
  if (req.user.role === Role.ADMIN) {
    next();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { privacyPolicyAgreed: true, privacyAgreedAt: true },
  });

  if (!user || !user.privacyPolicyAgreed || !user.privacyAgreedAt) {
    // We intentionally do NOT process the request when consent is absent.
    res.status(403).json({
      error:
        "Privacy Policy consent is required to access this resource. Please update your consent preferences.",
    });
    return;
  }

  next();
}
