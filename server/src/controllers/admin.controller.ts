import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/db";
import { Role } from "@prisma/client";

/**
 * Admin Controller — all endpoints read REAL data from the PostgreSQL database.
 * Every number shown on the admin dashboard originates from a Prisma query
 * against live records: no hardcoded values, no fake formulas, no demo data.
 *
 * All routes are protected by `authenticateToken` + `requireRole(Role.ADMIN)`.
 */

/* -------------------------------------------------------------------------- */
/* Dashboard metrics — GET /api/admin/metrics                                */
/* -------------------------------------------------------------------------- */
export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all count queries concurrently for a single fast round-trip.
    const [
      totalProperties,
      pendingModeration,
      soldProperties,
      rentedProperties,
      totalUsers,
      verifiedAgencies,
      totalViews,
      monthViews,
      totalEnquiries,
      monthEnquiries,
      whatsappClicks,
      monthWhatsappClicks,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { moderationStatus: "pending" } }),
      prisma.property.count({ where: { status: "sold" } }),
      prisma.property.count({ where: { status: "rented" } }),
      prisma.user.count(),
      prisma.user.count({
        where: { isVerified: true, role: { in: [Role.AGENT, Role.DEVELOPER] } },
      }),
      prisma.property.aggregate({ _sum: { viewsCount: true } }),
      prisma.analyticsEvent.count({
        where: { createdAt: { gte: startOfMonth }, eventType: "property_view" },
      }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.analyticsEvent.count({ where: { eventType: "whatsapp_click" } }),
      prisma.analyticsEvent.count({
        where: { createdAt: { gte: startOfMonth }, eventType: "whatsapp_click" },
      }),
    ]);

    // Monthly revenue: sum of property prices where a closed inquiry was created this month.
    // We join through inquiries to get only listings that actually converted.
    const revenueResult = await prisma.inquiry.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: "closed",
        property: { is: { listingType: "SALE" } },
      },
      select: {
        property: { select: { price: true } },
      },
    });
    const monthlyRevenue = revenueResult.reduce(
      (sum, inv) => sum + Number(inv.property?.price ?? 0),
      0,
    );

    // Active requests = enquiries with status "new" or "in_progress"
    const activeRequests = await prisma.inquiry.count({
      where: { status: { in: ["new", "in_progress"] } },
    });

    // Total analytics events for the month (page views + clicks)
    const monthTotalEvents = await prisma.analyticsEvent.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Previous-period comparison for MoM growth indicators
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [lastMonthRevenue, lastMonthViews] = await Promise.all([
      prisma.inquiry
        .findMany({
          where: {
            createdAt: { gte: startOfLastMonth, lt: startOfMonth },
            status: "closed",
            property: { is: { listingType: "SALE" } },
          },
          select: { property: { select: { price: true } } },
        })
        .then((rows) => rows.reduce((sum, inv) => sum + Number(inv.property?.price ?? 0), 0)),
      prisma.analyticsEvent.count({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          eventType: "property_view",
        },
      }),
    ]);

    res.json({
      totalProperties: totalProperties,
      pendingModeration: pendingModeration,
      soldProperties,
      rentedProperties,
      verifiedAgencies: verifiedAgencies,
      activeRequests,
      monthlyRevenue: monthlyRevenue,
      totalViews: totalViews._sum.viewsCount ?? 0,
      monthViews,
      totalEnquiries: totalEnquiries,
      monthEnquiries,
      whatsappClicks: whatsappClicks,
      monthWhatsappClicks,
      monthTotalEvents,
      totalUsers,
      // Growth percentages vs previous month
      revenueGrowthPct:
        lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      viewsGrowthPct:
        lastMonthViews > 0 ? ((monthViews - lastMonthViews) / lastMonthViews) * 100 : 0,
    });
  } catch (error) {
    console.error("[Admin Dashboard Metrics Error]:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
}

/* -------------------------------------------------------------------------- */
/* Moderation queue — GET /api/admin/moderation-queue                        */
/* -------------------------------------------------------------------------- */
export async function getModerationQueue(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const offset = Number(req.query.offset) || 0;

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where: { moderationStatus: "pending" },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
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
          user: {
            select: { id: true, name: true, email: true, phone: true, role: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { imageUrl: true, isPrimary: true },
          },
        },
      }),
      prisma.property.count({ where: { moderationStatus: "pending" } }),
    ]);

    res.json({
      queue: items.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        currency: p.currency,
        category: p.category,
        listingType: p.listingType,
        status: p.status,
        moderationStatus: p.moderationStatus,
        district: p.district,
        area: p.area,
        region: p.region,
        image: p.images[0]?.imageUrl ?? null,
        submitter: p.user?.name ?? p.user?.email ?? "Unknown",
        submitterEmail: p.user?.email ?? null,
        submittedAt: p.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[ModerationQueue Error]:", error);
    res.status(500).json({ error: "Failed to fetch moderation queue" });
  }
}

