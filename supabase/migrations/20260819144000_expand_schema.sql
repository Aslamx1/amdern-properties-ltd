CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  letter TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'agent',
  phone TEXT NOT NULL,
  email TEXT,
  area_id UUID REFERENCES public.areas(id),
  about TEXT,
  listings_count INT DEFAULT 0,
  profile_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  period TEXT,
  area_id UUID REFERENCES public.areas(id),
  district TEXT NOT NULL,
  region TEXT NOT NULL,
  beds INT DEFAULT 0,
  baths INT DEFAULT 0,
  toilets INT DEFAULT 0,
  size_sqm NUMERIC DEFAULT 0,
  serviced BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  badge TEXT,
  status TEXT DEFAULT 'active',
  view_count INT DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_area ON public.listings(area_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created ON public.listings(created_at DESC);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view regions" ON public.regions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert regions" ON public.regions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view areas" ON public.areas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert areas" ON public.areas FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view agents" ON public.agents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert agents" ON public.agents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view listings" ON public.listings FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Anyone can insert listings" ON public.listings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can view saved properties" ON public.saved_properties FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert saved properties" ON public.saved_properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete saved properties" ON public.saved_properties FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view own enquiries" ON public.enquiries FOR SELECT TO anon, authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can create enquiries" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

GRANT SELECT ON public.regions TO anon, authenticated;
GRANT SELECT ON public.areas TO anon, authenticated;
GRANT SELECT ON public.agents TO anon, authenticated;
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT ALL ON public.saved_properties TO authenticated;
GRANT ALL ON public.enquiries TO authenticated;
GRANT ALL ON public.regions TO service_role;
GRANT ALL ON public.areas TO service_role;
GRANT ALL ON public.agents TO service_role;
GRANT ALL ON public.listings TO service_role;
GRANT ALL ON public.saved_properties TO service_role;
GRANT ALL ON public.enquiries TO service_role;

INSERT INTO public.regions (name, slug, letter) VALUES
  ('Central Region', 'central', 'C'),
  ('Eastern Region', 'eastern', 'E'),
  ('Western Region', 'western', 'W'),
  ('Northern Region', 'northern', 'N');

INSERT INTO public.areas (name, region_id, slug) VALUES
  ('Wakiso', (SELECT id FROM public.regions WHERE slug = 'central'), 'wakiso'),
  ('Kampala', (SELECT id FROM public.regions WHERE slug = 'central'), 'kampala'),
  ('Luweero', (SELECT id FROM public.regions WHERE slug = 'central'), 'luweero'),
  ('Mukono', (SELECT id FROM public.regions WHERE slug = 'central'), 'mukono'),
  ('Mityana', (SELECT id FROM public.regions WHERE slug = 'central'), 'mityana'),
  ('Iganga', (SELECT id FROM public.regions WHERE slug = 'eastern'), 'iganga'),
  ('Mayuge', (SELECT id FROM public.regions WHERE slug = 'eastern'), 'mayuge'),
  ('Pallisa', (SELECT id FROM public.regions WHERE slug = 'eastern'), 'pallisa'),
  ('Soroti', (SELECT id FROM public.regions WHERE slug = 'eastern'), 'soroti'),
  ('Bugiri', (SELECT id FROM public.regions WHERE slug = 'eastern'), 'bugiri'),
  ('Jinja', (SELECT id FROM public.regions WHERE slug = 'eastern'), 'jinja'),
  ('Mbarara', (SELECT id FROM public.regions WHERE slug = 'western'), 'mbarara'),
  ('Kabarole', (SELECT id FROM public.regions WHERE slug = 'western'), 'kabarole'),
  ('Hoima', (SELECT id FROM public.regions WHERE slug = 'western'), 'hoima'),
  ('Isingiro', (SELECT id FROM public.regions WHERE slug = 'western'), 'isingiro'),
  ('Kyenjojo', (SELECT id FROM public.regions WHERE slug = 'western'), 'kyenjojo'),
  ('Fort Portal', (SELECT id FROM public.regions WHERE slug = 'western'), 'fort-portal'),
  ('Arua', (SELECT id FROM public.regions WHERE slug = 'northern'), 'arua'),
  ('Gulu', (SELECT id FROM public.regions WHERE slug = 'northern'), 'gulu'),
  ('Moroto', (SELECT id FROM public.regions WHERE slug = 'northern'), 'moroto'),
  ('Lira', (SELECT id FROM public.regions WHERE slug = 'northern'), 'lira'),
  ('Kitgum', (SELECT id FROM public.regions WHERE slug = 'northern'), 'kitgum');

INSERT INTO public.agents (name, kind, phone, email, about, listings_count) VALUES
  ('Amdern Properties SMC Limited', 'agent', '+256 700 000 000', 'info@amdernproperties.com', 'Full service estate agency covering residential, land and commercial property nationwide.', 12),
  ('Kampala Homes & Land', 'agent', '+256 701 111 222', 'info@kampalahomes.co.ug', 'Specialists in residential sales and rentals across Wakiso and greater Kampala.', 6),
  ('Pearl Heights Developers', 'developer', '+256 702 333 444', 'sales@pearlheights.ug', 'Developer of gated apartment communities and townhouse estates.', 4),
  ('Nile Realty Uganda', 'agent', '+256 703 555 666', 'info@nilerealty.co.ug', 'Eastern region agency handling land, homes and commercial lettings.', 5),
  ('Rwenzori Estates Ltd', 'developer', '+256 704 777 888', 'info@rwenzoriestates.com', 'Building affordable bungalow estates in the western region.', 3);
