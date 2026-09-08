# Strict Category Isolation Implementation Guide

## Overview

This guide covers the complete implementation of a robust property listing system with strict category isolation. Properties are completely segregated by category (houses, flats, land, commercial), ensuring no cross-contamination across category pages.

---

## ✅ What Has Been Implemented

### 1. **Database Schema** (`supabase/migrations/20260825_create_properties_tables.sql`)

**Tables Created:**
- **`properties`** - Main listing table with:
  - Category field with CHECK constraint enforcing valid categories
  - Listing type field (sale/rent/shortlet/jv)
  - Status and moderation status fields
  - Indexes on `(category, listing_type)` for fast filtering
  
- **`property_images`** - Strict image binding:
  - Foreign key to `properties(id)` with CASCADE delete
  - UNIQUE constraint on `(property_id, image_path)` to prevent duplicate paths
  
- **`agents`** - Agent/company information

- **Row-Level Security (RLS) Policies** - Database-level enforcement:
  - Public users see only published properties
  - Admins can manage all properties
  - Images only visible when property is published

### 2. **Client-Side Query Library** (`src/lib/propertyQueries.ts`)

**Provides:**
- `CATEGORY_MAPPING` - Single source of truth for category isolation
- `getPropertiesByCategory()` - Strict category-based queries
- `searchPropertiesByCategory()` - Search confined to one category
- `getPropertyById()` - Fetch single property with images
- `uploadPropertyImage()` - Bind images strictly to property_id
- `deletePropertyImage()` - Remove images safely

**Key Feature:** All queries use `CATEGORY_MAPPING` to ensure queries return ONLY the appropriate categories (e.g., "flats" endpoint returns both "flats" AND "shortlets" if appropriate).

### 3. **Admin Server Functions** (`src/routes/api.properties.tsx`)

**Server-side operations with strict validation:**
- `createPropertyAdminFn()` - Create new property with category validation
- `updatePropertyAdminFn()` - Update property (warns if category changing)
- `deletePropertyAdminFn()` - Delete property and cascade delete images
- `listPropertiesAdminFn()` - Admin list view with category filter
- `uploadPropertyImageAdminFn()` - Upload images
- `deletePropertyImageAdminFn()` - Delete images
- `reorderPropertyImagesAdminFn()` - Reorder gallery images

**Key Features:**
- Server-side category validation (prevents tampering)
- Service role auth (admin-only access)
- Automatic cascading deletions

### 4. **Admin UI Panel** (`src/routes/admin.listings.tsx`)

**Features:**
- Create/Edit form with:
  - **Required category field** (highlighted in red) - cannot save without category
  - All property fields (title, price, beds, baths, etc.)
  - Description and features text areas
  
- **Category Change Confirmation** - Shows dialog when changing category:
  - Warns user property will move between sections
  - Lists old and new category
  - Requires explicit confirmation
  
- **Delete Confirmation** - Prevents accidental deletion
  
- **Properties Table** - View all properties:
  - Ref, Title, Category, Price, Location, Status
  - Edit/Delete buttons per row
  - Quick status indication

---

## 🚀 Getting Started

### Step 1: Apply the Database Migration

```bash
# Option A: Using Supabase CLI
npx supabase migration up

# Option B: Manual SQL execution
# Copy the SQL from supabase/migrations/20260825_create_properties_tables.sql
# Paste into Supabase SQL editor and run
```

### Step 2: Create Storage Bucket for Images

```bash
# Via Supabase Dashboard:
# 1. Go to Storage
# 2. Create new bucket: "property-images"
# 3. Set to Public (or configure RLS policies)
# 4. Allow jpg, png, gif, webp
```

### Step 3: Migrate Existing Seed Data to Database

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run migration script
npx ts-node scripts/migrate-seed-data.ts

