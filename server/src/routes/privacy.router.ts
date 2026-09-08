import { Router } from "express";
import {
  exportPersonalData,
  deletePersonalData,
  getConsentStatus,
  updateConsent,
} from "../controllers/privacy.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { requirePrivacyConsent } from "../middlewares/privacyConsent.middleware";

export const privacyRouter = Router();

/**
 * Data Subject Rights API (Uganda Data Protection and Privacy Act, 2019).
 *
 * All routes require an authenticated session. The `requirePrivacyConsent`
 * guard ensures we never process personal data for a user who has not
 * given their privacy-policy consent — except for the consent-management
 * endpoints themselves (which only set/clear consent, not process PII).
 */

// —— Consent management (available even before full consent is granted) ——
privacyRouter.get("/consent", authenticateToken, getConsentStatus);
privacyRouter.patch("/consent", authenticateToken, updateConsent);

// —— Data Subject Access & Erasure (Article 10–12) ——
// GET  /api/user/privacy/data   → Export all personal data (Article 10)
// DELETE /api/user/privacy/data → Right to be forgotten (Article 12)
privacyRouter
  .route("/data")
  .get(authenticateToken, requirePrivacyConsent, exportPersonalData)
  .delete(authenticateToken, requirePrivacyConsent, deletePersonalData);

export default privacyRouter;
