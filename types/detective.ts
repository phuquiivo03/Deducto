export type EntityType = "suspect" | "weapon" | "location";

export type RelationshipStatus = "confirmed" | "impossible" | "unknown";

export interface Fact {
  ok: boolean;
  text: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  meta: string;

  x: number;
  y: number;

  facts: Fact[];
}

export interface Relationship {
  id: string;

  a: string;
  b: string;

  label: string;

  status: RelationshipStatus;

  reason: string;
}

export interface Clue {
  id: number;

  status: "new" | "analyzed" | "used";

  text: string;

  entities: string[];
}

export interface Note {
  id: string;

  x: number;
  y: number;

  rot: number;

  text: string;
}
