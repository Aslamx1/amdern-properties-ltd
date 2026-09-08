import { createServerFn } from "@tanstack/react-start";
import { LISTINGS, type Listing } from "@/lib/listings";

export const CATEGORY_MAPPING = {
  houses: ["houses"],
  flats: ["flats", "shortlets"],
  land: ["land"],
  commercial: ["commercial", "offices"],
  vehicles: ["vehicles"],
} as const;

export type Property = {
  id: string;
  ref: string;
  title: string;
  type: string;
  category: "houses" | "flats" | "land" | "commercial" | "offices" | "shortlets" | "vehicles";
  listing_type: "sale" | "rent" | "shortlet" | "jv";
  price: number;
  period: string | null;
  area: string;
  district: string;
  region: string;
  beds: number;
  baths: number;
  toilets: number;
  parking: number;
  plot_size: string | null;
  size_sqm: number | null;
  description: string;
  features: string[];
  serviced: boolean;
  furnished: boolean;
  shared: boolean;
  added_days_ago: number;
  photo_count: number;
  video_url: string | null;
  badge: string | null;
  agent_id: string | null;
  status: string;
  moderation_status: string;
  created_at: string;
  updated_at: string;
};

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  image_path: string | null;
  alt_text: string | null;
  position: number;
  uploaded_at: string;
};

function listingToProperty(l: Listing): Property {
  return {
    id: l.id,
    ref: l.ref,
    title: l.title,
    type: l.type,
    category: l.category as any,
    listing_type: l.listing as any,
    price: l.price,
    period: l.period || null,
    area: l.area,
    district: l.district,
    region: l.region,
    beds: l.beds,
    baths: l.baths,
    toilets: l.toilets,
    parking: l.parking || 0,
    plot_size: l.plotSize || null,
    size_sqm: l.sizeSqm || null,
    description: l.description,
    features: l.features,
    serviced: l.serviced,
    furnished: l.furnished,
    shared: l.shared,
    added_days_ago: l.addedDaysAgo,
    photo_count: l.images.length,
    video_url: l.video || null,
    badge: l.badge || null,
    agent_id: l.agentId || "amdern-hq",
    status: l.status || "active",
    moderation_status: l.moderationStatus || "approved",
    created_at: new Date(Date.now() - l.addedDaysAgo * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const createPropertyAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (input: Omit<Property, "id" | "created_at" | "updated_at">) => {
    const id = `PROP-${Date.now()}`;
    const newProperty: Property = {
      ...input,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newProperty;
  },
);

export const updatePropertyAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (input: {
    id: string;
    updates: Partial<Omit<Property, "id" | "created_at" | "updated_at">>;
  }) => {
    const existing = LISTINGS.find((l) => l.id === input.id);
    const property = existing ? listingToProperty(existing) : ({} as Property);
    return { ...property, ...input.updates, updated_at: new Date().toISOString() };
  },
);

export const deletePropertyAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (id: string) => {
    return { success: true, message: `Property ${id} deleted` };
  },
);

export const listPropertiesAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (input: {
    category?: string;
    listing_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    let filtered = LISTINGS.map(listingToProperty);

    if (input.category && input.category !== "all") {
      filtered = filtered.filter((p) => p.category === input.category);
    }
    if (input.listing_type && input.listing_type !== "all") {
      filtered = filtered.filter((p) => p.listing_type === input.listing_type);
    }
    if (input.status && input.status !== "all") {
      filtered = filtered.filter((p) => p.status === input.status);
    }

    const limit = input.limit || 50;
    const offset = input.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      properties: paginated,
      count: filtered.length,
      limit,
      offset,
    };
  },
);

export const uploadPropertyImageAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (input: { propertyId: string; imageUrl: string; altText?: string; position?: number }) => {
    return {
      id: `img-${Date.now()}`,
      property_id: input.propertyId,
      image_url: input.imageUrl,
      image_path: input.imageUrl,
      alt_text: input.altText || "Property image",
      position: input.position || 0,
      uploaded_at: new Date().toISOString(),
    };
  },
);

export const deletePropertyImageAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (_input: { imageId: string; imagePath: string }) => {
    return { success: true, message: "Image deleted" };
  },
);

export const reorderPropertyImagesAdminFn = createServerFn(
  {
    method: "POST",
  },
  async (_input: { propertyId: string; imageIds: string[] }) => {
    return { success: true, message: "Images reordered" };
  },
);
