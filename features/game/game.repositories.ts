import { randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { askBedrock } from "@/infrastructure/ai/bedrock";
import { createServiceClient } from "@/infrastructure/supabase/service";
import { createClient } from "@/infrastructure/supabase/server";
import { prisma } from "@/lib/prisma";
import type {
  IAnswerAnswer,
  ICreateGameInput,
  IGame,
  IShortGame,
} from "./game.schemas";
import {
  mapGameFromDb,
  mapShortGameFromDb,
  type GameDbRow,
  type ShortGameDbRow,
} from "./game.mapper";

const SHORT_GAME_COLUMNS =
  "id, creator_id, title, description, banner, level, created_at" as const;

function toInputJson(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value as Prisma.InputJsonValue;
}

const getGame = async (id: string): Promise<IGame | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(
      "*, game_metadata(*, clues(*), locations(*), suspects(*), weapons(*), motives(*))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getGame:", error.message);
    return null;
  }
  if (!data) {
    return null;
  }
  return mapGameFromDb(data as GameDbRow);
};

const getResult = async (id: string): Promise<IAnswerAnswer | null> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("game_id", id)
    .maybeSingle();
  if (error) {
    console.error("getResult:", error.message);
    return null;
  }
  return data;
};

const askAi = async (prompt: string): Promise<string> => {
  return askBedrock(prompt);
};

const createGame = async (
  input: ICreateGameInput,
  creatorId: string,
): Promise<string> => {
  const meta = input.gameMetadata;
  const idMap = new Map<string, string>();

  const remap = (oldId: string): string => {
    const existing = idMap.get(oldId);
    if (existing) {
      return existing;
    }
    const next = randomUUID();
    idMap.set(oldId, next);
    return next;
  };

  remap(meta.id);
  for (const s of meta.suspects) {
    remap(s.id);
  }
  for (const w of meta.weapons) {
    remap(w.id);
  }
  for (const l of meta.locations) {
    remap(l.id);
  }
  for (const m of meta.motives) {
    remap(m.id);
  }
  for (const c of meta.clues) {
    remap(c.id);
  }

  const metadataId = remap(meta.id);
  const gameId = randomUUID();

  await prisma.$transaction(async (tx) => {
    await tx.gameMetadata.create({
      data: {
        id: metadataId,
        suspects: {
          create: meta.suspects.map((suspect) => ({
            id: remap(suspect.id),
            name: suspect.name,
            avatar: suspect.avatar,
            age: suspect.age,
            gender: suspect.gender,
            description: suspect.description,
            attributes: toInputJson(suspect.attributes),
          })),
        },
        locations: {
          create: meta.locations.map((location) => ({
            id: remap(location.id),
            name: location.name,
            description: location.description,
            icon: location.icon,
            attributes: toInputJson(location.attributes),
          })),
        },
        weapons: {
          create: meta.weapons.map((weapon) => ({
            id: remap(weapon.id),
            name: weapon.name,
            description: weapon.description,
            icon: weapon.icon,
            attributes: toInputJson(weapon.attributes),
          })),
        },
        motives: {
          create: meta.motives.map((motive) => ({
            id: remap(motive.id),
            name: motive.name,
            description: motive.description,
            icon: motive.icon,
          })),
        },
        clues: {
          create: meta.clues.map((clue) => ({
            id: remap(clue.id),
            type: clue.type,
            attribute: clue.attribute,
            value: clue.value,
            relation: clue.relation,
            suspectId: clue.suspect_id ? remap(clue.suspect_id) : undefined,
            locationId: clue.location_id ? remap(clue.location_id) : undefined,
            weaponId: clue.weapon_id ? remap(clue.weapon_id) : undefined,
          })),
        },
      },
    });

    await tx.game.create({
      data: {
        id: gameId,
        creatorId,
        title: input.title,
        description: input.description,
        banner: input.banner,
        level: input.level,
        gameMetadataId: metadataId,
      },
    });

    await tx.result.create({
      data: {
        gameId,
        murderId: remap(input.result.murder_id),
        weaponId: remap(input.result.weapon_id),
        motiveId: remap(input.result.motive_id),
        locationId: remap(input.result.location_id),
      },
    });
  });

  return gameId;
};

const findPublic = async (): Promise<IShortGame[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(SHORT_GAME_COLUMNS);
  if (error) {
    console.error("findPublic:", error.message);
    return [];
  }
  return (data as ShortGameDbRow[]).map(mapShortGameFromDb);
};

const findByUserId = async (userId: string): Promise<IShortGame[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(`${SHORT_GAME_COLUMNS}`)
    .eq("creator_id", userId);
  if (error) {
    console.error("findByUserId:", error.message);
    return [];
  }
  return (data as ShortGameDbRow[]).map(mapShortGameFromDb);
};

const findResolved = async (id: string): Promise<IShortGame[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_submissions")
    .select(`game_id(${SHORT_GAME_COLUMNS},creator_id(*))`)
    .eq("user_id", id);
  if (error) {
    console.error("findResolved:", error.message);
    return [];
  }
  return data
    .map((submission) => submission.game_id)
    .flat()
    .filter((row): row is ShortGameDbRow => row !== null)
    .map(mapShortGameFromDb);
};

const gameRepositories = {
  getGame,
  getResult,
  askAi,
  createGame,
  findPublic,
  findByUserId,
  findResolved,
};
export default gameRepositories;
