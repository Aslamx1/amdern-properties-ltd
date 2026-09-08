-- Enable PostGIS spatial extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Enums if not exist
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('SEEKER', 'OWNER', 'AGENT', 'DEVELOPER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AdType" AS ENUM ('IMAGE', 'SCRIPT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'SHORTLET', 'JV');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PropertyCategory" AS ENUM ('HOUSES', 'FLATS', 'LAND', 'COMMERCIAL', 'OFFICES', 'SHORTLETS', 'VEHICLES');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SEEKER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "googleId" TEXT UNIQUE,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- 2. Property table with PostGIS geometry/geography capability
CREATE TABLE IF NOT EXISTS "Property" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "price" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "bathrooms" INTEGER NOT NULL DEFAULT 0,
    "toilets" INTEGER NOT NULL DEFAULT 1,
    "parking" INTEGER NOT NULL DEFAULT 0,
    "sizeSqm" DOUBLE PRECISION,
    "plotSize" TEXT,
    "description" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL DEFAULT 'Apartment',
    "category" "PropertyCategory" NOT NULL DEFAULT 'FLATS',
    "listingType" "ListingType" NOT NULL DEFAULT 'RENT',
    "period" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "district" TEXT NOT NULL DEFAULT 'Kampala',
    "area" TEXT NOT NULL DEFAULT 'Central',
    "region" TEXT NOT NULL DEFAULT 'Central',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "amenities" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "features" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Property_slug_idx" ON "Property"("slug");
CREATE INDEX IF NOT EXISTS "Property_status_idx" ON "Property"("status");
CREATE INDEX IF NOT EXISTS "Property_isFeatured_idx" ON "Property"("isFeatured");
CREATE INDEX IF NOT EXISTS "Property_district_idx" ON "Property"("district");
CREATE INDEX IF NOT EXISTS "Property_category_idx" ON "Property"("category");
CREATE INDEX IF NOT EXISTS "Property_listingType_idx" ON "Property"("listingType");
CREATE INDEX IF NOT EXISTS "Property_lat_lng_idx" ON "Property"("lat", "lng");

-- Spatial GiST index for fast PostGIS radius queries using ST_MakePoint
CREATE INDEX IF NOT EXISTS "Property_geom_gist_idx" 
ON "Property" USING GIST (
    ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography
) 
WHERE "lat" IS NOT NULL AND "lng" IS NOT NULL;

-- 3. PropertyImage table
CREATE TABLE IF NOT EXISTS "PropertyImage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "propertyId" TEXT NOT NULL REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "imageUrl" TEXT NOT NULL,
    "webpUrl" TEXT,
    "thumbUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");
CREATE INDEX IF NOT EXISTS "PropertyImage_sortOrder_idx" ON "PropertyImage"("sortOrder");

-- 4. AdPlacement table
CREATE TABLE IF NOT EXISTS "AdPlacement" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "title" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "adType" "AdType" NOT NULL DEFAULT 'IMAGE',
    "imageUrl" TEXT,
    "targetUrl" TEXT,
    "adCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AdPlacement_slot_idx" ON "AdPlacement"("slot");
CREATE INDEX IF NOT EXISTS "AdPlacement_isActive_idx" ON "AdPlacement"("isActive");
