import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { sampleGame } from '@/data/sample-be'
import type { IGameMetadata } from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

import { normalizeCaesarSentence } from './caesar/caesar'
import {
	decodingKinds,
	generatePuzzle,
	puzzleCipherText,
	readingMatchesSentence,
	toPlayerPuzzle,
} from './registry'
import { cluePuzzleSchema } from './schema'

function metadata (): IGameMetadata {
	const value = sampleGame.gameMetadata
	if (typeof value === 'string') {
		throw new Error('sample metadata must be an object')
	}
	return {
		...value,
		clues: value.clues.map((clue) => {
			const next = { ...clue }
			delete next.puzzle
			return next
		}),
	}
}

test('only the correct kind decodes the canonical sentence', () => {
	const meta = metadata()
	const clue = meta.clues[0]
	assert.ok(clue)
	const sentence = clueToText(clue, meta)
	const caesar = generatePuzzle('caesar', sentence, 'required')
	assert.equal(caesar.kind, 'caesar')
	if (caesar.kind !== 'caesar') return
	assert.deepEqual(decodingKinds(caesar.cipher, sentence), ['caesar'])
	assert.equal(
		readingMatchesSentence(
			'caesar',
			normalizeCaesarSentence(sentence),
			sentence,
		),
		true,
	)
	assert.equal(
		readingMatchesSentence('scytale', caesar.cipher, sentence),
		false,
	)

	const scytale = generatePuzzle('scytale', sentence, 'required')
	assert.equal(scytale.kind, 'scytale')
	if (scytale.kind !== 'scytale') return
	assert.deepEqual(decodingKinds(scytale.strip, sentence), ['scytale'])
	assert.equal(
		readingMatchesSentence('scytale', sentence, sentence),
		true,
	)
	assert.equal(
		readingMatchesSentence(
			'caesar',
			normalizeCaesarSentence(scytale.strip),
			sentence,
		),
		false,
	)
})

test('player puzzles keep a flat cipher and drop the key', () => {
	const meta = metadata()
	const clue = meta.clues[0]
	assert.ok(clue)
	const sentence = clueToText(clue, meta)
	const stored = {
		...generatePuzzle('caesar', sentence, 'optional'),
		hint: 'Chỉ là ngữ cảnh.',
	}
	assert.equal(cluePuzzleSchema.safeParse(stored).success, true)
	const player = toPlayerPuzzle(stored)
	assert.equal(player.kind, 'caesar')
	assert.equal('shift' in player, false)
	assert.equal('role' in player, false)
	assert.equal(puzzleCipherText(player), puzzleCipherText(stored))
	const withoutHint = generatePuzzle('scytale', sentence, 'required')
	assert.equal(cluePuzzleSchema.safeParse(withoutHint).success, true)
	assert.equal('hint' in withoutHint, false)
})

test('the toolkit does not open the stored kind', () => {
	const source = readFileSync(
		new URL('./toolkit.tsx', import.meta.url),
		'utf8',
	)
	assert.match(source, /listPuzzleKinds/)
	assert.doesNotMatch(source, /puzzle\.kind/)
})
