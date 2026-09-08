import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/db";
import cache from "../config/redis";
import { generatePropertySlug } from "../utils/slug";
import { PropertyCategory, ListingType, Prisma } from "@prisma/client";

// Input validation schema for property creation
const createPropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  propertyType: z.string().default("Apartment"),
  category: z.nativeEnum(PropertyCategory).default(PropertyCategory.FLATS),
  listingType: z.nativeEnum(ListingType).default(ListingType.RENT),
  price: z.number().positive("Price must be a positive number"),
  currency: z.string().default("UGX"),
  period: z.string().optional(),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  toilets: z.number().int().min(0).default(1),
  parking: z.number().int().min(0).default(0),
  sizeSqm: z.number().optional(),
  plotSize: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
      })
    )
    .optional(),
});

/**
 * Creates a new property with an auto-generated SEO-friendly slug
 */
export async function createProperty(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const parse = createPropertySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const data = parse.data;

    // Generate dynamic slug: {bedrooms}-bedroom-{property_type}-in-{district}-{unique_hash}
    const slug = generatePropertySlug({
      bedrooms: data.bedrooms,
      propertyType: data.propertyType,
      listingType: data.listingType,
      district: data.district,
      title: data.title,
    });

    const property = await prisma.property.create({
      data: {
        userId: req.user.id,
        title: data.title,
        slug,
        price: data.price,
        currency: data.currency,
        period: data.period || null,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        toilets: data.toilets,
        parking: data.parking,
        sizeSqm: data.sizeSqm || null,
        plotSize: data.plotSize || null,
        description: data.description,
        propertyType: data.propertyType,
        category: data.category,
        listingType: data.listingType,
        district: data.district,
        area: data.area,
        region: data.region,
        lat: data.lat || null,
        lng: data.lng || null,
        amenities: JSON.stringify(data.amenities || []),
        features: JSON.stringify(data.features || []),
        images: data.images && data.images.length > 0
          ? {
              create: data.images.map((img, idx) => ({
                imageUrl: img.imageUrl,
                webpUrl: img.webpUrl || img.imageUrl,
                thumbUrl: img.thumbUrl || img.imageUrl,
                isPrimary: img.isPrimary ?? idx === 0,
                sortOrder: img.sortOrder ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
        },
      },
    });

    // Invalidate search cache
    await cache.del("properties:search:*");

    res.status(201).json({ property });
  } catch (error) {
    console.error("[CreateProperty Error]:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
}

/**
 * Searches properties with PostGIS ST_DWithin radius search, pinned isFeatured sorting, and Redis caching
 */
export async function searchProperties(req: Request, res: Response): Promise<void> {
  try {
    const {
      q,
      category,
      listingType,
      district,
      minPrice,
      maxPrice,
      bedrooms,
      lat,
      lng,
      radiusKm = 10, // Default 10km radius for spatial search
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * take;

    // Build Cache Key
    const cacheKey = `properties:search:${JSON.stringify(req.query)}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }

    // SPATIAL SEARCH: When lat & lng are specified, use PostGIS ST_DWithin raw SQL
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const radiusMeters = Number(radiusKm) * 1000;

      // Raw PostGIS query ordering by pinned `isFeatured` DESC, then distance_meters ASC
      const rawResults = await prisma.$queryRaw<Array<any>>`
        SELECT 
          p.id,
          p."userId",
          p.title,
          p.slug,
          p.price,
          p.currency,
          p.bedrooms,
          p.bathrooms,
          p.toilets,
          p.parking,
          p."sizeSqm",
          p."plotSize",
          p.description,
          p."propertyType",
          p.category::text AS category,
          p."listingType"::text AS "listingType",
          p.period,
          p.status,
          p."isVerified",
          p."isFeatured",
          p.district,
          p.area,
          p.region,
          p.lat,
          p.lng,
          p.amenities,
          p.features,
          p."viewsCount",
          p."createdAt",
          p."updatedAt",
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) AS distance_meters
        FROM "Property" p
        WHERE 
          p.status = 'active'
          AND p.lat IS NOT NULL 
          AND p.lng IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
        ORDER BY 
          p."isFeatured" DESC,
          distance_meters ASC
        LIMIT ${take}
        OFFSET ${skip};
      `;

      // Fetch images for each property
      const propertyIds = rawResults.map((p) => p.id);
      const images = await prisma.propertyImage.findMany({
        where: { propertyId: { in: propertyIds } },
        orderBy: { sortOrder: "asc" },
      });

      const propertiesWithImages = rawResults.map((p) => ({
        ...p,
        images: images.filter((img) => img.propertyId === p.id),
      }));

      const responsePayload = {
        properties: propertiesWithImages,
        page: pageNum,
        limit: take,
        total: propertiesWithImages.length,
        isSpatialSearch: true,
        center: { lat: latitude, lng: longitude, radiusKm: Number(radiusKm) },
      };

      // Cache for 300 seconds (5 minutes)
      await cache.set(cacheKey, JSON.stringify(responsePayload), "EX", 300);

      res.json(responsePayload);
      return;
    }

    // STANDARD PRISMA SEARCH with Pinned isFeatured = true
    const where: Prisma.PropertyWhereInput = {
      status: "active",
    };

    if (q) {
      const searchStr = String(q);
      where.OR = [
        { title: { contains: searchStr } },
        { description: { contains: searchStr } },
        { district: { contains: searchStr } },
        { area: { contains: searchStr } },
      ];
    }

    if (category && category !== "all") {
      where.category = String(category).toUpperCase() as PropertyCategory;
    }

    if (listingType && listingType !== "all") {
      where.listingType = String(listingType).toUpperCase() as ListingType;
    }

    if (district && district !== "all") {
      where.district = { contains: String(district) };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (bedrooms) {
      where.bedrooms = { gte: Number(bedrooms) };
    }

    // Sorting: Always prioritize isFeatured = true at top!
    const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [{ isFeatured: "desc" }];

    if (sort === "price-asc") {
      orderBy.push({ price: "asc" });
    } else if (sort === "price-desc") {
      orderBy.push({ price: "desc" });
    } else {
      orderBy.push({ createdAt: "desc" });
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          user: {
            select: { id: true, name: true, phone: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const responsePayload = {
      properties,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    };

    // Cache for 300 seconds
    await cache.set(cacheKey, JSON.stringify(responsePayload), "EX", 300);

    res.json(responsePayload);
  } catch (error) {
    console.error("[SearchProperties Error]:", error);
    res.status(500).json({ error: "Failed to execute property search" });
  }
}

/**
 * Retrieves a single property by slug or ID and increments view count
 */
export async function getPropertyBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slugOrId } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        user: {
          select: { id: true, name: true, phone: true, email: true, avatarUrl: true, role: true },
        },
      },
    });

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    // Increment view count asynchronously
    prisma.property
      .update({
        where: { id: property.id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch((e) => console.error("Error updating views count:", e));

    res.json({ property });
  } catch (error) {
    console.error("[GetPropertyBySlug Error]:", error);
    res.status(500).json({ error: "Failed to retrieve property" });
  }
}

/**
 * Updates an existing property (owner or agent/developer/admin only)
 */
export async function updateProperty(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    // Authorization check: User must own the listing
    if (existing.userId !== req.user.id) {
      res.status(403).json({ error: "You are not authorized to update this listing" });
      return;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: req.body,
      include: { images: true },
    });

    // Invalidate search cache
    await cache.del("properties:search:*");

    res.json({ property: updated });
  } catch (error) {
    console.error("[UpdateProperty Error]:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
}

/**
 * Deletes a property
 */
export async function deleteProperty(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    if (existing.userId !== req.user.id) {
      res.status(403).json({ error: "You are not authorized to delete this listing" });
      return;
    }

    await prisma.property.delete({ where: { id } });

    // Invalidate search cache
    await cache.del("properties:search:*");

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("[DeleteProperty Error]:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
}
