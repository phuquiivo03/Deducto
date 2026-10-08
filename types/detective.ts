import type { PlayerPuzzle } from "@/features/puzzles/types";

export type EntityType = "suspect" | "weapon" | "location" | "motive";

export type RelationshipStatus =
  | "confirmed"
  | "impossible"
  | "unknown"
  | "empty";

export interface Fact {
  ok: boolean;
  text: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  meta: string;
  icon: string;
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
  id: string;

  status: "Mới" | "Đã phân tích" | "Đã dùng";

  text: string;

  entities: string[];

  puzzle?: PlayerPuzzle;
}

export interface Note {
  id: string;

  x: number;
  y: number;

  rot: number;

  text: string;
}

export type Entities = Record<string, Entity>;
