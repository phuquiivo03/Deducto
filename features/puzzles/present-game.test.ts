import assert from 'node:assert/strict'
import test from 'node:test'

import { sampleGame } from '@/data/sample-be'
import { sampleIds } from '@/data/sample-ids'
import type { IGameMetadata } from '@/features/game/game.schemas'
import { clueToText, gameToClues } from '@/lib/clues.helper'

import { presentGameForPlayer } from './present-game'

function metadata (game: { gameMetadata: IGameMetadata | string }): IGameMetadata {
	if (typeof game.gameMetadata === 'string') {
		throw new Error('metadata')
	}
	return game.gameMetadata
}

test('players receive the strip without the diameter or role', () => {
	const presented = presentGameForPlayer(sampleGame)
	const clue = metadata(presented).clues.find(
		(item) => item.id === sampleIds.clues.c1,
	)
	assert.ok(clue?.puzzle)
	assert.deepEqual(Object.keys(clue.puzzle).sort(), ['kind', 'strip'])
	assert.equal(clue.puzzle.kind, 'scytale')
	const encoded = JSON.stringify(clue.puzzle)
	assert.equal(encoded.includes('columns'), false)
	assert.equal(encoded.includes('role'), false)
	assert.equal(encoded.includes('"required"'), false)

	const board = gameToClues(presented)
	const locked = board.find((item) => item.id === sampleIds.clues.c1)
	assert.ok(locked?.puzzle)
	assert.equal('columns' in locked.puzzle, false)
	assert.equal(locked.text.length > 0, true)
	assert.equal(
		locked.text,
		clueToText(clue, metadata(presented)),
	)
})

test('a case with no locks is unchanged', () => {
	const meta = metadata(sampleGame)
	const open = {
		...sampleGame,
		gameMetadata: {
			...meta,
			clues: meta.clues.map((clue) => {
				const next = { ...clue }
				delete next.puzzle
				return next
			}),
		},
	}
	assert.equal(presentGameForPlayer(open), open)
})
