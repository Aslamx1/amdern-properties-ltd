import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/db";
import { AdType } from "@prisma/client";

const createAdSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slot: z.string().min(2, "Slot identifier is required"),
  adType: z.nativeEnum(AdType).default(AdType.IMAGE),
  imageUrl: z.string().optional(),
  targetUrl: z.string().optional(),
  adCode: z.string().optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Returns active ad placements, optionally filtered by slot
 * e.g., GET /api/ads?slot=sidebar_rect
 */
export async function getActiveAds(req: Request, res: Response): Promise<void> {
  try {
    const { slot } = req.query;
    const now = new Date();

    const where: any = {
      isActive: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    };

    if (slot && typeof slot === "string") {
      where.slot = slot;
    }

    const ads = await prisma.adPlacement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ ads });
  } catch (error) {
    console.error("[GetActiveAds Error]:", error);
    res.status(500).json({ error: "Failed to fetch ad placements" });
  }
}

/**
 * Increments impression count when an ad is displayed
 */
export async function recordImpression(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.adPlacement.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to record impression" });
  }
}

/**
 * Increments click count when a user clicks on an ad banner
 */
export async function recordClick(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.adPlacement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to record click" });
  }
}

/**
 * Creates a new Ad Placement (Admin only)
 */
export async function createAdPlacement(req: Request, res: Response): Promise<void> {
  try {
    const parse = createAdSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const data = parse.data;

    const ad = await prisma.adPlacement.create({
      data: {
        title: data.title,
        slot: data.slot,
        adType: data.adType,
        imageUrl: data.imageUrl || null,
        targetUrl: data.targetUrl || null,
        adCode: data.adCode || null,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    res.status(201).json({ ad });
  } catch (error) {
    console.error("[CreateAdPlacement Error]:", error);
    res.status(500).json({ error: "Failed to create ad placement" });
  }
}
