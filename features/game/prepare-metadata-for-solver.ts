import type { IGameMetadata } from '@/features/game/game.schemas'
import { resolveClueValueForSubmit } from '@/lib/clue-templates'

/**
 * Normalize clue values from entity names before running the solver
 * (same as publish).
 */
export function prepareMetadataForSolver(
	metadata: IGameMetadata,
): IGameMetadata {
	const clues = metadata.clues.map((clue) =>
		resolveClueValueForSubmit(clue, metadata),
	)
	return { ...metadata, clues }
}
