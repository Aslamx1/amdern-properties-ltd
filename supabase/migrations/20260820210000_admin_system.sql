CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'support',
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS ranking_tier TEXT DEFAULT 'standard';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.admins(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.admins(id);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view own profile" ON public.admins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update own profile" ON public.admins FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view admin roles" ON public.admin_roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated admins can view audit log" ON public.admin_audit_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
);
CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
);

GRANT ALL ON public.admins TO service_role;
GRANT ALL ON public.admin_roles TO service_role;
GRANT ALL ON public.admin_audit_log TO service_role;

INSERT INTO public.admin_roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access with all permissions', ARRAY['*']),
  ('content_moderator', 'Manage listings, photos, and moderation queue', ARRAY['listings.read', 'listings.update', 'listings.delete', 'photos.upload', 'agents.verify']),
  ('lead_manager', 'Manage enquiries, leads, and property requests', ARRAY['enquiries.read', 'enquiries.update', 'requests.read', 'requests.update']),
  ('finance_controller', 'Manage billing, subscriptions, and revenue', ARRAY['billing.read', 'billing.update', 'subscriptions.read', 'subscriptions.update']),
  ('support_specialist', 'View and respond to user enquiries', ARRAY['enquiries.read', 'enquiries.update', 'users.read']);
