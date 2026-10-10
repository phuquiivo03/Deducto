import { z } from "zod";

import { gameVisibilitySchema } from "@/features/game/game-visibility";
import { puzzleLockRequestSchema } from "@/features/puzzles/lock-request";
import { cluePuzzleSchema } from "@/features/puzzles/schema";

export const gameLevelSchema = z
  .enum(["easy", "medium", "hard"])
  .or(z.string());
export type GameLevel = z.infer<typeof gameLevelSchema>;

export const relationshipStatusSchema = z.enum([
  "confirmed",
  "impossible",
  "unknown",
  "empty",
]);
export type RelationshipStatus = z.infer<typeof relationshipStatusSchema>;

export const handednessSchema = z.enum(["LEFT", "RIGHT"]);
export type Handedness = z.infer<typeof handednessSchema>;

export const clueTypeSchema = z.enum([
  "ATTRIBUTE",
  "RELATION",
  "LOCATION",
  "EXCLUSION",
]);
export type ClueType = z.infer<typeof clueTypeSchema>;

export const clueRelationSchema = z.enum([
  "EQUAL",
  "NOT_EQUAL",
  "REQUIRED",
  "AT",
  "NOT_AT",
  "FOUND_AT",
  "NOT_FOUND_AT",
]);
export type ClueRelation = z.infer<typeof clueRelationSchema>;

export const clueAttributeSchema = z.enum([
  "handedness",
  "hairColor",
  "height",
  "birthday",
  "weight",
  "material",
  "type",
  "weapon",
  "location",
  "motive",
  "found_at",
]);
export type ClueAttribute = z.infer<typeof clueAttributeSchema>;

export const locationAttributesSchema = z
  .object({
    type: z.string().optional(),
    characteristic: z.string().optional(),
  })
  .catchall(z.unknown());
export type ILocationAttributes = z.infer<typeof locationAttributesSchema>;

export const suspectAttributesSchema = z
  .object({
    height: z.number().optional(),
    hairColor: z.string().optional(),
    handedness: handednessSchema.optional(),
    birthday: z.string().optional(),
  })
  .catchall(z.unknown());
export type ISuspectAttributes = z.infer<typeof suspectAttributesSchema>;

export const weaponAttributesSchema = z
  .object({
    weight: z.enum(["LIGHT", "MEDIUM", "HEAVY"]).or(z.string()).optional(),
    material: z.string().optional(),
    type: z.string().optional(),
  })
  .catchall(z.unknown());
export type IWeaponAttributes = z.infer<typeof weaponAttributesSchema>;

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string(),
  attributes: locationAttributesSchema.optional(),
});
export type ILocation = z.infer<typeof locationSchema>;

export const suspectSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
  attributes: suspectAttributesSchema.optional(),
});
export type ISuspect = z.infer<typeof suspectSchema>;

export const weaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string(),
  attributes: weaponAttributesSchema.optional(),
});
export type IWeapon = z.infer<typeof weaponSchema>;

export const motiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string(),
});
export type IMotive = z.infer<typeof motiveSchema>;

export const clueSchema = z.object({
  id: z.string(),
  type: clueTypeSchema,
  attribute: clueAttributeSchema,
  value: z.string(),
  relation: clueRelationSchema,
  location_id: z.string().optional(),
  suspect_id: z.string().optional(),
  weapon_id: z.string().optional(),
  puzzle: cluePuzzleSchema.optional(),
});
export type IClue = z.infer<typeof clueSchema>;

export const resultAnswerSchema = z.object({
  murder_id: z.string(),
  weapon_id: z.string(),
  motive_id: z.string(),
  location_id: z.string(),
});
export type IAnswerAnswer = z.infer<typeof resultAnswerSchema>;

export const answerSchema = z.object({
  id: z.string().optional(),
  game_id: z.string(),
  user_id: z.string(),
  time_taken: z.number(),
  answer: resultAnswerSchema,
});
export type IAnswer = z.infer<typeof answerSchema>;

export const gameMetadataSchema = z.object({
  id: z.string(),
  suspects: z.array(suspectSchema),
  locations: z.array(locationSchema),
  weapons: z.array(weaponSchema),
  motives: z.array(motiveSchema),
  clues: z.array(clueSchema),
});
export type IGameMetadata = z.infer<typeof gameMetadataSchema>;

export const gameSchema = z.object({
  id: z.string(),
  creator: z.string(),
  gameMetadata: z.union([z.string(), gameMetadataSchema]),
  title: z.string(),
  description: z.string(),
  banner: z.string(),
  level: gameLevelSchema,
  visibility: gameVisibilitySchema,
  created_at: z.string(),
});
export type IGame = z.infer<typeof gameSchema>;

export const listedSchema = z.object({
  id: z.string(),
  game_id: z.string(),
  price: z.number(),
  sold: z.number(),
});
export type IListed = z.infer<typeof listedSchema>;

export const relationshipSchema = z.object({
  id: z.string(),
  a: z.string(),
  b: z.string(),
  label: z.string(),
  status: relationshipStatusSchema,
  reason: z.string(),
});
export type IRelationship = z.infer<typeof relationshipSchema>;

export const resultResponseSchema = z.object({
  solved: z.boolean(),
  alreadySolved: z.boolean(),
  attemptsUsed: z.number().int().nonnegative(),
  attemptsRemaining: z.number().int().nonnegative(),
  attemptLimit: z.number().int().positive(),
});
export type IAnswerResponse = z.infer<typeof resultResponseSchema>;

export const gameLevelStrictSchema = z.enum(["easy", "medium", "hard"]);
export type GameLevelStrict = z.infer<typeof gameLevelStrictSchema>;

export const generatedGameSchema = gameSchema.extend({
  gameMetadata: gameMetadataSchema,
});
export type IGeneratedGame = z.infer<typeof generatedGameSchema>;

