-- Case visibility. The column default is private, so every existing
-- row stays private. Owners publish later from the store. No backfill.

CREATE TYPE "GameVisibility" AS ENUM ('private', 'public');

ALTER TABLE "games"
ADD COLUMN "visibility" "GameVisibility" NOT NULL DEFAULT 'private';

CREATE INDEX "games_visibility_idx" ON "games"("visibility");

GRANT USAGE ON TYPE "GameVisibility" TO anon, authenticated, service_role;

-- Replace open reads. A row is visible when the case is public, the
-- viewer created it, or the viewer has a solve recorded.
DROP POLICY IF EXISTS "games_public_read" ON public.games;

CREATE POLICY "games_select_visible"
ON public.games
FOR SELECT
TO anon, authenticated
USING (
	visibility = 'public'
	OR creator_id = (SELECT auth.uid())
	OR EXISTS (
		SELECT 1
		FROM public.user_submissions AS submission
		WHERE submission.game_id = public.games.id
			AND submission.user_id = (SELECT auth.uid())
	)
);

-- Case body follows the parent game. Games RLS is the gate.
DROP POLICY IF EXISTS "game_metadata_public_read" ON public.game_metadata;
DROP POLICY IF EXISTS "suspects_public_read" ON public.suspects;
DROP POLICY IF EXISTS "locations_public_read" ON public.locations;
DROP POLICY IF EXISTS "weapons_public_read" ON public.weapons;
DROP POLICY IF EXISTS "motives_public_read" ON public.motives;
DROP POLICY IF EXISTS "clues_public_read" ON public.clues;

CREATE POLICY "game_metadata_select_visible"
ON public.game_metadata
FOR SELECT
TO anon, authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.games AS game
		WHERE game.game_metadata_id = public.game_metadata.id
	)
);

CREATE POLICY "suspects_select_visible"
ON public.suspects
FOR SELECT
TO anon, authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.games AS game
		WHERE game.game_metadata_id = public.suspects.game_metadata_id
	)
);

CREATE POLICY "locations_select_visible"
ON public.locations
FOR SELECT
TO anon, authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.games AS game
		WHERE game.game_metadata_id = public.locations.game_metadata_id
	)
);

CREATE POLICY "weapons_select_visible"
ON public.weapons
FOR SELECT
TO anon, authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.games AS game
		WHERE game.game_metadata_id = public.weapons.game_metadata_id
	)
);

CREATE POLICY "motives_select_visible"
ON public.motives
FOR SELECT
TO anon, authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.games AS game
		WHERE game.game_metadata_id = public.motives.game_metadata_id
	)
);

CREATE POLICY "clues_select_visible"
ON public.clues
FOR SELECT
TO anon, authenticated
USING (
	EXISTS (
		SELECT 1
		FROM public.games AS game
		WHERE game.game_metadata_id = public.clues.game_metadata_id
	)
);
