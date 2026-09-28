import { z } from "zod";

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
  murder: z.boolean(),
  weapon: z.boolean(),
  motive: z.boolean(),
  location: z.boolean(),
});
export type IAnswerResponse = z.infer<typeof resultResponseSchema>;
