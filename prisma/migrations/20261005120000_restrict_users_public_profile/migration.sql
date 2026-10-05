-- Replace users_select_all (USING true on every column, including email).
-- The store still embeds creator display fields:
--   games.creator_id -> users (name, avatar)
-- Email, timestamps, and other columns are not granted to the Data API
-- roles that ship in the browser (anon and authenticated).
--
-- Verify in the Supabase SQL editor (postgres can SET ROLE):
--   BEGIN;
--   SET LOCAL ROLE anon;
--   SELECT email FROM public.users;            -- 42501 permission denied
--   SELECT id, name, avatar FROM public.users; -- creators only, no email
--   ROLLBACK;
--
-- Verify with the publishable anon key:
--   GET /rest/v1/users?select=email
--     -> permission denied (no email values)
--   GET /rest/v1/users?select=id,name,avatar
--     -> creator display names only
-- service_role keeps the earlier full grant for server-side use.

REVOKE ALL ON TABLE public.users FROM PUBLIC, anon, authenticated;

REVOKE SELECT (id, name, email, avatar, created_at, updated_at)
ON TABLE public.users
FROM PUBLIC, anon, authenticated;

GRANT SELECT (id, name, avatar)
ON TABLE public.users
TO anon, authenticated;

-- Auth callback upserts the signed-in profile, including email, but does
-- not read email back. RLS still limits INSERT/UPDATE to auth.uid().
GRANT INSERT (id, name, email, avatar, updated_at),
      UPDATE (id, name, email, avatar, updated_at)
ON TABLE public.users
TO authenticated;

DROP POLICY IF EXISTS "users_select_all" ON public.users;

-- Creators are shown on the store. Everyone else is visible only to
-- themselves. Email is still excluded by the column grants above.
CREATE POLICY "users_select_public_profile"
ON public.users
FOR SELECT
TO anon, authenticated
USING (
	id = (SELECT auth.uid())
	OR EXISTS (
		SELECT 1
		FROM public.games
		WHERE public.games.creator_id = public.users.id
	)
);

COMMENT ON POLICY "users_select_public_profile" ON public.users IS
	'Self or game creators. Email is not granted to anon or authenticated.';