export const generatedCaseSchema = z.object({
  game: generatedGameSchema,
  result: resultAnswerSchema,
});
export type IGeneratedCase = z.infer<typeof generatedCaseSchema>;

export const generateRequestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  level: gameLevelStrictSchema,
});
export type IGenerateRequest = z.infer<typeof generateRequestSchema>;

const LEVEL_ENTITY_COUNT: Record<GameLevelStrict, number> = {
  easy: 3,
  medium: 4,
  hard: 5,
};

export function entityCountForLevel(level: GameLevelStrict): number {
  return LEVEL_ENTITY_COUNT[level];
}

export const aiCaseDraftSchema = z.object({
  title: z.string().min(3).max(60),
  description: z.string().min(1).max(320),
  banner: z.string().min(1),
  suspects: z.array(suspectSchema),
  weapons: z.array(weaponSchema),
  locations: z.array(locationSchema),
  motives: z.array(motiveSchema),
});

export type IAiCaseDraft = z.infer<typeof aiCaseDraftSchema>;

export function parseAiCaseDraft(
  data: unknown,
  level: GameLevelStrict,
):
  | { success: true; data: IAiCaseDraft }
  | { success: false; error: z.ZodError } {
  const parsed = aiCaseDraftSchema.safeParse(data);
  if (!parsed.success) {
    return parsed;
  }
  const n = entityCountForLevel(level);
  const counts = [
    parsed.data.suspects.length,
    parsed.data.weapons.length,
    parsed.data.locations.length,
    parsed.data.motives.length,
  ];
  if (counts.some((c) => c !== n)) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          message: `Each entity group must have exactly ${n} items for level ${level}`,
          path: [],
        },
      ]),
    };
  }
  const ids = [
    ...parsed.data.suspects.map((s) => s.id),
    ...parsed.data.weapons.map((w) => w.id),
    ...parsed.data.locations.map((l) => l.id),
    ...parsed.data.motives.map((m) => m.id),
  ];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      return {
        success: false,
        error: new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: `Duplicate entity id: ${id}`,
            path: [],
          },
        ]),
      };
    }
    seen.add(id);
  }
  return parsed;
}

const createClueSchema = clueSchema.omit({ puzzle: true });

const createGameMetadataSchema = gameMetadataSchema.extend({
  clues: z.array(createClueSchema),
});

export const createGameInputSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    banner: z.string().min(1),
    level: gameLevelStrictSchema,
    gameMetadata: createGameMetadataSchema,
    result: resultAnswerSchema,
    locks: z.array(puzzleLockRequestSchema).max(64).optional(),
  })
  .superRefine((data, ctx) => {
    const meta = data.gameMetadata;
    const suspectIds = new Set(meta.suspects.map((s) => s.id));
    const weaponIds = new Set(meta.weapons.map((w) => w.id));
    const locationIds = new Set(meta.locations.map((l) => l.id));
    const motiveIds = new Set(meta.motives.map((m) => m.id));

    const allIds: string[] = [
      meta.id,
      ...meta.suspects.map((s) => s.id),
      ...meta.weapons.map((w) => w.id),
      ...meta.locations.map((l) => l.id),
      ...meta.motives.map((m) => m.id),
      ...meta.clues.map((c) => c.id),
    ];
    const seen = new Set<string>();
    for (const id of allIds) {
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate id: ${id}`,
          path: ["gameMetadata"],
        });
      }
      seen.add(id);
    }

    if (!suspectIds.has(data.result.murder_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "murder_id must reference a suspect",
        path: ["result", "murder_id"],
      });
    }
    if (!weaponIds.has(data.result.weapon_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "weapon_id must reference a weapon",
        path: ["result", "weapon_id"],
      });
    }
    if (!locationIds.has(data.result.location_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "location_id must reference a location",
        path: ["result", "location_id"],
      });
    }
    if (!motiveIds.has(data.result.motive_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "motive_id must reference a motive",
        path: ["result", "motive_id"],
      });
    }

    meta.clues.forEach((clue, index) => {
      if (clue.suspect_id && !suspectIds.has(clue.suspect_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid suspect_id",
          path: ["gameMetadata", "clues", index, "suspect_id"],
        });
      }
      if (clue.weapon_id && !weaponIds.has(clue.weapon_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid weapon_id",
          path: ["gameMetadata", "clues", index, "weapon_id"],
        });
      }
      if (clue.location_id && !locationIds.has(clue.location_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid location_id",
          path: ["gameMetadata", "clues", index, "location_id"],
        });
      }
      if (!clue.value.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Clue value cannot be empty",
          path: ["gameMetadata", "clues", index, "value"],
        });
      }
    });

    const checkNonEmpty = (
      items: { id: string; name: string }[],
      kind: string,
      basePath: (string | number)[],
    ) => {
      items.forEach((item, index) => {
        if (!item.name.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${kind} name cannot be empty`,
            path: [...basePath, index, "name"],
          });
        }
      });
    };
    checkNonEmpty(meta.suspects, "Suspect", ["gameMetadata", "suspects"]);
    checkNonEmpty(meta.weapons, "Weapon", ["gameMetadata", "weapons"]);
    checkNonEmpty(meta.locations, "Location", ["gameMetadata", "locations"]);
    checkNonEmpty(meta.motives, "Motive", ["gameMetadata", "motives"]);
  });
export type ICreateGameInput = z.infer<typeof createGameInputSchema>;
export const shortGameShema = gameSchema.pick({
  id: true,
  title: true,
  description: true,
  banner: true,
  level: true,
  visibility: true,
  created_at: true,
});
export type IShortGame = z.infer<typeof shortGameShema> & {
  creator: {
    name: string;
    avatar: string;
  } | null;
};
