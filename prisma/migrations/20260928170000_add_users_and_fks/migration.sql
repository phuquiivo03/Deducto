-- Prisma shadow DB is plain Postgres (no Supabase auth). Skip on real Supabase.
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
		CREATE SCHEMA auth;
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_proc p
		JOIN pg_namespace n ON p.pronamespace = n.oid
		WHERE n.nspname = 'auth' AND p.proname = 'uid'
	) THEN
		EXECUTE $fn$
			CREATE FUNCTION auth.uid()
			RETURNS uuid
			LANGUAGE sql
			STABLE
			AS $body$ SELECT NULL::uuid; $body$;
		$fn$;
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
		CREATE ROLE anon NOLOGIN;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
		CREATE ROLE authenticated NOLOGIN;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
		CREATE ROLE service_role NOLOGIN;
	END IF;
END $$;

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Seed system user for backfill
INSERT INTO "users" (
    "id",
    "name",
    "email",
    "created_at",
    "updated_at"
) VALUES (
    'b1000001-0001-4001-8001-000000000060'::uuid,
    'System',
    'system@deducto.local',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- AlterTable games: creator -> creator_id
ALTER TABLE "games" ADD COLUMN "creator_id" UUID;

UPDATE "games"
SET "creator_id" = 'b1000001-0001-4001-8001-000000000060'::uuid
WHERE "creator_id" IS NULL;

ALTER TABLE "games" ALTER COLUMN "creator_id" SET NOT NULL;

ALTER TABLE "games" DROP COLUMN "creator";

-- CreateIndex
CREATE INDEX "games_creator_id_idx" ON "games"("creator_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Clean invalid submission user ids before uuid FK
DELETE FROM "user_submissions"
WHERE "user_id" !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   OR NOT EXISTS (
       SELECT 1 FROM "users" u WHERE u.id = "user_id"::uuid
   );

ALTER TABLE "user_submissions"
ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS users
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all"
ON "users"
FOR SELECT
USING (true);

CREATE POLICY "users_insert_own"
ON "users"
FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "users_update_own"
ON "users"
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- RLS user_submissions (table already has RLS enabled)
CREATE POLICY "user_submissions_select_own"
ON "user_submissions"
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "user_submissions_insert_own"
ON "user_submissions"
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_submissions TO anon, authenticated, service_role;
