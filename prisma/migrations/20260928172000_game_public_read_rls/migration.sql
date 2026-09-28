-- Prisma tables: grant Supabase API roles (same issue as users).
GRANT ALL ON TABLE public.game_metadata TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.games TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.suspects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.locations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.weapons TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.motives TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.clues TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.results TO anon, authenticated, service_role;

-- RLS is enabled with no policies = deny all. Case content is public read.
CREATE POLICY "game_metadata_public_read"
ON public.game_metadata
FOR SELECT
USING (true);

CREATE POLICY "games_public_read"
ON public.games
FOR SELECT
USING (true);

CREATE POLICY "suspects_public_read"
ON public.suspects
FOR SELECT
USING (true);

CREATE POLICY "locations_public_read"
ON public.locations
FOR SELECT
USING (true);

CREATE POLICY "weapons_public_read"
ON public.weapons
FOR SELECT
USING (true);

CREATE POLICY "motives_public_read"
ON public.motives
FOR SELECT
USING (true);

CREATE POLICY "clues_public_read"
ON public.clues
FOR SELECT
USING (true);

-- results: no public SELECT policy; server uses service_role for validation.
