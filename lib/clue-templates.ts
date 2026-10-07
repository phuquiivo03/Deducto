import type {
  ClueAttribute,
  ClueRelation,
  ClueType,
  IClue,
  IGameMetadata,
} from "@/features/game/game.schemas";

export type TemplateKey =
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "L1"
  | "L2"
  | "L3"
  | "L4"
  | "R1"
  | "R2"
  | "R3"
  | "R4"
  | "A1"
  | "A2";

export type ValueSource =
  | "weapon_name"
  | "location_name"
  | "motive_name"
  | "enum"
  | "attribute"
  | "none";

export interface ClueTemplateDef {
  key: TemplateKey;
  label: string;
  type: ClueType;
  attribute: ClueAttribute;
  relation: ClueRelation;
  suspectId: boolean;
  weaponId: boolean;
  locationId: boolean;
  valueSource: ValueSource;
  enumValues?: string[];
}

export const CLUE_TEMPLATES: ClueTemplateDef[] = [
  {
    key: "E1",
    label: "Nghi phạm không sử dụng vũ khí",
    type: "EXCLUSION",
    attribute: "weapon",
    relation: "NOT_EQUAL",
    suspectId: true,
    weaponId: true,
    locationId: false,
    valueSource: "weapon_name",
  },
  {
    key: "E2",
    label: "Nghi phạm không ở hiện trường",
    type: "EXCLUSION",
    attribute: "location",
    relation: "NOT_EQUAL",
    suspectId: true,
    weaponId: false,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "E3",
    label: "Nghi phạm không có động cơ",
    type: "EXCLUSION",
    attribute: "motive",
    relation: "NOT_EQUAL",
    suspectId: true,
    weaponId: false,
    locationId: false,
    valueSource: "motive_name",
  },
  {
    key: "E4",
    label: "Vũ khí không được tìm thấy ở hiện trường",
    type: "EXCLUSION",
    attribute: "found_at",
    relation: "NOT_EQUAL",
    suspectId: false,
    weaponId: true,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "L1",
    label: "Nghi phạm ở hiện trường",
    type: "LOCATION",
    attribute: "location",
    relation: "EQUAL",
    suspectId: true,
    weaponId: false,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "L2",
    label: "Nghi phạm không ở hiện trường (loại hiện trường)",
    type: "LOCATION",
    attribute: "location",
    relation: "NOT_EQUAL",
    suspectId: true,
    weaponId: false,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "L3",
    label: "Vũ khí được tìm thấy ở hiện trường",
    type: "LOCATION",
    attribute: "found_at",
    relation: "EQUAL",
    suspectId: false,
    weaponId: true,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "L4",
    label: "Vũ khí không được tìm thấy ở hiện trường",
    type: "LOCATION",
    attribute: "found_at",
    relation: "NOT_EQUAL",
    suspectId: false,
    weaponId: true,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "R1",
    label: "Nghi phạm ở hiện trường (quan hệ)",
    type: "RELATION",
    attribute: "location",
    relation: "AT",
    suspectId: true,
    weaponId: false,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "R2",
    label: "Nghi phạm không ở hiện trường (quan hệ)",
    type: "RELATION",
    attribute: "location",
    relation: "NOT_AT",
    suspectId: true,
    weaponId: false,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "R3",
    label: "Vũ khí được tìm thấy ở hiện trường (quan hệ)",
    type: "RELATION",
    attribute: "found_at",
    relation: "FOUND_AT",
    suspectId: false,
    weaponId: true,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "R4",
    label: "Vũ khí không được tìm thấy ở hiện trường (quan hệ)",
    type: "RELATION",
    attribute: "found_at",
    relation: "NOT_FOUND_AT",
    suspectId: false,
    weaponId: true,
    locationId: true,
    valueSource: "location_name",
  },
  {
    key: "A1",
    label: "Điểm neo độ khó",
    type: "ATTRIBUTE",
    attribute: "location",
    relation: "REQUIRED",
    suspectId: false,
    weaponId: false,
    locationId: false,
    valueSource: "enum",
    enumValues: [],
  },
  {
    key: "A2",
    label: "Thông tin thực tế (thuộc tính)",
    type: "ATTRIBUTE",
    attribute: "handedness",
    relation: "EQUAL",
    suspectId: true,
    weaponId: false,
    locationId: false,
    valueSource: "attribute",
  },
];

const A1_ATTRIBUTES: ClueAttribute[] = [
  "location",
  "motive",
  "handedness",
  "hairColor",
  "weight",
  "material",
];

