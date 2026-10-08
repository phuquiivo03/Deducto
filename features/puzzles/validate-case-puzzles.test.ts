import assert from 'node:assert/strict'
import test from 'node:test'

import { sampleGame, sampleResult } from '@/data/sample-be'
import type {
	IClue,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

import { generateScytalePuzzle } from './scytale/scytale'
import {
	assertPuzzlesValid,
	validateCasePuzzles,
} from './validate-case-puzzles'

function metadata (): IGameMetadata {
	const value = sampleGame.gameMetadata
	if (typeof value === 'string') {
		throw new Error('sample metadata must be an object')
	}
	return value
}

function withoutPuzzles (meta: IGameMetadata): IGameMetadata {
	return {
		...meta,
		clues: meta.clues.map((clue) => ({
			...clue,
			puzzle: undefined,
		})),
	}
}

function withPuzzle (
	meta: IGameMetadata,
	clueId: string,
	role: 'required' | 'optional',
): IGameMetadata {
	return {
		...meta,
		clues: meta.clues.map((clue) => {
			if (clue.id !== clueId) return clue
			const sentence = clueToText(clue, meta)
			return {
				...clue,
				puzzle: generateScytalePuzzle(sentence, role),
			}
		}),
	}
}

test('no locked clues skip the puzzle gate', () => {
	const report = validateCasePuzzles(
		withoutPuzzles(metadata()),
		sampleResult.answer,
	)
	assert.equal(report.ok, true)
	assert.deepEqual(report.clues, [])
	assert.doesNotThrow(() => {
		assertPuzzlesValid(
			withoutPuzzles(metadata()),
			sampleResult.answer,
		)
	})
})

test('the seeded sample lock is required and valid', () => {
	const report = validateCasePuzzles(
		metadata(),
		sampleResult.answer,
	)
	assert.equal(report.ok, true)
	assert.equal(report.clues.length, 1)
	assert.equal(report.clues[0]?.role, 'required')
	assert.equal(report.clues[0]?.decodeMatches, true)
	assert.equal(report.clues[0]?.uniqueKey, true)
	assert.equal(report.clues[0]?.roleOk, true)
})

test('an essential clue cannot be marked optional', () => {
	const base = withoutPuzzles(metadata())
	const clue = base.clues[0]
	assert.ok(clue)
	const locked = withPuzzle(base, clue.id, 'optional')
	const report = validateCasePuzzles(locked, sampleResult.answer)
	assert.equal(report.ok, false)
	assert.equal(report.clues[0]?.roleOk, false)
	assert.match(report.issues.join(' '), /Optional lock/)
	assert.throws(
		() => assertPuzzlesValid(locked, sampleResult.answer),
		/puzzle checks/,
	)
})

test('an essential clue may be marked required', () => {
	const base = withoutPuzzles(metadata())
	const clue = base.clues[0]
	assert.ok(clue)
	const locked = withPuzzle(base, clue.id, 'required')
	const report = validateCasePuzzles(locked, sampleResult.answer)
	assert.equal(report.ok, true)
	assert.equal(report.clues[0]?.roleOk, true)
})

test('a redundant copy may be optional and may not be required', () => {
	const base = withoutPuzzles(metadata())
	const source = base.clues[0]
	assert.ok(source)
	const copy: IClue = {
		...source,
		id: 'redundant-copy',
	}
	const withCopy: IGameMetadata = {
		...base,
		clues: [...base.clues, copy],
	}
	const sentence = clueToText(copy, withCopy)
	const optional = validateCasePuzzles(
		{
			...withCopy,
			clues: withCopy.clues.map((clue) =>
				clue.id === copy.id
					? {
							...clue,
							puzzle: generateScytalePuzzle(
								sentence,
								'optional',
							),
						}
					: clue,
			),
		},
		sampleResult.answer,
	)
	assert.equal(optional.ok, true)
	assert.equal(
		optional.clues.find((item) => item.clueId === copy.id)?.roleOk,
		true,
	)

	const required = validateCasePuzzles(
		{
			...withCopy,
			clues: withCopy.clues.map((clue) =>
				clue.id === copy.id
					? {
							...clue,
							puzzle: generateScytalePuzzle(
								sentence,
								'required',
							),
						}
					: clue,
			),
		},
		sampleResult.answer,
	)
	assert.equal(required.ok, false)
	assert.equal(
		required.clues.find((item) => item.clueId === copy.id)?.roleOk,
		false,
	)
	assert.match(required.issues.join(' '), /Required lock/)
})
