import type {
	IClue,
	IGame,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { cluePuzzleSchema } from '@/features/puzzles/schema'

import { toPlayerPuzzle } from './registry'

function asMetadata (game: IGame): IGameMetadata | null {
	if (typeof game.gameMetadata === 'string') return null
	return game.gameMetadata
}

/**
 * Drop cipher secrets before a case reaches the browser.
 *
 * Stored puzzles keep `role`, the scytale diameter, and the Caesar
 * shift. Players receive `kind`, the flat ciphertext, and the hint.
 * `kind` remains in the payload, so a technical player can read it.
 * The solve UI does not open that kind for them. The canonical
 * sentence is still derivable from the structured clue (the board
 * hides it behind the hint until the puzzle is solved, and the solve
 * modal compares the reading to that sentence).
 */
export function presentGameForPlayer (game: IGame): IGame {
	const metadata = asMetadata(game)
	if (!metadata) return game

	let changed = false
	const clues = metadata.clues.map((clue) => {
		if (!clue.puzzle) return clue
		const stored = cluePuzzleSchema.safeParse(clue.puzzle)
		if (!stored.success) {
			changed = true
			const next = { ...clue }
			delete next.puzzle
			return next
		}
		const puzzle = toPlayerPuzzle(stored.data)
		changed = true
		const playerClue: IClue = {
			...clue,
			puzzle: puzzle as IClue['puzzle'],
		}
		return playerClue
	})

	if (!changed) return game
	return {
		...game,
		gameMetadata: { ...metadata, clues },
	}
}
