-- ==============================================================================
-- MIGRATION: Technical SEO Slugs, Meta Tags & 301 Redirect History
-- Date: 2026-09-07
-- Database: PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Alter properties table to support keyword-rich slugs and custom meta tags
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(70),
  ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- 2. Create property_slug_histories table for tracking 301 permanent redirects
CREATE TABLE IF NOT EXISTS property_slug_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  old_slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for instant 301 redirect lookup
CREATE INDEX IF NOT EXISTS idx_property_slug_histories_old_slug ON property_slug_histories(old_slug);
CREATE INDEX IF NOT EXISTS idx_property_slug_histories_property_id ON property_slug_histories(property_id);

-- 3. Automatic Slug Generator Function
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
DECLARE
  v_beds TEXT := '';
  v_type TEXT := '';
  v_listing TEXT := '';
  v_loc TEXT := '';
  v_base TEXT := '';
  v_final_slug TEXT := '';
BEGIN
  -- Only generate if slug is null or empty
  IF NEW.slug IS NULL OR TRIM(NEW.slug) = '' THEN
    IF NEW.beds IS NOT NULL AND NEW.beds > 0 THEN
      v_beds := NEW.beds || '-bedroom-';
    END IF;

    v_type := LOWER(REGEXP_REPLACE(COALESCE(NEW.type, 'property'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_type := TRIM(BOTH '-' FROM v_type);

    v_listing := LOWER(REGEXP_REPLACE(COALESCE(NEW.listing_type, 'sale'), '[^a-zA-Z0-9]+', '-', 'g'));

    v_loc := LOWER(REGEXP_REPLACE(COALESCE(NEW.area, NEW.district, 'uganda'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_loc := TRIM(BOTH '-' FROM v_loc);

    v_base := v_beds || v_type || '-for-' || v_listing || '-in-' || v_loc || '-' || LOWER(COALESCE(NEW.ref, SUBSTRING(NEW.id::text, 1, 6)));
    v_final_slug := REGEXP_REPLACE(v_base, '-+', '-', 'g');

    NEW.slug := v_final_slug;
  END IF;

  -- Default meta_title if not provided
  IF NEW.meta_title IS NULL OR TRIM(NEW.meta_title) = '' THEN
    NEW.meta_title := SUBSTRING(
      CASE WHEN NEW.beds > 0 THEN NEW.beds || ' Bed ' ELSE '' END ||
      NEW.type || ' for ' || INITCAP(NEW.listing_type) || ' in ' || COALESCE(NEW.area, NEW.district) || ' — Amdern Properties'
      FROM 1 FOR 70
    );
  END IF;

  -- Default meta_description if not provided
  IF NEW.meta_description IS NULL OR TRIM(NEW.meta_description) = '' THEN
    NEW.meta_description := SUBSTRING(
      COALESCE(NEW.description, NEW.title || ' located in ' || COALESCE(NEW.area, NEW.district) || ', Uganda. Contact Amdern Properties SMC Limited.')
      FROM 1 FOR 160
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert to populate slug and meta tags
DROP TRIGGER IF EXISTS trg_properties_generate_slug ON properties;
CREATE TRIGGER trg_properties_generate_slug
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION generate_property_slug();

-- 4. Trigger to record old slugs into property_slug_histories on update
CREATE OR REPLACE FUNCTION track_property_slug_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.slug IS NOT NULL AND NEW.slug IS NOT NULL AND OLD.slug <> NEW.slug THEN
    INSERT INTO property_slug_histories (property_id, old_slug)
    VALUES (NEW.id, OLD.slug)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_properties_track_slug ON properties;
CREATE TRIGGER trg_properties_track_slug
  AFTER UPDATE OF slug ON properties
  FOR EACH ROW
  EXECUTE FUNCTION track_property_slug_history();

-- 5. Backfill existing properties that lack a slug
UPDATE properties
SET slug = REGEXP_REPLACE(
  LOWER(
    CASE WHEN beds > 0 THEN beds || '-bedroom-' ELSE '' END ||
    REGEXP_REPLACE(COALESCE(type, 'property'), '[^a-zA-Z0-9]+', '-', 'g') || '-for-' ||
    REGEXP_REPLACE(COALESCE(listing_type, 'sale'), '[^a-zA-Z0-9]+', '-', 'g') || '-in-' ||
    REGEXP_REPLACE(COALESCE(area, district, 'uganda'), '[^a-zA-Z0-9]+', '-', 'g') || '-' ||
    LOWER(COALESCE(ref, SUBSTRING(id::text, 1, 6)))
  ),
  '-+', '-', 'g'
)
WHERE slug IS NULL OR TRIM(slug) = '';
