import { Router } from "express";
import {
  getDashboardMetrics,
  getModerationQueue,
  moderateProperty,
  getEnquiries,
  updateEnquiryStatus,
  getUsers,
  deleteUser,
  getAdminProfile,
  listAdminProperties,
  createAdminProperty,
  updateAdminProperty,
  deleteAdminProperty,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/admin.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

export const adminRouter = Router();

/**
 * Admin API — all endpoints require an authenticated ADMIN-role JWT.
 * The JWT is issued by /api/auth/login (HttpOnly cookie) or the admin
 * login route at /api/admin/auth/login.
 */
adminRouter.use(authenticateToken, requireRole(Role.ADMIN));

// Admin profile
adminRouter.get("/me", getAdminProfile);

// Notifications
adminRouter.get("/notifications", getAdminNotifications);
adminRouter.patch("/notifications/:id/read", markNotificationRead);
adminRouter.post("/notifications/read-all", markAllNotificationsRead);

// Dashboard metrics (real DB queries)
adminRouter.get("/metrics", getDashboardMetrics);

// Moderation queue
adminRouter.get("/moderation-queue", getModerationQueue);
adminRouter.patch("/properties/:id/moderate", moderateProperty);

// Property management (real CRUD against PostgreSQL)
adminRouter.get("/properties", listAdminProperties);
adminRouter.post("/properties", createAdminProperty);
adminRouter.patch("/properties/:id", updateAdminProperty);
adminRouter.delete("/properties/:id", deleteAdminProperty);

// Enquiries
adminRouter.get("/enquiries", getEnquiries);
adminRouter.patch("/enquiries/:id/status", updateEnquiryStatus);

// User management
adminRouter.get("/users", getUsers);
adminRouter.delete("/users/:id", deleteUser);

export default adminRouter;
