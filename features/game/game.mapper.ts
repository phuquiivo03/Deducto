import type { IGame, IGameMetadata } from "@/features/game/game.schemas";

/** Row shape returned by Supabase nested select on `games`. */
export interface GameDbRow {
	id: string;
	creator: string;
	title: string;
	description: string;
	banner: string;
	level: string;
	created_at: string;
	game_metadata_id?: string;
	game_metadata: IGameMetadata | null;
}

export function mapGameFromDb(row: GameDbRow | null): IGame | null {
	if (!row?.game_metadata) {
		return null;
	}

	return {
		id: row.id,
		creator: row.creator,
		title: row.title,
		description: row.description,
		banner: row.banner,
		level: row.level,
		created_at: row.created_at,
		gameMetadata: row.game_metadata,
	};
}
