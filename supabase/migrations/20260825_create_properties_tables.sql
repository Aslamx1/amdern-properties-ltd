-- ============================================================================
-- MIGRATION: Create strict category-isolated property listing system
-- Date: 2026-08-25
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: agents
-- Stores property agents/companies
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
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

-- ============================================================================
-- TABLE: properties
-- Main property listing table with strict category isolation
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
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
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active',                 -- 'active', 'draft', 'archived'
  moderation_status VARCHAR(50) DEFAULT 'approved',    -- 'approved', 'pending', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- CONSTRAINTS: Ensure category & listing_type are valid
  CONSTRAINT valid_category CHECK (category IN ('houses', 'flats', 'land', 'commercial', 'offices', 'shortlets', 'vehicles')),
  CONSTRAINT valid_listing_type CHECK (listing_type IN ('sale', 'rent', 'shortlet', 'jv'))
);

-- Indexes for fast filtering by category and listing_type (CRITICAL for isolation)
CREATE INDEX idx_properties_category_listing ON properties(category, listing_type);
CREATE INDEX idx_properties_ref ON properties(ref);
CREATE INDEX idx_properties_status ON properties(status, moderation_status);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_created ON properties(created_at DESC);

-- ============================================================================
-- TABLE: property_images
-- Strict image binding to properties — no image mixing
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500),                            -- Local file path for reference
  alt_text VARCHAR(255),
  position INTEGER DEFAULT 0,                          -- Order in gallery
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ensure strict binding to property and no duplicate paths
  CONSTRAINT unique_image_per_property UNIQUE (property_id, image_path)
);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_position ON property_images(property_id, position);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- Enforce category isolation and publication status at database level
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published properties (queries will enforce category isolation)
CREATE POLICY "anyone_can_view_published_properties" ON properties
  FOR SELECT
  USING (status = 'active' AND moderation_status = 'approved');

-- Policy: Only authenticated admins can insert/update/delete properties
-- (Assumes an 'admin' role in profiles table)
CREATE POLICY "admins_can_manage_properties" ON properties
  FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
      OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'service_role')
    )
  );

-- Policy: Anyone can view images of published properties
CREATE POLICY "anyone_can_view_property_images" ON property_images
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
CREATE POLICY "admins_can_manage_images" ON property_images
  FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
      OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'service_role')
    )
  );

-- ============================================================================
-- TRIGGER: Update updated_at on property changes
-- ============================================================================
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_update_timestamp
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_properties_updated_at();

-- ============================================================================
-- SEED DATA: Insert main agent
-- ============================================================================
INSERT INTO agents (name, kind, area, phone, phone2, email, about)
VALUES (
  'AMDERN PROPERTIES SMC LTD',
  'agent',
  'Kampala / Wakiso / Nationwide',
  '+256 702 104 499',
  '+256 786 793 139',
  'amdernsmcpropertiesltd@gmail.com',
  'Full service real estate agency covering residential homes, modern apartments, genuine titled land, and commercial properties across Uganda.'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (if using public schema)
-- ============================================================================
GRANT SELECT ON properties TO anon;
GRANT SELECT ON property_images TO anon;
GRANT ALL ON properties TO authenticated;
GRANT ALL ON property_images TO authenticated;
