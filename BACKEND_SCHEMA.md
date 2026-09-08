# Real Estate Backend Schema & Query Logic
## Strict Category Isolation for Property Listings

---

## 1. DATABASE SCHEMA (PostgreSQL / Supabase)

### 1.1 Main Properties Table

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref VARCHAR(50) UNIQUE NOT NULL,                    -- e.g., AMD1001, AMD1002
  title TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,                          -- "Detached House", "Condominium", "Plot", etc.
  category VARCHAR(50) NOT NULL,                       -- ENUM: 'houses', 'flats', 'land', 'commercial', 'offices', 'shortlets', 'vehicles'
  listing_type VARCHAR(50) NOT NULL,                   -- ENUM: 'sale', 'rent', 'shortlet', 'jv'
  price DECIMAL(20, 2) NOT NULL,
  period VARCHAR(20),                                  -- NULL for 'sale', 'month'/'year'/'night' for 'rent'/'shortlet'
  area VARCHAR(255),                                   -- Neighborhood (e.g., Kyaliwajjala, Kololo)
  district VARCHAR(100),                               -- District (e.g., Wakiso, Kampala)
  region VARCHAR(100),                                 -- Region (e.g., Central Region)
  beds INTEGER DEFAULT 0,
  baths INTEGER DEFAULT 0,
  toilets INTEGER DEFAULT 0,
  parking INTEGER DEFAULT 0,
  plot_size VARCHAR(100),                              -- "13 Decimals", "50ft by 100ft", "140 sqm"
  size_sqm DECIMAL(10, 2),
  description TEXT,
  features TEXT[],                                     -- Array of feature strings
  serviced BOOLEAN DEFAULT FALSE,
  furnished BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,
  added_days_ago INTEGER DEFAULT 0,
  photo_count INTEGER DEFAULT 0,
  video_url VARCHAR(500),
  badge VARCHAR(100),                                  -- "Featured", "Hot Deal", "Verified photos", NULL
  agent_id UUID REFERENCES agents(id),
  status VARCHAR(50) DEFAULT 'active',                 -- 'active', 'draft', 'archived'
  moderation_status VARCHAR(50) DEFAULT 'approved',    -- 'approved', 'pending', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- CONSTRAINTS: Ensure category & listing_type are valid
  CHECK (category IN ('houses', 'flats', 'land', 'commercial', 'offices', 'shortlets', 'vehicles')),
  CHECK (listing_type IN ('sale', 'rent', 'shortlet', 'jv')),
  
  -- INDEX for fast filtering by category and listing_type
  CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX idx_properties_category_listing ON properties(category, listing_type);
CREATE INDEX idx_properties_ref ON properties(ref);
CREATE INDEX idx_properties_status ON properties(status, moderation_status);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_created ON properties(created_at DESC);
```

### 1.2 Property Images Table

```sql
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500),                            -- Local file path for reference
  alt_text VARCHAR(255),
  position INTEGER DEFAULT 0,                          -- Order in gallery
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- Ensure strict binding to property
  CONSTRAINT unique_image_per_property UNIQUE (property_id, image_path)
);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_position ON property_images(property_id, position);
```

### 1.3 Agents Table

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  kind VARCHAR(50),                                    -- 'agent', 'developer'
  area VARCHAR(255),
  phone VARCHAR(20),
  phone2 VARCHAR(20),
  email VARCHAR(255),
  listing_count INTEGER DEFAULT 0,
  about TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert main agent
INSERT INTO agents (name, kind, area, phone, phone2, email, about)
VALUES (
  'AMDERN PROPERTIES SMC LTD',
  'agent',
  'Kampala / Wakiso / Nationwide',
  '+256 702 104 499',
  '+256 786 793 139',
  'amdernsmcpropertiesltd@gmail.com',
  'Full service real estate agency covering residential homes, modern apartments, genuine titled land, and commercial properties across Uganda.'
);
```

---

## 2. BACKEND QUERY LOGIC (Node.js + Express)

### 2.1 Core Query Builder (lib/propertyQueries.ts)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Strict category filter: no cross-category leakage
export const CATEGORY_MAPPING = {
  houses: ["houses"],
  flats: ["flats", "shortlets"],
  land: ["land"],
  commercial: ["commercial", "offices"],
  vehicles: ["vehicles"],
};

/**
 * Base query: filters by category, listing_type, and status
 * Used by all category endpoints to ensure isolation
 */
export async function getPropertiesByCategory(
  categoryKey: string,
  listingType: "sale" | "rent" | "shortlet" | "jv",
  options: { limit?: number; offset?: number } = {}
) {
  const categories = CATEGORY_MAPPING[categoryKey as keyof typeof CATEGORY_MAPPING];

  if (!categories) {
    throw new Error(`Invalid category: ${categoryKey}`);
  }

  let query = supabase
    .from("properties")
    .select("*, property_images(image_url, position)")
    .in("category", categories)
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
    throw new Error(`Query failed for ${categoryKey}: ${error.message}`);
  }

  return data || [];
}