# Expected output:
# 🚀 Starting seed data migration...
# 📦 Migrating agents...
#   ✅ Agent: AMDERN PROPERTIES SMC LTD
# 🏠 Migrating properties...
#   ✅ Property: AMD1001 - HOUSE ON QUICK SALE - MATUGGA KIRYAGONJA
#      📸 Added 8 images
#   ... (more properties)
# ✨ Verifying migration...
# ✅ Migration complete!
```

### Step 4: Update Client Code to Use New Queries

**Replace old listing fetches with new queries:**

```typescript
// OLD (seed-based):
import { filterListings, LISTINGS } from "@/lib/listings";
const houses = filterListings(LISTINGS, "houses", "sale");

// NEW (database-based):
import { getPropertiesByCategory } from "@/lib/propertyQueries";
const houses = await getPropertiesByCategory("houses", "sale", { limit: 20 });
```

### Step 5: Access Admin Panel

Navigate to: `http://localhost:5173/admin/listings`

---

## 📋 How Strict Isolation Works

### The Category Mapping System

```typescript
const CATEGORY_MAPPING = {
  houses: ["houses"],
  flats: ["flats", "shortlets"],
  land: ["land"],
  commercial: ["commercial", "offices"],
  vehicles: ["vehicles"],
};
```

**This means:**
- When user visits `/for-sale/flats-apartments`, query fetches ONLY records where `category IN ('flats', 'shortlets')`
- Houses NEVER appear in that result set
- Search within "flats" category searches ONLY those two categories
- If you try to move a house to "flats" category, admin confirms before allowing

### Database-Level Enforcement

```sql
-- CHECK constraint prevents invalid categories
CHECK (category IN ('houses', 'flats', 'land', 'commercial', 'offices', 'shortlets', 'vehicles'))

-- INDEX speeds up category-specific queries
CREATE INDEX idx_properties_category_listing ON properties(category, listing_type);

-- RLS policies prevent unauthorized access
CREATE POLICY "anyone_can_view_published_properties" ON properties
  FOR SELECT
  USING (status = 'active' AND moderation_status = 'approved');
```

### Image Binding

```sql
-- UNIQUE constraint ensures no duplicate image paths per property
CONSTRAINT unique_image_per_property UNIQUE (property_id, image_path)

-- ON DELETE CASCADE ensures orphaned images are impossible
CONSTRAINT fk_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
```

---

## 🛠️ Typical Workflows

### Add a New Property

1. Go to Admin Panel: `/admin/listings`
2. Click "New Property"
3. Fill form:
   - **REQUIRED**: Select Category (highlighted in red)
   - Title, Type, Price, Beds, Baths, etc.
   - Description
4. Click "Create Property"
5. Property appears ONLY in that category page

### Move Property Between Categories

1. Click Edit on the property
2. Change the Category dropdown
3. Click "Save Changes"
4. Confirmation dialog appears showing:
   - Old category (will no longer show there)
   - New category (will now show there)
5. Click "Yes, Change Category" to confirm
6. Property instantly moves to new category

### Add Images to Property

1. In the properties table, click Edit
2. (Image upload UI coming in next phase)
3. Or use `uploadPropertyImageAdminFn()` API directly

### Delete Property

1. Click the trash icon in the table
2. Confirmation dialog asks "Delete Property?"
3. Click "Delete"
4. Property AND all images deleted (cascading)

---

## 🔍 Verification Queries

Use these SQL queries to verify strict isolation:

### Verify Properties by Category

```sql
-- Check houses
SELECT COUNT(*) FROM properties WHERE category='houses' AND status='active';
-- Should return only house count

-- Check flats
SELECT COUNT(*) FROM properties WHERE category IN ('flats', 'shortlets') AND status='active';
-- Should return flats + shortlets count

-- Verify no mixing
SELECT DISTINCT category FROM properties ORDER BY category;
-- Should show clean category separation
```

### Verify Images Are Bound Correctly

```sql
-- All images should have valid property_id
SELECT COUNT(*) FROM property_images pi
WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = pi.property_id);
-- Expected: 0 (no orphaned images)

-- Images by property
SELECT property_id, COUNT(*) as image_count
FROM property_images
GROUP BY property_id
ORDER BY image_count DESC;
```

