import {
  IGame,
  IGameMetadata,
  ILocation,
  IMotive,
  ISuspect,
  IWeapon,
} from "@/features/game/game.schemas";
import { attributeLabel, traitPhrases } from "@/lib/attribute-rules";
import { Entities, Entity, Fact } from "@/types/detective";

const BOARD_MIN = 50;
const BOARD_MAX = 1100;

function assertMetadata(game: IGame): IGameMetadata {
  if (typeof game.gameMetadata === "string") {
    throw new Error(
      "game_metadata must be populated on IGame before converting to entities",
    );
  }
  return game.gameMetadata;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoardPosition(): { x: number; y: number } {
  return {
    x: randomInt(BOARD_MIN, BOARD_MAX),
    y: randomInt(BOARD_MIN, BOARD_MAX),
  };
}

const FACT_ORDER = [
  "handedness",
  "height",
  "gender",
  "hairColor",
  "birthday",
  "weight",
  "type",
  "material",
  "characteristic",
];

function attributeFact(key: string, raw: unknown): Fact | null {
  const value =
    typeof raw === "number" && Number.isFinite(raw)
      ? String(raw)
      : typeof raw === "string"
        ? raw.trim()
        : "";
  if (!value) return null;
  return {
    ok: true,
    text: `${attributeLabel(key)}: ${traitPhrases(key, value).yes}`,
  };
}

function factsFromAttributes(
  attributes: Record<string, unknown> | undefined,
  extra: { key: string; value: unknown }[] = [],
): Fact[] {
  const bag: Record<string, unknown> = { ...(attributes ?? {}) };
  for (const item of extra) {
    if (bag[item.key] == null || bag[item.key] === "") {
      bag[item.key] = item.value;
    }
  }
  const keys = [
    ...FACT_ORDER.filter((key) => key in bag),
    ...Object.keys(bag).filter((key) => !FACT_ORDER.includes(key)),
  ];
  return keys.flatMap((key) => {
    const fact = attributeFact(key, bag[key]);
    return fact ? [fact] : [];
  });
}

function phrase(attribute: string, value: string): string {
  return traitPhrases(attribute, value).yes;
}

function buildSuspectMeta(suspect: ISuspect): string {
  const parts: string[] = [];

  if (suspect.description?.trim()) {
    parts.push(suspect.description.trim());
  }

  const handedness = suspect.attributes?.handedness;
  if (typeof handedness === "string" && handedness.trim()) {
    parts.push(phrase("handedness", handedness));
  }

  return parts.join(" · ") || suspect.name;
}

function buildWeaponMeta(weapon: IWeapon): string {
  const attrs = weapon.attributes;
  if (!attrs) return weapon.description?.trim() || weapon.name;

  const parts: string[] = [];

  if (typeof attrs.material === "string" && attrs.material) {
    parts.push(phrase("material", attrs.material));
  }
  if (typeof attrs.type === "string" && attrs.type) {
    parts.push(phrase("type", attrs.type));
  }
  if (typeof attrs.weight === "string" && attrs.weight) {
    parts.push(phrase("weight", attrs.weight));
  }

  return parts.join(" · ") || weapon.description?.trim() || weapon.name;
}

function buildLocationMeta(location: ILocation): string {
  const attrs = location.attributes;
  const characteristic = attrs?.characteristic;
  if (typeof characteristic === "string" && characteristic) {
    return phrase("characteristic", characteristic);
  }
  const type = attrs?.type;
  if (typeof type === "string" && type) {
    return phrase("type", type);
  }
  return location.description?.trim() || location.name;
}

function buildMotiveMeta(motive: IMotive): string {
  return motive.description?.trim() || motive.name;
}

function mapSuspect(suspect: ISuspect): Entity {
  const { x, y } = randomBoardPosition();
  return {
    id: suspect.id,
    type: "suspect",
    name: suspect.name,
    meta: buildSuspectMeta(suspect),
    icon: suspect.avatar ?? "🧑",
    x,
    y,
    facts: factsFromAttributes(
      suspect.attributes as Record<string, unknown> | undefined,
      [{ key: "gender", value: suspect.gender }],
    ),
  };
}

function mapWeapon(weapon: IWeapon): Entity {
  const { x, y } = randomBoardPosition();
  return {
    id: weapon.id,
    type: "weapon",
    name: weapon.name,
    meta: buildWeaponMeta(weapon),
    icon: weapon.icon ?? "🔪",
    x,
    y,
    facts: factsFromAttributes(
      weapon.attributes as Record<string, unknown> | undefined,
    ),
  };
}

function mapLocation(location: ILocation): Entity {
  const { x, y } = randomBoardPosition();
  return {
    id: location.id,
    type: "location",
    name: location.name,
    meta: buildLocationMeta(location),
    icon: location.icon ?? "🌳",
    x,
    y,
    facts: factsFromAttributes(
      location.attributes as Record<string, unknown> | undefined,
    ),
  };
}

function mapMotive(motive: IMotive): Entity {
  const { x, y } = randomBoardPosition();
  return {
    id: motive.id,
    type: "motive",
    name: motive.name,
    meta: buildMotiveMeta(motive),
    icon: motive.icon ?? "🔪",
    x,
    y,
    facts: factsFromAttributes(undefined),
  };
}

/**
 * Convert backend game payload into board entities keyed by entity id.
 */
export function gameToEntities(game: IGame): Entities {
  const metadata = assertMetadata(game);
  const entities: Entities = {};
  for (const suspect of metadata.suspects) {
    entities[suspect.id] = mapSuspect(suspect);
  }
  for (const weapon of metadata.weapons) {
    entities[weapon.id] = mapWeapon(weapon);
  }
  for (const location of metadata.locations) {
    entities[location.id] = mapLocation(location);
  }
  for (const motive of metadata.motives) {
    entities[motive.id] = mapMotive(motive);
  }

  return entities;
}
