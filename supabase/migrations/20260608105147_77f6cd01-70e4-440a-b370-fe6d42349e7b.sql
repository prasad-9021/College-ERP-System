
-- 1. Restrict profiles SELECT
DROP POLICY IF EXISTS profiles_read_all ON public.profiles;

CREATE POLICY profiles_read_self ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_read_staff ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','principal','hod','faculty']::app_role[]));

-- 2. Explicitly deny direct writes to user_roles from clients
CREATE POLICY user_roles_no_insert ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY user_roles_no_update ON public.user_roles
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY user_roles_no_delete ON public.user_roles
  FOR DELETE TO authenticated USING (false);

-- 3. Revoke EXECUTE from SECURITY DEFINER trigger/helper functions
--    that should never be called directly by clients.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_roles() FROM PUBLIC, anon, authenticated;
