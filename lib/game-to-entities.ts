import { formatAttributeValue } from "@/lib/attribute-format";
import {
  IGame,
  IGameMetadata,
  ILocation,
  IMotive,
  ISuspect,
  IWeapon,
} from "@/types/apiDto";
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

function factsFromDescriptionAndAttributes(
  description: string | undefined,
  attributes: Record<string, unknown> | undefined,
): Fact[] {
  const facts: Fact[] = [];

  // if (description?.trim()) {
  //   facts.push({ ok: true, text: description.trim() });
  // }

  if (attributes) {
    for (const [key, raw] of Object.entries(attributes)) {
      if (raw === undefined || raw === null || raw === "") continue;
      const value = String(raw);
      facts.push({
        ok: true,
        text: formatAttributeValue(key, value),
      });
    }
  }

  return facts;
}

function handednessLabel(value: string): string {
  return formatAttributeValue("handedness", value);
}

function buildSuspectMeta(suspect: ISuspect): string {
  const parts: string[] = [];

  if (suspect.description?.trim()) {
    parts.push(suspect.description.trim());
  }

  const handedness = suspect.attributes?.handedness;
  if (typeof handedness === "string") {
    parts.push(handednessLabel(handedness));
  }

  return parts.join(" · ") || suspect.name;
}

function buildWeaponMeta(weapon: IWeapon): string {
  const attrs = weapon.attributes;
  if (!attrs) return weapon.description?.trim() || weapon.name;

  const parts: string[] = [];

  if (typeof attrs.material === "string" && attrs.material) {
    parts.push(attrs.material);
  }
  if (typeof attrs.type === "string" && attrs.type) {
    parts.push(attrs.type);
  }
  if (typeof attrs.weight === "string" && attrs.weight) {
    parts.push(attrs.weight.toLowerCase());
  }

  return parts.join(" · ") || weapon.description?.trim() || weapon.name;
}

function buildLocationMeta(location: ILocation): string {
  const attrs = location.attributes;
  const characteristic = attrs?.characteristic;
  if (typeof characteristic === "string" && characteristic) {
    return characteristic;
  }
  const type = attrs?.type;
  if (typeof type === "string" && type) {
    return type;
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
    x,
    y,
    facts: factsFromDescriptionAndAttributes(
      suspect.description,
      suspect.attributes as Record<string, unknown> | undefined,
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
    x,
    y,
    facts: factsFromDescriptionAndAttributes(
      weapon.description,
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
    x,
    y,
    facts: factsFromDescriptionAndAttributes(
      location.description,
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
    x,
    y,
    facts: factsFromDescriptionAndAttributes(motive.description, undefined),
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
