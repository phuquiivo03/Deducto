import { sampleIds } from '@/data/sample-ids'
import { sampleGame } from '@/data/sample-be'
import type { IGame, IGameMetadata } from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

function asMetadata (
	game: IGame,
): IGameMetadata | null {
	if (typeof game.gameMetadata === 'string') return null
	return game.gameMetadata
}

/**
 * Copy scytale locks from the seeded sample onto a loaded case when
 * that case still renders the same sentences and a clue has no puzzle
 * of its own. A drifted database row is left alone.
 */
export function applySamplePuzzles (game: IGame): IGame {
	if (game.id !== sampleIds.game) return game
	const loaded = asMetadata(game)
	const sample = asMetadata(sampleGame)
	if (!loaded || !sample) return game
	if (loaded.clues.length !== sample.clues.length) return game

	const sentencesMatch = sample.clues.every((sampleClue) => {
		const loadedClue = loaded.clues.find(
			(clue) => clue.id === sampleClue.id,
		)
		if (!loadedClue) return false
		return (
			clueToText(loadedClue, loaded) ===
			clueToText(sampleClue, sample)
		)
	})
	if (!sentencesMatch) return game

	let changed = false
	const clues = loaded.clues.map((loadedClue) => {
		if (loadedClue.puzzle) return loadedClue
		const sampleClue = sample.clues.find(
			(clue) => clue.id === loadedClue.id,
		)
		if (!sampleClue?.puzzle) return loadedClue
		changed = true
		return { ...loadedClue, puzzle: sampleClue.puzzle }
	})
	if (!changed) return game
	return {
		...game,
		gameMetadata: { ...loaded, clues },
	}
}
