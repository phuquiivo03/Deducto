import {
  Relationship,
  RelationshipStatus,
  Entity,
  EntityType,
} from "@/types/detective";

const TYPE_ORDER: Record<EntityType, number> = {
  suspect: 0,
  weapon: 1,
  location: 2,
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
  return rel?.status ?? "unknown";
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
];

const MATRIX_BLOCK_TITLES: Record<string, string> = {
  "suspect-weapon": "Suspects × Weapons",
  "suspect-location": "Suspects × Locations",
  "weapon-location": "Weapons × Locations",
};

export function matrixBlockTitle(
  rowType: EntityType,
  colType: EntityType,
): string {
  return MATRIX_BLOCK_TITLES[`${rowType}-${colType}`] ?? "";
}

export function entitiesOfType(
  entities: Record<string, Entity>,
  type: EntityType,
): Entity[] {
  return sortEntitiesForMatrix(entities).filter((e) => e.type === type);
}
