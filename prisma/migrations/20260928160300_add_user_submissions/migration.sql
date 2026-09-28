-- Drop partial table from a failed apply so this migration can run cleanly.
DROP TABLE IF EXISTS "user_submissions";

-- CreateTable
CREATE TABLE "user_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "time_taken" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_submissions_game_id_idx" ON "user_submissions"("game_id");

-- CreateIndex
CREATE INDEX "user_submissions_user_id_game_id_idx" ON "user_submissions"("user_id", "game_id");

-- AddForeignKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS to match the other game tables
ALTER TABLE "user_submissions" ENABLE ROW LEVEL SECURITY;
