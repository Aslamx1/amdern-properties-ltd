import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// CATEGORY MAPPING: Single source of truth for category isolation
// Maps user-facing category names to database category values
// ============================================================================
export const CATEGORY_MAPPING = {
  houses: ["houses"],
  flats: ["flats", "shortlets"],
  land: ["land"],
  commercial: ["commercial", "offices"],
  vehicles: ["vehicles"],
} as const;

export type CategoryKey = keyof typeof CATEGORY_MAPPING;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
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
  property_images?: PropertyImage[];
};

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  image_path: string | null;
  alt_text: string | null;
  position: number;
  uploaded_at: string;
  uploaded_by: string | null;
};

// ============================================================================
// QUERY FUNCTION: Get properties by category with strict isolation
// ============================================================================
export async function getPropertiesByCategory(
  categoryKey: CategoryKey,
  listingType: "sale" | "rent" | "shortlet" | "jv",
  options: { limit?: number; offset?: number } = {}
): Promise<Property[]> {
  const categories = CATEGORY_MAPPING[categoryKey];

  if (!categories) {
    throw new Error(`Invalid category: ${categoryKey}`);
  }

  let query = supabase
    .from("properties")
    .select("*, property_images(id, image_url, image_path, alt_text, position)")
    .in("category", categories as string[])
    .eq("listing_type", listingType)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Query failed for ${categoryKey}:`, error);
    throw new Error(`Query failed for ${categoryKey}: ${error.message}`);
  }

  return (data || []) as Property[];
}

// ============================================================================
// QUERY FUNCTION: Get single property by ID with images
// ============================================================================
export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(id, image_url, image_path, alt_text, position)")
    .eq("id", id)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .single();

  if (error) {
    console.error("Failed to fetch property:", error);
    return null;
  }

  return (data as Property) || null;
}

// ============================================================================
// QUERY FUNCTION: Search within a category (strict isolation)
// ============================================================================
export async function searchPropertiesByCategory(
  categoryKey: CategoryKey,
  query: string,
  listingType?: "sale" | "rent" | "shortlet" | "jv"
): Promise<Property[]> {
  const categories = CATEGORY_MAPPING[categoryKey];

  if (!categories) {
    throw new Error(`Invalid category: ${categoryKey}`);
  }

  let dbQuery = supabase
    .from("properties")
    .select("*, property_images(id, image_url, image_path, alt_text, position)")
    .in("category", categories as string[])
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,area.ilike.%${query}%,district.ilike.%${query}%`
    );

  if (listingType) {
    dbQuery = dbQuery.eq("listing_type", listingType);
  }

  const { data, error } = await dbQuery.limit(20);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data || []) as Property[];
}

// ============================================================================
// MUTATION FUNCTION: Create a new property (admin only)
// ============================================================================
export async function createProperty(
  input: Omit<Property, "id" | "created_at" | "updated_at" | "property_images">
): Promise<Property> {
  const { data, error } = await supabase
    .from("properties")
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error("Failed to create property:", error);
    throw new Error(`Failed to create property: ${error.message}`);
  }

  return data as Property;
}

// ============================================================================
// MUTATION FUNCTION: Update property (admin only, with category protection)
// ============================================================================
export async function updateProperty(
  id: string,
  updates: Partial<Omit<Property, "id" | "created_at" | "updated_at">>
): Promise<Property> {
  // Fetch existing property to check if category is changing
  const existing = await supabase.from("properties").select("category").eq("id", id).single();

  if (existing.error) {
    throw new Error(`Property not found: ${id}`);
  }

  // If category is changing, we need explicit confirmation (enforced at UI level)
  if (updates.category && updates.category !== existing.data.category) {
    console.warn(`Category change detected for ${id}: ${existing.data.category} -> ${updates.category}`);
  }

  const { data, error } = await supabase
    .from("properties")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update property:", error);
    throw new Error(`Failed to update property: ${error.message}`);
  }

  return data as Property;
}

// ============================================================================
// MUTATION FUNCTION: Delete property (admin only)
// ============================================================================
export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete property:", error);
    throw new Error(`Failed to delete property: ${error.message}`);
  }
}

// ============================================================================
// IMAGE FUNCTIONS: Strict image-to-property binding
// ============================================================================

/**
 * Upload an image and bind it to a property_id
 * Returns the image record with public URL
 */
export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  altText?: string
): Promise<PropertyImage> {
  try {
    // 1. Verify the property exists
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .single();

    if (propError || !property) {
      throw new Error(`Property not found: ${propertyId}`);
    }

    // 2. Upload image to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${propertyId}/${timestamp}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("property-images")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    // 3. Get public URL
    const { data: publicUrl } = supabase.storage.from("property-images").getPublicUrl(fileName);

    // 4. Create image record strictly bound to property_id
    const { data: imageRecord, error: imageError } = await supabase
      .from("property_images")
      .insert([
        {
          property_id: propertyId,
          image_url: publicUrl.publicUrl,
          image_path: fileName,
          alt_text: altText || "Property image",
          position: 0,
        },
      ])
      .select()
      .single();

    if (imageError) {
      throw new Error(`Image record creation failed: ${imageError.message}`);
    }

    return imageRecord as PropertyImage;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
}

/**
 * Get all images for a specific property
 * Ensures no image leakage between properties
 */
export async function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  const { data: images, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Failed to fetch images:", error);
    return [];
  }

  return (images || []) as PropertyImage[];
}

/**
 * Delete an image
 */
export async function deletePropertyImage(imageId: string, imagePath: string): Promise<void> {
  // 1. Delete from storage
  const { error: storageError } = await supabase.storage.from("property-images").remove([imagePath]);

  if (storageError) {
    console.warn("Storage deletion warning:", storageError);
    // Continue even if storage fails (may already be deleted)
  }

  // 2. Delete database record
  const { error: dbError } = await supabase.from("property_images").delete().eq("id", imageId);

  if (dbError) {
    throw new Error(`Failed to delete image record: ${dbError.message}`);
  }
}
