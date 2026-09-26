-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ClueType" AS ENUM ('ATTRIBUTE', 'RELATION', 'LOCATION', 'EXCLUSION');

-- CreateEnum
CREATE TYPE "ClueRelation" AS ENUM ('EQUAL', 'NOT_EQUAL', 'REQUIRED', 'AT', 'NOT_AT', 'FOUND_AT', 'NOT_FOUND_AT');

-- CreateEnum
CREATE TYPE "ClueAttribute" AS ENUM ('handedness', 'hairColor', 'height', 'birthday', 'weight', 'material', 'type', 'weapon', 'location', 'motive', 'found_at');

-- CreateTable
CREATE TABLE "game_metadata" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "game_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "banner" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game_metadata_id" UUID NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suspects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_metadata_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "description" TEXT,
    "attributes" JSONB,

    CONSTRAINT "suspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_metadata_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "attributes" JSONB,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_metadata_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "attributes" JSONB,

    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motives" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_metadata_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,

    CONSTRAINT "motives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_metadata_id" UUID NOT NULL,
    "type" "ClueType" NOT NULL,
    "attribute" "ClueAttribute" NOT NULL,
    "value" TEXT NOT NULL,
    "relation" "ClueRelation" NOT NULL,
    "suspect_id" UUID,
    "location_id" UUID,
    "weapon_id" UUID,

    CONSTRAINT "clues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "murder_id" UUID NOT NULL,
    "weapon_id" UUID NOT NULL,
    "motive_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_game_metadata_id_key" ON "games"("game_metadata_id");

-- CreateIndex
CREATE UNIQUE INDEX "results_game_id_key" ON "results"("game_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_game_metadata_id_fkey" FOREIGN KEY ("game_metadata_id") REFERENCES "game_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suspects" ADD CONSTRAINT "suspects_game_metadata_id_fkey" FOREIGN KEY ("game_metadata_id") REFERENCES "game_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_game_metadata_id_fkey" FOREIGN KEY ("game_metadata_id") REFERENCES "game_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weapons" ADD CONSTRAINT "weapons_game_metadata_id_fkey" FOREIGN KEY ("game_metadata_id") REFERENCES "game_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motives" ADD CONSTRAINT "motives_game_metadata_id_fkey" FOREIGN KEY ("game_metadata_id") REFERENCES "game_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clues" ADD CONSTRAINT "clues_game_metadata_id_fkey" FOREIGN KEY ("game_metadata_id") REFERENCES "game_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clues" ADD CONSTRAINT "clues_suspect_id_fkey" FOREIGN KEY ("suspect_id") REFERENCES "suspects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clues" ADD CONSTRAINT "clues_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clues" ADD CONSTRAINT "clues_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_murder_id_fkey" FOREIGN KEY ("murder_id") REFERENCES "suspects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_motive_id_fkey" FOREIGN KEY ("motive_id") REFERENCES "motives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