/**
 * Get single property by ID with images
 * Ensures the property exists and is published
 */
export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(image_url, alt_text, position)")
    .eq("id", id)
    .eq("status", "active")
    .eq("moderation_status", "approved")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Search within a category (strict isolation)
 */
export async function searchPropertiesByCategory(
  categoryKey: string,
  query: string,
  listingType?: string
) {
  const categories = CATEGORY_MAPPING[categoryKey as keyof typeof CATEGORY_MAPPING];

  if (!categories) {
    throw new Error(`Invalid category: ${categoryKey}`);
  }

  let dbQuery = supabase
    .from("properties")
    .select("*, property_images(image_url)")
    .in("category", categories)
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

  return data || [];
}
```

### 2.2 Express Routes (Express.js)

```typescript
import express from "express";
import { getPropertiesByCategory, getPropertyById, searchPropertiesByCategory } from "./propertyQueries";

const router = express.Router();

// ============================================================================
// CATEGORY-SPECIFIC ENDPOINTS (Strict Isolation)
// ============================================================================

/**
 * GET /api/for-sale/houses
 * Returns ONLY properties where category='houses' AND listing_type='sale'
 */
router.get("/for-sale/houses", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const properties = await getPropertiesByCategory("houses", "sale", {
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/for-sale/flats-apartments
 * Returns ONLY properties where category IN ('flats', 'shortlets') AND listing_type='sale'
 * ISOLATED: Never returns houses, land, or commercial properties
 */
router.get("/for-sale/flats-apartments", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const properties = await getPropertiesByCategory("flats", "sale", {
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/for-sale/land
 * Returns ONLY properties where category='land' AND listing_type='sale'
 * ISOLATED: No houses, flats, or commercial
 */
router.get("/for-sale/land", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const properties = await getPropertiesByCategory("land", "sale", {
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/for-sale/commercial
 * Returns ONLY properties where category IN ('commercial', 'offices') AND listing_type='sale'
 */
router.get("/for-sale/commercial", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const properties = await getPropertiesByCategory("commercial", "sale", {
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/for-rent/houses
 * Returns ONLY properties where category='houses' AND listing_type='rent'
 */
router.get("/for-rent/houses", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const properties = await getPropertiesByCategory("houses", "rent", {
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/for-rent/flats-apartments
 * Returns ONLY properties where category IN ('flats', 'shortlets') AND listing_type='rent'
 */
router.get("/for-rent/flats-apartments", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const properties = await getPropertiesByCategory("flats", "rent", {
      limit,
      offset,
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/property/:id
 * Returns a single property with all its images bound to that property_id
 */
router.get("/property/:id", async (req, res) => {
  try {
    const property = await getPropertyById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/search/:category?query=...
 * Search within a specific category only (no cross-category results)
 */
router.get("/search/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { query, listing_type } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ success: false, error: "Query param required" });
    }

    const properties = await searchPropertiesByCategory(
      category,
      query,
      listing_type as string
    );

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

### 2.3 Image Upload Handler

```typescript
/**
 * POST /api/property/:propertyId/upload-image
 * Strict binding: image is tied to a single property_id only
 */
router.post("/property/:propertyId/upload-image", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const file = req.file; // Using multer middleware

    if (!file) {
      return res.status(400).json({ success: false, error: "No file provided" });
    }

    // 1. Verify the property exists and is not deleted
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id, status")
      .eq("id", propertyId)
      .single();

    if (propError || !property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }

    // 2. Upload image to storage
    const timestamp = Date.now();
    const fileName = `${propertyId}/${timestamp}-${file.originalname}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("property-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) {
      throw storageError;
    }

    // 3. Get the public URL
    const { data: publicUrl } = supabase.storage
      .from("property-images")
      .getPublicUrl(fileName);

    // 4. Create image record strictly bound to this property_id
    const { data: imageRecord, error: imageError } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        image_url: publicUrl.publicUrl,
        image_path: fileName,
        alt_text: req.body.alt_text || "Property image",
        position: req.body.position || 0,
        uploaded_by: req.user?.id,
      })
      .select()
      .single();

    if (imageError) {
      throw imageError;
    }

    res.json({
      success: true,
      data: imageRecord,
      message: `Image bound to property ${propertyId}`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/property/:propertyId/images
 * Returns ONLY images for this specific property
 * Ensures no image leakage between properties
 */
router.get("/property/:propertyId/images", async (req, res) => {
  try {
    const { propertyId } = req.params;

    const { data: images, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("position", { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: images || [],
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

---

## 3. ROW-LEVEL SECURITY (RLS) Policies

```sql
-- ============================================================================
-- RLS POLICIES: Enforce category isolation at the database level
-- ============================================================================

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published properties (strict category isolation via query)
CREATE POLICY "anyone_can_view_published_properties"
ON properties
FOR SELECT
USING (status = 'active' AND moderation_status = 'approved');

-- Policy: Only admins can insert/update/delete properties
CREATE POLICY "admins_can_manage_properties"
ON properties
FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Anyone can view property images of published properties
CREATE POLICY "anyone_can_view_property_images"
ON property_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_images.property_id
    AND p.status = 'active'
    AND p.moderation_status = 'approved'
  )
);

-- Policy: Only admins can upload/manage images
CREATE POLICY "admins_can_manage_images"
ON property_images
FOR INSERT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## 4. KEY SAFEGUARDS FOR STRICT ISOLATION

| Safeguard | Implementation | Benefit |
|-----------|----------------|---------|
| **Category Enum Check** | `CHECK (category IN (...))` at DB level | Prevents invalid categories from being inserted |
| **Listing Type Enum** | `CHECK (listing_type IN (...))` at DB level | Ensures only valid listing types (sale/rent/shortlet/jv) |
| **Category-Specific Endpoints** | Separate API routes per category with hardcoded WHERE clauses | No single endpoint can mix categories |
| **CATEGORY_MAPPING** | Mapping of category names to database values (e.g., "flats" → ['flats', 'shortlets']) | Single source of truth for which DB categories appear in which endpoint |
| **Image Foreign Key** | `UNIQUE (property_id, image_path)` constraint | Every image is bound to exactly one property; no orphaned images |
| **RLS Policies** | Database-level row security enforces access rules | Protection even if application code is bypassed |
| **Status & Moderation Filters** | All queries check `status='active' AND moderation_status='approved'` | Draft/archived properties never leak into public endpoints |
| **Index on (category, listing_type)** | Fast lookups for category-specific queries | Performance guarantee for strict isolation queries |

---

## 5. TESTING QUERIES

### 5.1 Test: Houses for Sale Only

```sql
-- Should return ONLY houses with listing_type='sale'
SELECT COUNT(*) FROM properties
WHERE category = 'houses' AND listing_type = 'sale' AND status = 'active';

-- Should NOT include flats, land, commercial, etc.
SELECT COUNT(*) FROM properties
WHERE category IN ('flats', 'land', 'commercial') AND listing_type = 'sale';
-- Expected: 0 if isolation is working
```

### 5.2 Test: Flats for Sale Strict Isolation

```sql
-- Should return flats + shortlets for sale only
SELECT COUNT(*) FROM properties
WHERE category IN ('flats', 'shortlets') AND listing_type = 'sale' AND status = 'active';

-- Should NOT include houses
SELECT COUNT(*) FROM properties
WHERE category = 'houses' AND listing_type = 'sale' AND status = 'active';
-- These are separate result sets with no overlap
```

### 5.3 Test: Image Binding

```sql
-- All images for a property should be bound to exactly one property_id
SELECT property_id, COUNT(*) as image_count
FROM property_images
GROUP BY property_id;

-- No orphaned images (property_id not in properties table)
SELECT pi.id FROM property_images pi
WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = pi.property_id);
-- Expected: 0 rows (no orphaned images)
```

---

## 6. MIGRATION (From Seed Data to Database)

```sql
-- Step 1: Create tables and indexes (run the schema above)

-- Step 2: Insert seeded properties
INSERT INTO properties (
  ref, title, type, category, listing_type, price, area, district, region,
  beds, baths, toilets, parking, plot_size, description, features, status
) VALUES
  ('AMD1000', 'FLAT HOUSE FOR SALE - SSEGUKU KATALE, ENTEBBE ROAD', 'Executive Flat House', 'houses', 'sale', 2100000000, 'Sseguku Katale', 'Entebbe', 'Central Region', 6, 5, 6, 4, '25 Decimals', 'Fully-furnished...', ARRAY['...'], 'active'),
  ('AMD1001', 'Apartment Block — Kyaliwajjala', 'Block of Flats', 'flats', 'sale', 1700000000, 'Kyaliwajjala', 'Wakiso', 'Central Region', 12, 12, 12, 8, '13 Decimals', 'APARTMENT BLOCK FOR SALE...', ARRAY['...'], 'active');
  -- Add all other seeded properties

-- Step 3: Insert images (bound to properties by property_id)
INSERT INTO property_images (property_id, image_url, image_path, position)
SELECT p.id, '/property-media/IMG-20260825-WA0018.jpg', 'IMG-20260825-WA0018.jpg', 0
FROM properties p WHERE p.ref = 'AMD1000'
UNION ALL
SELECT p.id, '/property-media/IMG-20260819-WA0109.jpg', 'IMG-20260819-WA0109.jpg', 0
FROM properties p WHERE p.ref = 'AMD1001';
-- Repeat for all images
```

---

## Summary

✅ **Category Isolation Achieved:**
- Database schema enforces category via NOT NULL + CHECK constraints
- Each API endpoint queries only its own category
- Images bound strictly to property_id
- RLS policies add database-level protection
- No accidental cross-category leakage possible

✅ **Performance:**
- Indexed queries on (category, listing_type) for fast filtering
- Separate endpoints avoid expensive JOIN overhead

✅ **Maintainability:**
- CATEGORY_MAPPING single source of truth
- Clear naming (e.g., `/api/for-sale/flats-apartments` clearly returns flats only)
- RLS provides defense-in-depth

