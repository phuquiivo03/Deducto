import type {
  Relationship,
  RelationshipStatus,
  Entity,
  EntityType,
} from "@/types/detective";
import type { IGame } from "@/features/game/game.schemas";

const TYPE_ORDER: Record<EntityType, number> = {
  suspect: 0,
  weapon: 1,
  location: 2,
  motive: 3,
};

export function canonicalPair(idA: string, idB: string): [string, string] {
  return idA <= idB ? [idA, idB] : [idB, idA];
}

export function pairRelationshipId(idA: string, idB: string): string {
  const [a, b] = canonicalPair(idA, idB);
  return `pair-${a}-${b}`;
}

export function findRelationshipByPair(
  relationships: Relationship[],
  idA: string,
  idB: string,
): Relationship | undefined {
  const [a, b] = canonicalPair(idA, idB);
  return relationships.find(
    (r) => (r.a === a && r.b === b) || (r.a === b && r.b === a),
  );
}

export function getPairStatus(
  relationships: Relationship[],
  idA: string,
  idB: string,
): RelationshipStatus {
  const rel = findRelationshipByPair(relationships, idA, idB);
  return rel?.status ?? "empty";
}

const STATUS_CYCLE: RelationshipStatus[] = [
  "impossible",
  "unknown",
  "confirmed",
  "empty",
];

export function nextRelationshipStatus(
  current: RelationshipStatus,
): RelationshipStatus {
  const i = STATUS_CYCLE.indexOf(current);
  const next = i === -1 ? 0 : (i + 1) % STATUS_CYCLE.length;
  return STATUS_CYCLE[next];
}

export function sortEntitiesForMatrix(
  entities: Record<string, Entity>,
): Entity[] {
  return Object.values(entities).sort((x, y) => {
    const typeDiff = TYPE_ORDER[x.type] - TYPE_ORDER[y.type];
    if (typeDiff !== 0) return typeDiff;
    return x.name.localeCompare(y.name);
  });
}

/** Cross-type blocks only — no same-type or duplicate A×B / B×A cells */
export const MATRIX_TYPE_PAIRS: [EntityType, EntityType][] = [
  ["suspect", "weapon"],
  ["suspect", "location"],
  ["weapon", "location"],
  ["weapon", "motive"],
  ["location", "motive"],
  ["suspect", "motive"],
];

const MATRIX_BLOCK_TITLES: Record<string, string> = {
  "suspect-weapon": "Suspects × Weapons",
  "suspect-location": "Suspects × Locations",
  "weapon-location": "Weapons × Locations",
  "weapon-motive": "Weapons × Motives",
  "location-motive": "Locations × Motives",
  "suspect-motive": "Suspects × Motives",
};

export function matrixBlockTitle(
  rowType: EntityType,
  colType: EntityType,
): string {
  return MATRIX_BLOCK_TITLES[`${rowType}-${colType}`] ?? "";
}

/**
 * How many confirmed links a solved board has: one true match per
 * row in each cross-type grid, when both sides exist.
 */
export function relationshipCapacity(
  counts: Partial<Record<EntityType, number>>,
): number {
  return MATRIX_TYPE_PAIRS.reduce((sum, [rowType, colType]) => {
    const rows = counts[rowType] ?? 0;
    const cols = counts[colType] ?? 0;
    if (rows <= 0 || cols <= 0) return sum;
    return sum + Math.min(rows, cols);
  }, 0);
}

export function relationshipCapacityForGame(
  game: Pick<IGame, "gameMetadata">,
): number {
  const metadata = game.gameMetadata;
  if (!metadata || typeof metadata === "string") return 0;
  return relationshipCapacity({
    suspect: metadata.suspects.length,
    weapon: metadata.weapons.length,
    location: metadata.locations.length,
    motive: metadata.motives.length,
  });
}

export function entitiesOfType(
  entities: Record<string, Entity>,
  type: EntityType,
): Entity[] {
  return sortEntitiesForMatrix(entities).filter((e) => e.type === type);
}
