/**
 * Generates Schema.org RealEstateListing structured JSON-LD metadata
 * for rich snippets on Google search results.
 */
export function generateRealEstateSchema(property: {
  title: string;
  slug: string;
  description: string;
  price: number | string;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  district?: string;
  area?: string;
  lat?: number | null;
  lng?: number | null;
  images?: Array<{ imageUrl: string; webpUrl?: string | null }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}, baseUrl: string = "https://amdernpropertiessmclimited.com") {
  const propertyUrl = `${baseUrl.replace(/\/$/, "")}/property/${property.slug}`;
  const imageList = (property.images && property.images.length > 0)
    ? property.images.map((img) => img.webpUrl || img.imageUrl)
    : [`${baseUrl}/placeholder.png`];

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": propertyUrl,
    name: property.title,
    description: property.description,
    url: propertyUrl,
    image: imageList,
    datePosted: property.createdAt ? new Date(property.createdAt).toISOString() : new Date().toISOString(),
    dateModified: property.updatedAt ? new Date(property.updatedAt).toISOString() : new Date().toISOString(),
    offers: {
      "@type": "Offer",
      price: Number(property.price),
      priceCurrency: property.currency || "UGX",
      availability: "https://schema.org/InStock",
      validFrom: property.createdAt ? new Date(property.createdAt).toISOString() : new Date().toISOString(),
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.area || property.district || "Kampala",
      addressRegion: property.district || "Central",
      addressCountry: "UG",
    },
  };

  if (property.lat && property.lng) {
    schema["geo"] = {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    };
  }

  if (property.bedrooms) {
    schema["numberOfRooms"] = property.bedrooms;
    schema["numberOfBedrooms"] = property.bedrooms;
  }

  if (property.bathrooms) {
    schema["numberOfBathroomsTotal"] = property.bathrooms;
  }

  return schema;
}
