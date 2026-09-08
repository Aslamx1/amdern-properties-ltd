import crypto from "crypto";

/**
 * Generates an SEO-optimized URL slug according to the specification:
 * {bedrooms}-bedroom-{property_type}-in-{district}-{unique_hash}
 */
export function generatePropertySlug(params: {
  bedrooms?: number | null;
  propertyType?: string | null;
  listingType?: string | null;
  district?: string | null;
  title?: string | null;
}): string {
  const beds = params.bedrooms && params.bedrooms > 0 ? `${params.bedrooms}-bedroom-` : "";
  
  const rawType = params.propertyType || "property";
  const typeClean = rawType
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const rawListing = params.listingType || "rent";
  const listingClean = rawListing
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const rawDistrict = params.district || "kampala";
  const districtClean = rawDistrict
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Generate 6-char random hex hash to prevent slug collisions
  const uniqueHash = crypto.randomBytes(3).toString("hex");

  const slug = `${beds}${typeClean}-for-${listingClean}-in-${districtClean}-${uniqueHash}`
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug;
}