/* -------------------------------------------------------------------------- */
/* Moderation action — PATCH /api/admin/properties/:id/moderate              */
/* -------------------------------------------------------------------------- */
const moderatePropertySchema = z.object({
  moderationStatus: z.enum(["approved", "pending", "flagged", "rejected"]),
});

export async function moderateProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parse = moderatePropertySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { moderationStatus: parse.data.moderationStatus },
      select: { id: true, title: true, moderationStatus: true },
    });

    res.json({ property: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    console.error("[ModerateProperty Error]:", error);
    res.status(500).json({ error: "Failed to update moderation status" });
  }
}

/* -------------------------------------------------------------------------- */
/* Enquiries — GET /api/admin/enquiries                                      */
/* -------------------------------------------------------------------------- */
export async function getEnquiries(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = Number(req.query.offset) || 0;
    const statusFilter = req.query.status as string | undefined;

    const where: any = {};
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter;
    }

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          property: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    res.json({
      enquiries: items.map((i) => ({
        id: i.id,
        propertyId: i.propertyId,
        propertyTitle: i.property?.title ?? null,
        propertySlug: i.property?.slug ?? null,
        userId: i.userId,
        name: i.name,
        email: i.email,
        phone: i.phone,
        message: i.message,
        channel: i.channel,
        status: i.status,
        createdAt: i.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[GetEnquiries Error]:", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
}

/* -------------------------------------------------------------------------- */
/* Enquiry status update — PATCH /api/admin/enquiries/:id/status             */
/* -------------------------------------------------------------------------- */
const updateEnquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "replied", "in_progress", "closed"]),
});

export async function updateEnquiryStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parse = updateEnquiryStatusSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status: parse.data.status },
      select: { id: true, status: true },
    });

    res.json({ inquiry: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    console.error("[UpdateEnquiryStatus Error]:", error);
    res.status(500).json({ error: "Failed to update enquiry status" });
  }
}

