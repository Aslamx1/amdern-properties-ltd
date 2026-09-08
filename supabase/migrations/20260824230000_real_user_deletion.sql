CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_admin UUID;
BEGIN
  SELECT a.user_id INTO current_admin
  FROM public.admins a
  WHERE a.user_id = auth.uid();

  IF current_admin IS NULL THEN
    RAISE EXCEPTION 'Access denied: only admin users can delete accounts.';
  END IF;

  DELETE FROM public.messages
  WHERE sender_id = p_user_id OR recipient_id = p_user_id;

  DELETE FROM public.notifications
  WHERE user_id = p_user_id;

  DELETE FROM public.profiles
  WHERE id = p_user_id;

  DELETE FROM public.admin_audit_log
  WHERE admin_id IN (
    SELECT id FROM public.admins WHERE user_id = p_user_id
  );

  DELETE FROM public.admins
  WHERE user_id = p_user_id;

  DELETE FROM auth.users
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'deleted_user_id', p_user_id,
    'deleted', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  DELETE FROM public.messages WHERE sender_id = OLD.id OR recipient_id = OLD.id;
  DELETE FROM public.notifications WHERE user_id = OLD.id;
  DELETE FROM public.admins WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();
