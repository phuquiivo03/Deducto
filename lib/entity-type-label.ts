import type { EntityType } from "@/types/detective";

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  suspect: "Suspect",
  weapon: "Weapon",
  location: "Location",
  motive: "Motive",
};

/** Card label for a board entity. Motives are not locations. */
export function entityTypeLabel(type: EntityType): string {
  return ENTITY_TYPE_LABELS[type];
}
