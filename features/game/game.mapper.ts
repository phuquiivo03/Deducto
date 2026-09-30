import type {
  IGame,
  IGameMetadata,
  IShortGame,
} from "@/features/game/game.schemas";
import { IUser } from "../user/user.schemas";

/** Row shape returned by Supabase nested select on `games`. */
export interface GameDbRow {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  banner: string;
  level: string;
  created_at: string;
  game_metadata_id?: string;
  game_metadata: IGameMetadata | null;
}

/** Row shape for list queries on `games`. */
export interface ShortGameDbRow {
  id: string;
  creator_id: {
    name: string;
    avatar: string;
  } | null;
  title: string;
  description: string;
  banner: string;
  level: string;
  created_at: string;
}

export function mapShortGameFromDb(row: ShortGameDbRow): IShortGame {
  return {
    id: row.id,
    creator: row.creator_id,
    title: row.title,
    description: row.description,
    banner: row.banner,
    level: row.level,
    created_at: row.created_at,
  };
}

export function mapGameFromDb(row: GameDbRow | null): IGame | null {
  if (!row?.game_metadata) {
    return null;
  }

  return {
    id: row.id,
    creator: row.creator_id,
    title: row.title,
    description: row.description,
    banner: row.banner,
    level: row.level,
    created_at: row.created_at,
    gameMetadata: row.game_metadata,
  };
}
