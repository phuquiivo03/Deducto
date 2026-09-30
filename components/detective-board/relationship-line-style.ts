import { RelationshipStatus } from "@/types/detective";

export const ENTITY_ANCHOR_OFFSET = { x: 98, y: 50 } as const;

export function entityAnchor(entity: { x: number; y: number }) {
  return {
    x: entity.x + ENTITY_ANCHOR_OFFSET.x,
    y: entity.y + ENTITY_ANCHOR_OFFSET.y,
  };
}

export const STATUS_STYLE: Record<
  RelationshipStatus,
  { stroke: string; dash?: string; label: string }
> = {
  confirmed: { stroke: "#2d5da1", label: "Confirmed" },
  impossible: { stroke: "#ff4d4d", label: "Impossible" },
  unknown: { stroke: "#2d2d2d", dash: "4 4", label: "Unknown" },
  empty: { stroke: "#e5e0d8", dash: "2 6", label: "Empty (hidden)" },
};

export const STATUS_OPTIONS: RelationshipStatus[] = [
  "confirmed",
  "impossible",
  "unknown",
  "empty",
];
