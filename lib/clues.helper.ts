import {
  formatAttributeName,
  formatAttributeValue,
} from "@/lib/attribute-format";
import {
  IClue,
  IGameMetadata,
  ILocation,
  ISuspect,
  IWeapon,
  IMotive,
  IGame,
} from "@/features/game/game.schemas";
import { Clue } from "@/types/detective";

type EntityType = "suspect" | "weapon" | "location" | "motive";

const getEntityName = (
  id: string | undefined,
  type: EntityType,
  metadata: IGameMetadata,
): string => {
  if (!id) return "Unknown";

  const collections = {
    suspect: metadata.suspects,
    weapon: metadata.weapons,
    location: metadata.locations,
    motive: metadata.motives,
  };

  return collections[type].find((item) => item.id === id)?.name ?? "Unknown";
};

const getSuspect = (
  id: string | undefined,
  metadata: IGameMetadata,
): ISuspect | undefined => {
  if (!id) return undefined;
  return metadata.suspects.find((item) => item.id === id);
};

const getWeapon = (
  id: string | undefined,
  metadata: IGameMetadata,
): IWeapon | undefined => {
  if (!id) return undefined;
  return metadata.weapons.find((item) => item.id === id);
};

const getLocation = (
  id: string | undefined,
  metadata: IGameMetadata,
): ILocation | undefined => {
  if (!id) return undefined;
  return metadata.locations.find((item) => item.id === id);
};

const getMotive = (
  id: string | undefined,
  metadata: IGameMetadata,
): IMotive | undefined => {
  if (!id) return undefined;
  return metadata.motives.find((item) => item.id === id);
};

/**
 * Convert a clue into a human-readable sentence.
 */
export const clueToText = (clue: IClue, metadata: IGameMetadata): string => {
  const suspect = getSuspect(clue.suspect_id, metadata);
  const weapon = getWeapon(clue.weapon_id, metadata);
  const location = getLocation(clue.location_id, metadata);

  switch (clue.type) {
    /**
     * ---------------------------------------------------------
     * ATTRIBUTE
     * ---------------------------------------------------------
     *
     * Example:
     * Lady Violet is right-handed.
     *
     * Or:
     * The Crystal Dagger is heavy.
     */
    case "ATTRIBUTE": {
      if (suspect) {
        const formattedValue = formatAttributeValue(clue.attribute, clue.value);

        return `${suspect.name} is ${formattedValue}.`;
      }

      if (weapon) {
        const attributeName = formatAttributeName(clue.attribute);

        if (clue.attribute === "weight") {
          return `The ${weapon.name} is ${clue.value.toLowerCase()}.`;
        }

        if (clue.attribute === "material") {
          return `The ${weapon.name} is made of ${clue.value}.`;
        }

        return `The ${weapon.name} has ${attributeName} ${clue.value}.`;
      }

      if (location) {
        const attributeName = formatAttributeName(clue.attribute);

        return `The ${location.name} has ${attributeName} ${clue.value}.`;
      }

      return `The ${formatAttributeName(clue.attribute)} is ${clue.value}.`;
    }

    /**
     * ---------------------------------------------------------
     * EXCLUSION
     * ---------------------------------------------------------
     *
     * Example:
     * Dr. Eleanor did not use the Crystal Dagger.
     *
     * Or:
     * Mr. Charles was not in the Dining Room.
     */
    case "EXCLUSION": {
      if (suspect && weapon) {
        return `${suspect.name} did not use the ${weapon.name}.`;
      }

      if (suspect && location) {
        return `${suspect.name} was not in the ${location.name}.`;
      }

      if (suspect && clue.attribute === "motive") {
        return `${suspect.name} did not have the motive of ${clue.value}.`;
      }

      if (weapon && location) {
        return `The ${weapon.name} was not found in the ${location.name}.`;
      }

      if (location && clue.attribute === "type") {
        return `The ${location.name} was not ${clue.value}.`;
      }

      return `${formatAttributeName(clue.attribute)} was not ${clue.value}.`;
    }

    /**
     * ---------------------------------------------------------
     * LOCATION
     * ---------------------------------------------------------
     *
     * Example:
     * The Crystal Dagger was found in the Garden.
     */
    case "LOCATION": {
      if (weapon && location) {
        if (clue.relation === "NOT_EQUAL") {
          return `The ${weapon.name} was not found in the ${location.name}.`;
        }

        return `The ${weapon.name} was found in the ${location.name}.`;
      }

      if (suspect && location) {
        if (clue.relation === "NOT_EQUAL") {
          return `${suspect.name} was not in the ${location.name}.`;
        }

        return `${suspect.name} was in the ${location.name}.`;
      }

      return `Something was found in the ${clue.value}.`;
    }

    /**
     * ---------------------------------------------------------
     * RELATION
     * ---------------------------------------------------------
     *
     * Generic relationship between entities.
     *
     * Example:
     * Lady Violet used the Crystal Dagger.
     */
    case "RELATION": {
      if (suspect && weapon) {
        switch (clue.relation) {
          case "EQUAL":

          case "NOT_EQUAL":

          default:
            return `${suspect.name} ${clue.relation.toLowerCase()} the ${weapon.name}.`;
        }
      }

      if (suspect && location) {
        switch (clue.relation) {
          case "EQUAL":
          case "AT":
            return `${suspect.name} was in the ${location.name}.`;

          case "NOT_EQUAL":
          case "NOT_AT":
            return `${suspect.name} was not in the ${location.name}.`;

          default:
            return `${suspect.name} ${clue.relation.toLowerCase()} the ${location.name}.`;
        }
      }

      if (weapon && location) {
        switch (clue.relation) {
          case "EQUAL":
          case "FOUND_AT":
            return `The ${weapon.name} was found in the ${location.name}.`;

          case "NOT_EQUAL":
          case "NOT_FOUND_AT":
            return `The ${weapon.name} was not found in the ${location.name}.`;

          default:
            return `The ${weapon.name} ${clue.relation.toLowerCase()} the ${location.name}.`;
        }
      }

      return `${clue.attribute} ${clue.relation.toLowerCase()} ${clue.value}.`;
    }

    /**
     * ---------------------------------------------------------
     * DEFAULT
     * ---------------------------------------------------------
     *
     * Fallback so a new clue type doesn't crash the UI.
     */
    default:
      return clue.value
        ? `${formatAttributeName(clue.attribute)}: ${clue.value}.`
        : "Unknown clue.";
  }
};
export const gameToClues = (game: IGame): Clue[] => {
  return (game.gameMetadata as IGameMetadata).clues.map((clue) => {
    return {
      id: clue.id,
      status: "new",
      entities: [],
      text: clueToText(clue, game.gameMetadata as IGameMetadata),
    };
  });
};
