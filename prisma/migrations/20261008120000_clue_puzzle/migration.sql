-- Optional presentation wrapper for a locked clue.
-- The solver still reads the structured clue columns.
ALTER TABLE "clues" ADD COLUMN "puzzle" JSONB;
