import assert from 'node:assert/strict'
import test from 'node:test'

import { sampleGame } from '@/data/sample-be'
import { sampleIds } from '@/data/sample-ids'
import type { IGame, IGameMetadata } from '@/features/game/game.schemas'

import { applySamplePuzzles } from './apply-sample-puzzles'

function metadata (game: IGame): IGameMetadata {
	if (typeof game.gameMetadata === 'string') {
		throw new Error('metadata')
	}
	return game.gameMetadata
}

function stripPuzzles (game: IGame): IGame {
	const meta = metadata(game)
	return {
		...game,
		gameMetadata: {
			...meta,
			clues: meta.clues.map((clue) => ({
				...clue,
				puzzle: undefined,
			})),
		},
	}
}

test('a matching sample case receives the seeded lock', () => {
	const applied = applySamplePuzzles(stripPuzzles(sampleGame))
	const clues = metadata(applied).clues
	assert.equal(
		clues.some((clue) => clue.puzzle?.kind === 'scytale'),
		true,
	)
})

test('an existing puzzle is left in place', () => {
	const applied = applySamplePuzzles(sampleGame)
	assert.equal(applied, sampleGame)
})

test('a different game is not wrapped', () => {
	const other = stripPuzzles({
		...sampleGame,
		id: 'not-the-sample',
	})
	assert.equal(applySamplePuzzles(other), other)
})

test('a drifted sentence is not wrapped', () => {
	const meta = metadata(stripPuzzles(sampleGame))
	const drifted: IGame = {
		...sampleGame,
		gameMetadata: {
			...meta,
			locations: meta.locations.map((location) =>
				location.id === sampleIds.locations.library
					? { ...location, name: 'Kho sách' }
					: location,
			),
		},
	}
	const applied = applySamplePuzzles(drifted)
	assert.equal(
		metadata(applied).clues.some((clue) => clue.puzzle),
		false,
	)
})