function idFlags(clue: IClue) {
  return {
    suspect: Boolean(clue.suspect_id),
    weapon: Boolean(clue.weapon_id),
    location: Boolean(clue.location_id),
  };
}

export function detectTemplate(clue: IClue): TemplateKey | "custom" {
  for (const t of CLUE_TEMPLATES) {
    if (t.key === "A1") {
      if (
        clue.type === "ATTRIBUTE" &&
        clue.relation === "REQUIRED" &&
        !clue.suspect_id &&
        !clue.weapon_id &&
        !clue.location_id &&
        A1_ATTRIBUTES.includes(clue.attribute)
      ) {
        return "A1";
      }
      continue;
    }
    if (t.key === "A2") {
      const flags = idFlags(clue);
      const idCount =
        Number(flags.suspect) + Number(flags.weapon) + Number(flags.location);
      if (
        clue.type === "ATTRIBUTE" &&
        clue.relation === "EQUAL" &&
        idCount === 1
      ) {
        return "A2";
      }
      continue;
    }

    const flags = idFlags(clue);
    if (
      clue.type === t.type &&
      clue.attribute === t.attribute &&
      clue.relation === t.relation &&
      flags.suspect === t.suspectId &&
      flags.weapon === t.weaponId &&
      flags.location === t.locationId
    ) {
      return t.key;
    }
  }
  return "custom";
}

export function getTemplate(key: TemplateKey): ClueTemplateDef {
  const found = CLUE_TEMPLATES.find((t) => t.key === key);
  if (!found) {
    throw new Error(`Unknown template ${key}`);
  }
  return found;
}

function resolveValueFromRefs(
  template: ClueTemplateDef,
  refs: {
    suspect_id?: string;
    weapon_id?: string;
    location_id?: string;
  },
  metadata: IGameMetadata,
  manualValue: string,
): string {
  switch (template.valueSource) {
    case "weapon_name": {
      const w = metadata.weapons.find((x) => x.id === refs.weapon_id);
      return w?.name ?? manualValue;
    }
    case "location_name": {
      const l = metadata.locations.find((x) => x.id === refs.location_id);
      return l?.name ?? manualValue;
    }
    case "motive_name":
      return manualValue;
    case "enum":
    case "attribute":
    case "none":
      return manualValue;
    default:
      return manualValue;
  }
}

export function buildClue(
  id: string,
  templateKey: TemplateKey,
  refs: {
    suspect_id?: string;
    weapon_id?: string;
    location_id?: string;
  },
  value: string,
  attributeOverride?: ClueAttribute,
): IClue {
  const template = getTemplate(templateKey);
  const attribute =
    templateKey === "A1" && attributeOverride
      ? attributeOverride
      : templateKey === "A2" && attributeOverride
        ? attributeOverride
        : template.attribute;

  const clue: IClue = {
    id,
    type: template.type,
    attribute,
    relation: template.relation,
    value,
  };

  if (template.suspectId && refs.suspect_id) {
    clue.suspect_id = refs.suspect_id;
  }
  if (template.weaponId && refs.weapon_id) {
    clue.weapon_id = refs.weapon_id;
  }
  if (template.locationId && refs.location_id) {
    clue.location_id = refs.location_id;
  }

  return clue;
}

export function syncClueValuesFromMetadata(
  metadata: IGameMetadata,
): IGameMetadata {
  const clues = metadata.clues.map((clue) => {
    const key = detectTemplate(clue);
    if (key === "custom") {
      return clue;
    }
    const template = getTemplate(key);
    const value = resolveValueFromRefs(
      template,
      {
        suspect_id: clue.suspect_id,
        weapon_id: clue.weapon_id,
        location_id: clue.location_id,
      },
      metadata,
      clue.value,
    );
    if (template.valueSource === "motive_name") {
      return clue;
    }
    if (
      template.valueSource === "weapon_name" ||
      template.valueSource === "location_name"
    ) {
      return { ...clue, value };
    }
    return clue;
  });
  return { ...metadata, clues };
}

export function resolveClueValueForSubmit(
  clue: IClue,
  metadata: IGameMetadata,
): IClue {
  const key = detectTemplate(clue);
  if (key === "custom") {
    return clue;
  }
  const template = getTemplate(key);
  const value = resolveValueFromRefs(
    template,
    {
      suspect_id: clue.suspect_id,
      weapon_id: clue.weapon_id,
      location_id: clue.location_id,
    },
    metadata,
    clue.value,
  );
  return { ...clue, value };
}

export const A1_ANCHOR_ATTRIBUTES = A1_ATTRIBUTES;

export const A2_ATTRIBUTES: ClueAttribute[] = [
  "handedness",
  "height",
  "weight",
  "material",
];