/* -------------------------------------------------------------------------- */
/* Users — GET /api/admin/users                                              */
/* -------------------------------------------------------------------------- */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = Number(req.query.offset) || 0;
    const search = (req.query.search as string | undefined) ?? "";

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: searchFilter,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          privacyPolicyAgreed: true,
          marketingConsent: true,
        },
      }),
      prisma.user.count({ where: searchFilter }),
    ]);

    // Map Prisma Role to the admin UI expectations (isAdmin, account_type)
    const isAdmin = (role: Role) => role === Role.ADMIN;
    const accountType = (role: Role): string =>
      role === Role.OWNER
        ? "owner"
        : role === Role.AGENT
          ? "agent"
          : role === Role.DEVELOPER
            ? "developer"
            : role === Role.ADMIN
              ? "admin"
              : "seeker";

    res.json({
      users: items.map((u) => ({
        id: u.id,
        full_name: u.name,
        email: u.email,
        account_type: accountType(u.role),
        phone: u.phone,
        created_at: u.createdAt.toISOString(),
        isAdmin: isAdmin(u.role),
        isVerified: u.isVerified,
        privacyPolicyAgreed: u.privacyPolicyAgreed,
        marketingConsent: u.marketingConsent,
        role: u.role,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[GetUsers Error]:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

/* -------------------------------------------------------------------------- */
/* User deletion — DELETE /api/admin/users/:id                              */
/* -------------------------------------------------------------------------- */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Prevent admins from deleting their own account
    if (id === req.user!.id) {
      res.status(400).json({ error: "You cannot delete your own admin account" });
      return;
    }

    // Reassign owned properties to the platform sentinel before deletion
    await prisma.property.updateMany({
      where: { userId: id },
      data: { userId: "00000000-0000-0000-0000-000000000000" as any },
    });

    await prisma.inquiry.updateMany({
      where: { userId: id },
      data: { userId: null, status: "closed" },
    });

    await prisma.searchAlert.deleteMany({ where: { userId: id } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "User not found" });
      return;
    }
    console.error("[DeleteUser Error]:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin notifications — GET /api/admin/notifications                        */
/* -------------------------------------------------------------------------- */
export async function getAdminNotifications(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const unreadOnly = req.query.unread === "true";

    const where: any = { userId: req.user!.id };
    if (unreadOnly) where.read = false;

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user!.id, read: false } }),
    ]);

    res.json({
      notifications: items.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        relatedListingId: n.relatedListingId,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("[GetAdminNotifications Error]:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

/* -------------------------------------------------------------------------- */
/* Mark notification as read — PATCH /api/admin/notifications/:id/read      */
/* -------------------------------------------------------------------------- */
export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id, userId: req.user!.id },
      data: { read: true },
    });
    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update notification" });
  }
}

/* -------------------------------------------------------------------------- */
/* Mark all notifications as read — POST /api/admin/notifications/read-all   */
/* -------------------------------------------------------------------------- */
export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
}

/* -------------------------------------------------------------------------- */
/* Admin profile — GET /api/admin/me                                         */
/* -------------------------------------------------------------------------- */
export async function getAdminProfile(req: Request, res: Response): Promise<void> {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!admin) {
      res.status(404).json({ error: "Admin profile not found" });
      return;
    }

    res.json({ admin });
  } catch (error) {
    console.error("[GetAdminProfile Error]:", error);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
}

/* -------------------------------------------------------------------------- */
/* Property listing for admin — GET /api/admin/properties                   */
/* -------------------------------------------------------------------------- */
export async function listAdminProperties(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = Number(req.query.offset) || 0;
    const category = req.query.category as string | undefined;
    const listingType = req.query.listingType as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (category && category !== "all") where.category = category.toUpperCase();
    if (listingType && listingType !== "all") where.listingType = listingType.toUpperCase();
    if (status && status !== "all") where.status = status;

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
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
          bedrooms: true,
          bathrooms: true,
          toilets: true,
          parking: true,
          sizeSqm: true,
          plotSize: true,
          description: true,
          propertyType: true,
          period: true,
          amenities: true,
          features: true,
          viewsCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { imageUrl: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties: items.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        currency: p.currency,
        category: p.category,
        listingType: p.listingType,
        status: p.status,
        moderationStatus: p.moderationStatus,
        district: p.district,
        area: p.area,
        region: p.region,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        toilets: p.toilets,
        parking: p.parking,
        sizeSqm: p.sizeSqm,
        plotSize: p.plotSize,
        description: p.description,
        propertyType: p.propertyType,
        period: p.period,
        amenities: p.amenities,
        features: p.features,
        viewsCount: p.viewsCount,
        image: p.images[0]?.imageUrl ?? null,
        owner: p.user ? { name: p.user.name, email: p.user.email, phone: p.user.phone } : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[ListAdminProperties Error]:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
}

/* -------------------------------------------------------------------------- */
/* Property CRUD for admin — POST /api/admin/properties                      */
/* -------------------------------------------------------------------------- */
const createPropertyAdminSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default("UGX"),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  toilets: z.number().int().min(0).default(1),
  parking: z.number().int().min(0).default(0),
  sizeSqm: z.number().optional(),
  description: z.string().min(10),
  propertyType: z.string().default("Apartment"),
  category: z.string(),
  listingType: z.string(),
  status: z.string().default("active"),
  moderationStatus: z.string().default("approved"),
  district: z.string().default("Kampala"),
  area: z.string().default("Central"),
  region: z.string().default("Central"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        imageUrl: z.string(),
        webpUrl: z.string().optional(),
        thumbUrl: z.string().optional(),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().default(0),
      }),
    )
    .optional(),
});

