export type GameLevel = "easy" | "medium" | "hard" | string;
export type RelationshipStatus =
  | "confirmed"
  | "impossible"
  | "unknown"
  | "empty";
export type Handedness = "LEFT" | "RIGHT";
export type ClueType = "ATTRIBUTE" | "RELATION" | "LOCATION" | "EXCLUSION";

export type ClueRelation =
  | "EQUAL"
  | "NOT_EQUAL"
  | "REQUIRED"
  | "AT"
  | "NOT_AT"
  | "FOUND_AT"
  | "NOT_FOUND_AT";

export type ClueAttribute =
  | "handedness"
  | "hairColor"
  | "height"
  | "birthday"
  | "weight"
  | "material"
  | "type"
  | "weapon"
  | "location"
  | "motive"
  | "found_at";
export interface ILocationAttributes {
  type?: string;
  characteristic?: string;
  [key: string]: unknown; // Cho phép mở rộng thêm thuộc tính tùy chọn
}

export interface ISuspectAttributes {
  height?: number;
  hairColor?: string;
  handedness?: Handedness;
  birthday?: string;
  [key: string]: unknown;
}

export interface IWeaponAttributes {
  weight?: "LIGHT" | "MEDIUM" | "HEAVY" | string;
  material?: string;
  type?: string;
  [key: string]: unknown;
}

// --- Entity Interfaces ---

export interface ILocation {
  id: string;
  name: string;
  description?: string;
  icon: string;
  attributes?: ILocationAttributes;
}

export interface ISuspect {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  gender?: string;
  description?: string;
  attributes?: ISuspectAttributes;
}

export interface IWeapon {
  id: string;
  name: string;
  description?: string;
  icon: string;
  attributes?: IWeaponAttributes;
}

export interface IMotive {
  id: string;
  name: string;
  description?: string;
  icon: string;
}

export interface IClue {
  id: string;
  type: ClueType;
  attribute: ClueAttribute;
  value: string;
  relation: ClueRelation;
  location_id?: string;
  suspect_id?: string;
  weapon_id?: string;
}

export interface IResultAnswer {
  murder_id: string;
  weapon_id: string;
  motive_id: string;
  location_id: string;
}

export interface IResult {
  id?: string;
  game_id: string;
  anwser: IResultAnswer;
}

export interface IGameMetadata {
  id: string;
  suspects: ISuspect[];
  locations: ILocation[];
  weapons: IWeapon[];
  motives: IMotive[];
  clues: IClue[];
}

export interface IGame {
  id: string;
  creator: string;
  gameMetadata: string | IGameMetadata; // ID tham chiếu đến game_metadata hoặc object được populate
  title: string;
  description: string;
  banner: string;
  level: GameLevel;
  created_at: string;
}

export interface IListed {
  id: string;
  game_id: string;
  price: number;
  sold: number;
}

export interface IRelationship {
  id: string;

  a: string;
  b: string;

  label: string;

  status: RelationshipStatus;

  reason: string;
}

export interface IResultResponse {
  success: boolean;
  message?: string;
}
