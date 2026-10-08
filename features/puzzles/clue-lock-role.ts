import { checkUniquelySolvable } from '@/features/game/case-solver'
import type {
	IAnswerAnswer,
	IGameMetadata,
} from '@/features/game/game.schemas'

import type { PuzzleRole } from './puzzle-role'

/**
 * Required when dropping this clue leaves the case not uniquely
 * solved. Optional when the saved tuple still stands alone.
 */
export function clueLockRole (
	metadata: IGameMetadata,
	result: IAnswerAnswer,
	clueId: string,
): PuzzleRole {
	const without: IGameMetadata = {
		...metadata,
		clues: metadata.clues.filter((clue) => clue.id !== clueId),
	}
	const removed = checkUniquelySolvable(without, result)
	return removed.status === 'valid' ? 'optional' : 'required'
}
