-- DropIndex
DROP INDEX "user_submissions_user_id_game_id_idx";

-- AlterTable
ALTER TABLE "user_submissions" DROP CONSTRAINT "user_submissions_pkey";

ALTER TABLE "user_submissions" DROP COLUMN "id";

ALTER TABLE "user_submissions" DROP COLUMN "time_taken",
ADD COLUMN "time_taken" INTEGER NOT NULL;

-- AddPrimaryKey
ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_pkey" PRIMARY KEY ("user_id", "game_id");
