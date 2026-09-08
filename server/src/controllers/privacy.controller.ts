import { Request, Response } from "express";
import prisma from "../config/db";

/**
 * Privacy Controller — implements Data Subject Rights under the
 * Uganda Data Protection and Privacy Act, 2019 (Articles 10–12).
 *
 * Endpoints are mounted under `/api/user/privacy` and protected by
 * `authenticateToken` + `requirePrivacyConsent`.
 */

/**
 * GET /api/user/privacy/data
 *
 * Data Subject Access Request (Article 10) — Export all personal data
 * stored for the logged-in user as machine-readable JSON.
 *
 * Exported entities:
 *  - profile: auth/identity fields (excluding password hash)
 *  - property_listings: properties the user has listed
 *  - search_alerts: saved search criteria for automated alerts
 *  - inquiries: messages/inquiries sent by the user
 */
export async function exportPersonalData(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const userId = req.user.id;

    // Fetch everything the user has consented to us holding — Article 10(1).
    const [profile, properties, searchAlerts, inquiries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          // Consent records included so the user can see what they agreed to
          privacyPolicyAgreed: true,
          privacyAgreedAt: true,
          marketingConsent: true,
          marketingConsentAt: true,
        },
      }),
      prisma.property.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          currency: true,
          category: true,
          listingType: true,
          status: true,
          moderationStatus: true,
          district: true,
          area: true,
          region: true,
          createdAt: true,
          updatedAt: true,
          viewsCount: true,
        },
      }),
      prisma.searchAlert.findMany({
        where: { userId },
        select: {
          id: true,
          query: true,
          frequency: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.inquiry.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          channel: true,
          status: true,
          createdAt: true,
          property: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    if (!profile) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    res.json({
      exportedAt: new Date().toISOString(),
      // DPO contact info for transparency (Article 10(3))
      dataController: {
        name: "AMDERN PROPERTIES SMC LIMITED",
        email: "amdernsmcpropertiesltd@gmail.com",
        phone: "+256 702 104 499",
      },
      profile,
      property_listings: properties,
      search_alerts: searchAlerts,
      inquiries,
    });
  } catch (error) {
    console.error("[ExportPersonalData Error]:", error);
    res.status(500).json({ error: "Failed to export personal data" });
  }
}

/**
 * DELETE /api/user/privacy/data
 *
 * Right to Erasure / Right to be Forgotten (Article 12).
 *
 * Two modes:
 *  - "anonymize" (default): Keeps the account but blanks the user's PII
 *    (name, email, phone, password). The record remains for legal retention
 *    of financial/audit data, but is no longer attributable to an individual.
 *  - "delete": Permanently deletes the account and all associated data.
 */
export async function deletePersonalData(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const mode = (req.query.mode as string | undefined) ?? "anonymize";
    const userId = req.user.id;

    if (mode === "delete") {
      // Permanent deletion — removes the user, cascading to search alerts.
      // Properties are reassigned to platform (userId set to a sentinel) rather
      // than destroyed, preserving legitimate business records.
      await prisma.property.updateMany({
        where: { userId },
        data: {
          userId: "00000000-0000-0000-0000-000000000000" as any,
          moderationStatus: "flagged",
        },
      });

      await prisma.user.delete({ where: { id: userId } });

      // Clear the auth session so the user is logged out everywhere
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      res.json({ message: "Your account and all personal data have been permanently deleted." });
      return;
    }

    // Default: anonymize — Article 12(3) allows retention of non-identifiable data
    // for legal/compliance purposes.
    const anonymousEmail = `anonymous-${userId}@deleted.amdern.ug`;
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "Deleted User",
        email: anonymousEmail, // Replace with a non-identifiable placeholder
        phone: null,
        password: null,
        avatarUrl: null,
        // Clear consent-related fields — consent must be re-granted if they return
        privacyPolicyAgreed: false,
        privacyAgreedAt: null,
        marketingConsent: false,
        marketingConsentAt: null,
      },
    });

    // Anonymise enquiries attributed to this user
    await prisma.inquiry.updateMany({
      where: { userId },
      data: {
        name: "Deleted User",
        email: anonymousEmail,
        phone: null,
        userId: null,
        status: "closed",
      },
    });

    // Clear the auth session
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({
      message:
        "Your personal data has been anonymised. Your account remains for property listings, which have been reassigned to the platform.",
    });
  } catch (error) {
    console.error("[DeletePersonalData Error]:", error);
    res.status(500).json({ error: "Failed to process data deletion request" });
  }
}

/**
 * GET /api/user/privacy/consent
 *
 * Returns the current consent status for the logged-in user.
 * Used by the frontend cookie-consent / preferences panel.
 */
export async function getConsentStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const consent = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        privacyPolicyAgreed: true,
        privacyAgreedAt: true,
        marketingConsent: true,
        marketingConsentAt: true,
      },
    });

    if (!consent) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ consent });
  } catch (error) {
    console.error("[GetConsentStatus Error]:", error);
    res.status(500).json({ error: "Failed to fetch consent status" });
  }
}

/**
 * PATCH /api/user/privacy/consent
 *
 * Update marketing consent preference at any time (Article 9(3) — easy withdrawal).
 * The privacy policy consent is captured once at registration and cannot be
 * withdrawn without account deletion, since the policy is a condition of service.
 */
export async function updateConsent(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { marketingConsent } = req.body;

    if (typeof marketingConsent !== "boolean") {
      res.status(400).json({ error: "Invalid marketingConsent value" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        marketingConsent,
        marketingConsentAt: marketingConsent ? new Date() : null,
      },
      select: {
        marketingConsent: true,
        marketingConsentAt: true,
        privacyPolicyAgreed: true,
        privacyAgreedAt: true,
      },
    });

    res.json({ consent: updated });
  } catch (error) {
    console.error("[UpdateConsent Error]:", error);
    res.status(500).json({ error: "Failed to update consent" });
  }
}