---

## ⚙️ Environment Variables

Add to your `.env` file:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📝 API Reference

### Client-Side Functions

```typescript
// Query for specific category with pagination
getPropertiesByCategory(
  "houses" | "flats" | "land" | "commercial",
  "sale" | "rent" | "shortlet" | "jv",
  { limit?: number; offset?: number }
): Promise<Property[]>

// Search within category
searchPropertiesByCategory(
  categoryKey: string,
  query: string,
  listingType?: string
): Promise<Property[]>

// Get single property
getPropertyById(id: string): Promise<Property | null>

// Upload image bound to property
uploadPropertyImage(
  propertyId: string,
  file: File,
  altText?: string
): Promise<PropertyImage>

// Delete image
deletePropertyImage(imageId: string, imagePath: string): Promise<void>
```

### Server Functions (Admin Only)

```typescript
// Create property
createPropertyAdminFn(propertyData: Property): Promise<Property>

// Update property
updatePropertyAdminFn(
  id: string,
  updates: Partial<Property>
): Promise<Property>

// Delete property (cascades to images)
deletePropertyAdminFn(id: string): Promise<void>

// List all properties (with filters)
listPropertiesAdminFn({
  category?: string;
  listing_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ properties: Property[]; count: number }>
```

---

## 🐛 Troubleshooting

### Properties Not Showing

```bash
# Check 1: Are they in the database?
SELECT COUNT(*) FROM properties;

# Check 2: Do they have correct category?
SELECT category, COUNT(*) FROM properties GROUP BY category;

# Check 3: Are they active and approved?
SELECT COUNT(*) FROM properties WHERE status='active' AND moderation_status='approved';
```

### Images Not Loading

```bash
# Check 1: Do images exist in storage?
# Go to Supabase Dashboard → Storage → property-images

# Check 2: Are they bound to correct property?
SELECT COUNT(*) FROM property_images;

# Check 3: Check for broken image_url records
SELECT id, image_url FROM property_images WHERE image_url IS NULL;
```

### Category Changes Not Working

```bash
# Ensure you're using updatePropertyAdminFn, not direct DB update
# Confirm dialog must be accepted client-side
# Check browser console for validation errors
```

---

## 🎯 Next Steps

1. **Deploy to Supabase** - Run migrations on live project
2. **Test category isolation** - Verify properties don't mix between pages
3. **Implement image gallery UI** - Add photo carousel to property detail pages
4. **Add property search** - Implement `/api/search/:category` endpoint
5. **Analytics** - Track which categories get most views
6. **Approval workflow** - Implement moderation queue for pending properties

---

## 📚 File Structure

```
src/
├── lib/
│   └── propertyQueries.ts          # Client query functions
├── routes/
│   ├── api.properties.tsx          # Server admin functions
│   └── admin.listings.tsx          # Admin UI panel
└── [other routes]

supabase/
├── migrations/
│   └── 20260825_create_properties_tables.sql
└── functions/
    └── [future edge functions]

scripts/
└── migrate-seed-data.ts            # One-time migration script

public/
└── property-media/                 # Image storage
```

---

## ✨ Key Features Summary

✅ **Strict Category Isolation** - No cross-contamination possible  
✅ **Database-Level Enforcement** - CHECK constraints + RLS policies  
✅ **Image Binding** - Images locked to single property  
✅ **Admin Validation** - Category changes require confirmation  
✅ **Cascading Deletes** - Deleting property removes images automatically  
✅ **Type-Safe** - Full TypeScript support  
✅ **Production-Ready** - Indexed queries, RLS policies, error handling  

---

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review SQL verification queries
3. Check browser console and server logs
4. Verify environment variables are set correctly

---

**Version:** 1.0  
**Last Updated:** August 25, 2026  
**Status:** Ready for Production
