-- Recorded accusations for /api/game/[id]/result.
-- solved is the whole tuple only. There is no per-field score.
-- The insert cap (5) must match ACCUSATION_ATTEMPT_LIMIT
-- in features/game/accusation-decision.ts.

CREATE TABLE "accusation_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "murder_id" UUID NOT NULL,
    "weapon_id" UUID NOT NULL,
    "motive_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "solved" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accusation_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "accusation_attempts_user_id_game_id_idx"
ON "accusation_attempts"("user_id", "game_id");

CREATE INDEX "accusation_attempts_game_id_idx"
ON "accusation_attempts"("game_id");

ALTER TABLE "accusation_attempts"
ADD CONSTRAINT "accusation_attempts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accusation_attempts"
ADD CONSTRAINT "accusation_attempts_game_id_fkey"
FOREIGN KEY ("game_id") REFERENCES "games"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accusation_attempts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accusation_attempts_select_own"
ON "accusation_attempts"
FOR SELECT
TO authenticated
USING ("user_id" = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.accusation_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.accusation_attempts TO authenticated;
GRANT ALL ON TABLE public.accusation_attempts TO service_role;

COMMENT ON TABLE public.accusation_attempts IS
  'One row per recorded accusation. solved means the whole tuple matched.';

-- Backstop if the application check is skipped. Same lock key as the
-- repository: lowercase user uuid, colon, lowercase game uuid.
CREATE FUNCTION public.enforce_accusation_attempt_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      NEW.user_id::text || ':' || NEW.game_id::text,
      0::bigint
    )
  );

  SELECT count(*)::integer INTO attempt_count
  FROM public.accusation_attempts
  WHERE user_id = NEW.user_id
    AND game_id = NEW.game_id;

  IF attempt_count >= 5 THEN
    RAISE EXCEPTION 'accusation_attempt_limit'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_accusation_attempt_limit()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enforce_accusation_attempt_limit()
TO service_role;

CREATE TRIGGER "accusation_attempts_limit"
BEFORE INSERT ON "accusation_attempts"
FOR EACH ROW
EXECUTE FUNCTION public.enforce_accusation_attempt_limit();
