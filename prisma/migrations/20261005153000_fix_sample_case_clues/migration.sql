-- Rewrite the seeded homepage case so the clues force one tuple:
-- Lady Violet, Silver Letter Opener, Dining Room, Greed.
-- Skipped when that case has not been seeded yet.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "suspects"
    WHERE "id" = 'b1000001-0001-4001-8001-000000000011'::uuid
  ) THEN
    UPDATE "games"
    SET "description" = 'A priceless sapphire disappeared during a private dinner. Four guests were present, each in a different room with a different object and a different motive.'
    WHERE "id" = 'b1000001-0001-4001-8001-000000000001'::uuid;

    UPDATE "suspects"
    SET "avatar" = '👩‍⚕️'
    WHERE "id" = 'b1000001-0001-4001-8001-000000000013'::uuid;

    UPDATE "weapons"
    SET "description" = 'A slim silver blade used to open letters.'
    WHERE "id" = 'b1000001-0001-4001-8001-000000000021'::uuid;

    UPDATE "weapons"
    SET "description" = 'A decorative crystal dagger with a slim blade.'
    WHERE "id" = 'b1000001-0001-4001-8001-000000000022'::uuid;

    UPDATE "weapons"
    SET "description" = 'A heavy brass candlestick with a wide base.'
    WHERE "id" = 'b1000001-0001-4001-8001-000000000023'::uuid;

    UPDATE "weapons"
    SET "description" = 'A small folding knife with a worn handle.'
    WHERE "id" = 'b1000001-0001-4001-8001-000000000024'::uuid;

    DELETE FROM "clues"
    WHERE "game_metadata_id" = 'b1000001-0001-4001-8001-000000000002'::uuid;

    INSERT INTO "clues" (
      "id",
      "game_metadata_id",
      "type",
      "attribute",
      "value",
      "relation",
      "suspect_id",
      "location_id",
      "weapon_id"
    ) VALUES
      (
        'b1000001-0001-4001-8001-000000000051'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'LOCATION',
        'location',
        'Library',
        'EQUAL',
        'b1000001-0001-4001-8001-000000000012'::uuid,
        'b1000001-0001-4001-8001-000000000032'::uuid,
        NULL
      ),
      (
        'b1000001-0001-4001-8001-000000000052'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'LOCATION',
        'location',
        'Garden',
        'EQUAL',
        'b1000001-0001-4001-8001-000000000013'::uuid,
        'b1000001-0001-4001-8001-000000000033'::uuid,
        NULL
      ),
      (
        'b1000001-0001-4001-8001-000000000053'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'RELATION',
        'location',
        'Study',
        'AT',
        'b1000001-0001-4001-8001-000000000014'::uuid,
        'b1000001-0001-4001-8001-000000000034'::uuid,
        NULL
      ),
      (
        'b1000001-0001-4001-8001-000000000054'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'LOCATION',
        'found_at',
        'Library',
        'EQUAL',
        NULL,
        'b1000001-0001-4001-8001-000000000032'::uuid,
        'b1000001-0001-4001-8001-000000000023'::uuid
      ),
      (
        'b1000001-0001-4001-8001-000000000055'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'RELATION',
        'found_at',
        'Garden',
        'FOUND_AT',
        NULL,
        'b1000001-0001-4001-8001-000000000033'::uuid,
        'b1000001-0001-4001-8001-000000000024'::uuid
      ),
      (
        'b1000001-0001-4001-8001-000000000056'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'EXCLUSION',
        'weapon',
        'Silver Letter Opener',
        'NOT_EQUAL',
        'b1000001-0001-4001-8001-000000000014'::uuid,
        NULL,
        'b1000001-0001-4001-8001-000000000021'::uuid
      ),
      (
        'b1000001-0001-4001-8001-000000000061'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'EXCLUSION',
        'motive',
        'Revenge',
        'NOT_EQUAL',
        'b1000001-0001-4001-8001-000000000011'::uuid,
        NULL,
        NULL
      ),
      (
        'b1000001-0001-4001-8001-000000000062'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'EXCLUSION',
        'motive',
        'Jealousy',
        'NOT_EQUAL',
        'b1000001-0001-4001-8001-000000000011'::uuid,
        NULL,
        NULL
      ),
      (
        'b1000001-0001-4001-8001-000000000063'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'EXCLUSION',
        'motive',
        'Blackmail',
        'NOT_EQUAL',
        'b1000001-0001-4001-8001-000000000011'::uuid,
        NULL,
        NULL
      ),
      (
        'b1000001-0001-4001-8001-000000000064'::uuid,
        'b1000001-0001-4001-8001-000000000002'::uuid,
        'ATTRIBUTE',
        'location',
        'Dining Room',
        'REQUIRED',
        NULL,
        NULL,
        NULL
      );
  END IF;
END $$;