export async function createAdminProperty(req: Request, res: Response): Promise<void> {
  try {
    const parse = createPropertyAdminSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const data = parse.data;
    const slug =
      data.slug || `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    const property = await prisma.property.create({
      data: {
        userId: req.user!.id,
        title: data.title,
        slug,
        price: data.price,
        currency: data.currency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        toilets: data.toilets,
        parking: data.parking,
        sizeSqm: data.sizeSqm || null,
        plotSize: null,
        description: data.description,
        propertyType: data.propertyType,
        category: data.category.toUpperCase() as any,
        listingType: data.listingType.toUpperCase() as any,
        status: data.status,
        moderationStatus: data.moderationStatus,
        district: data.district,
        area: data.area,
        region: data.region,
        lat: data.lat || null,
        lng: data.lng || null,
        amenities: data.amenities,
        features: data.features,
        images:
          data.images && data.images.length > 0
            ? {
                create: data.images.map((img, idx) => ({
                  ...img,
                  isPrimary: img.isPrimary ?? idx === 0,
                  sortOrder: img.sortOrder ?? idx,
                })),
              }
            : undefined,
      },
      include: { images: true },
    });

    res.status(201).json({ property });
  } catch (error) {
    console.error("[CreateAdminProperty Error]:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
}

/* -------------------------------------------------------------------------- */
/* Property update for admin — PATCH /api/admin/properties/:id               */
/* -------------------------------------------------------------------------- */
export async function updateAdminProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    const body = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(body, "images")) {
      const rawImages = Array.isArray(body.images) ? body.images : [];
      const normalizedImages = rawImages
        .map((image: any, index: number) => {
          const imageUrl = typeof image === "string" ? image : image?.imageUrl || image?.url || image?.src;
          if (!imageUrl) return null;
          return {
            imageUrl,
            webpUrl: typeof image === "string" ? image : image?.webpUrl || imageUrl,
            thumbUrl: typeof image === "string" ? image : image?.thumbUrl || imageUrl,
            isPrimary: Boolean(typeof image === "string" ? index === 0 : image?.isPrimary ?? index === 0),
            sortOrder: index,
          };
        })
        .filter(Boolean);

      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });

      if (normalizedImages.length > 0) {
        await prisma.propertyImage.createMany({
          data: normalizedImages.map((image) => ({
            propertyId: id,
            imageUrl: image.imageUrl,
            webpUrl: image.webpUrl,
            thumbUrl: image.thumbUrl,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
          })),
        });
      }

      delete body.images;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        category: body.category ? body.category.toUpperCase() : undefined,
        listingType: body.listingType ? body.listingType.toUpperCase() : undefined,
      },
      include: { images: true },
    });

    res.json({ property: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    console.error("[UpdateAdminProperty Error]:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
}

/* -------------------------------------------------------------------------- */
/* Property delete for admin — DELETE /api/admin/properties/:id             */
/* -------------------------------------------------------------------------- */
export async function deleteAdminProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id } });
    res.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    console.error("[DeleteAdminProperty Error]:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
}
