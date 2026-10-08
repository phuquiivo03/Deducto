import assert from 'node:assert/strict'
import test from 'node:test'

import { clueToText } from '@/lib/clues.helper'
import type { IGameMetadata } from '@/features/game/game.schemas'
import { sampleGame } from '@/data/sample-be'

import {
	codePoints,
	decodeScytale,
	encodeScytale,
	generateScytalePuzzle,
	openingScytaleColumns,
	PuzzleGenerateError,
	scytaleKeysFor,
	validateScytalePuzzle,
} from './scytale'
import { scytalePuzzleSchema } from './types'

const ARTHUR = 'Ông Arthur có mặt ở Thư viện.'

function metadata (): IGameMetadata {
	const value = sampleGame.gameMetadata
	if (typeof value === 'string') {
		throw new Error('sample metadata must be an object')
	}
	return value
}

test('encode and decode round-trip for every diameter', () => {
	const length = codePoints(ARTHUR).length
	for (let columns = 2; columns < length; columns += 1) {
		const strip = encodeScytale(ARTHUR, columns)
		assert.equal(strip.length, ARTHUR.length)
		assert.equal(decodeScytale(strip, columns), ARTHUR)
	}
})

test('a wrong diameter does not restore the sentence', () => {
	const strip = encodeScytale(ARTHUR, 5)
	assert.notEqual(decodeScytale(strip, 4), ARTHUR)
	assert.notEqual(decodeScytale(strip, 6), ARTHUR)
})

test('ragged rows keep every code point, including spaces', () => {
	const text = 'AB CDE'
	const strip = encodeScytale(text, 4)
	assert.equal(codePoints(strip).length, codePoints(text).length)
	assert.equal(decodeScytale(strip, 4), text)
	assert.ok(strip.includes(' '))
})

test('the generated key is the only key that spells the sentence', () => {
	const puzzle = generateScytalePuzzle(ARTHUR, 'required')
	assert.equal(puzzle.kind, 'scytale')
	assert.equal(puzzle.role, 'required')
	assert.notEqual(puzzle.strip, ARTHUR)
	assert.deepEqual(scytaleKeysFor(puzzle.strip, ARTHUR), [
		puzzle.columns,
	])
	assert.equal(
		decodeScytale(puzzle.strip, puzzle.columns),
		ARTHUR,
	)
	const check = validateScytalePuzzle(puzzle, ARTHUR)
	assert.equal(check.ok, true)
	assert.equal(check.uniqueKey, true)
	assert.equal(check.decodeMatches, true)
})

test('generation is deterministic', () => {
	const first = generateScytalePuzzle(ARTHUR, 'optional')
	const second = generateScytalePuzzle(ARTHUR, 'optional')
	assert.deepEqual(first, second)
})

test('the opening diameter is not the solution', () => {
	const puzzle = generateScytalePuzzle(ARTHUR, 'required')
	const opening = openingScytaleColumns(puzzle.strip, ARTHUR)
	assert.notEqual(opening, puzzle.columns)
	assert.notEqual(
		decodeScytale(puzzle.strip, opening),
		ARTHUR,
	)
})

test('every sample sentence has one scytale diameter', () => {
	const meta = metadata()
	for (const clue of meta.clues) {
		const sentence = clueToText(clue, meta)
		const puzzle = generateScytalePuzzle(sentence, 'optional')
		assert.equal(
			decodeScytale(puzzle.strip, puzzle.columns),
			sentence,
		)
		assert.deepEqual(scytaleKeysFor(puzzle.strip, sentence), [
			puzzle.columns,
		])
	}
})

test('a repeated letter has no unique diameter', () => {
	assert.throws(
		() => generateScytalePuzzle('aaaaaa', 'optional'),
		(err: unknown) => {
			assert.ok(err instanceof PuzzleGenerateError)
			assert.match(err.message, /No scytale diameter/)
			return true
		},
	)
})

test('a short sentence is rejected', () => {
	assert.throws(
		() => generateScytalePuzzle('abc', 'required'),
		/too short/,
	)
})

test('validator rejects a strip that decodes to another sentence', () => {
	const puzzle = generateScytalePuzzle(ARTHUR, 'required')
	const check = validateScytalePuzzle(puzzle, `${ARTHUR} `)
	assert.equal(check.ok, false)
	assert.equal(check.decodeMatches, false)
})

test('schema rejects a diameter as long as the strip', () => {
	const parsed = scytalePuzzleSchema.safeParse({
		kind: 'scytale',
		role: 'required',
		columns: 4,
		strip: 'abcd',
	})
	assert.equal(parsed.success, false)
})

test('validator rejects a diameter that is not unique', () => {
	const check = validateScytalePuzzle(
		{
			kind: 'scytale',
			role: 'optional',
			columns: 2,
			strip: 'aaaaaa',
		},
		'aaaaaa',
	)
	assert.equal(check.decodeMatches, true)
	assert.equal(check.uniqueKey, false)
	assert.equal(check.ok, false)
	assert.match(check.messages.join(' '), /More than one/)
})
