import type { IClue } from '@/features/game/game.schemas'

export interface ClueWriteData {
	id: string
	type: IClue['type']
	attribute: IClue['attribute']
	value: string
	relation: IClue['relation']
	suspectId?: string
	locationId?: string
	weaponId?: string
	puzzle?: IClue['puzzle']
}

/**
 * Row payload for one clue. A missing puzzle stays unset so cases
 * with no locks write the same columns as before.
 */
export function clueWriteData (
	clue: IClue,
	remap: (id: string) => string,
): ClueWriteData {
	return {
		id: remap(clue.id),
		type: clue.type,
		attribute: clue.attribute,
		value: clue.value,
		relation: clue.relation,
		suspectId: clue.suspect_id ? remap(clue.suspect_id) : undefined,
		locationId: clue.location_id ? remap(clue.location_id) : undefined,
		weaponId: clue.weapon_id ? remap(clue.weapon_id) : undefined,
		puzzle: clue.puzzle,
	}
}
