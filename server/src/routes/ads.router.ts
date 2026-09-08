import { Router } from "express";
import {
  getActiveAds,
  recordImpression,
  recordClick,
  createAdPlacement,
} from "../controllers/ads.controller";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

export const adsRouter = Router();

// Public ads display and tracking endpoints
adsRouter.get("/", getActiveAds);
adsRouter.post("/:id/impression", recordImpression);
adsRouter.post("/:id/click", recordClick);

// Protected ad creation endpoint (Admins, Developers, Agents)
adsRouter.post(
  "/",
  authenticateToken,
  requireRole(Role.DEVELOPER, Role.AGENT),
  createAdPlacement
);

export default adsRouter;
