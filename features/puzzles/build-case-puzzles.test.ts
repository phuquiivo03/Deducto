import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { sampleGame, sampleResult } from '@/data/sample-be'
import { sampleIds } from '@/data/sample-ids'
import { assertUniquelySolvable, solveCase } from '@/features/game/case-solver'
import { CaseNotSolvableError } from '@/features/game/game-errors'
import {
	createGameInputSchema,
	type IClue,
	type IGameMetadata,
} from '@/features/game/game.schemas'
import { publishCase } from '@/features/game/publish-case'
import { clueToText } from '@/lib/clues.helper'

import {
	PuzzleLockError,
	buildCasePuzzles,
} from './build-case-puzzles'
import { clueLockRole } from './clue-lock-role'
import { puzzleLockRequestSchema } from './lock-request'
import { listPuzzleKinds } from './registry'
import { decodeCaesar, normalizeCaesarSentence } from './caesar/caesar'
import { decodeScytale } from './scytale/scytale'
import { suggestPuzzleLock } from './suggest-lock'

const HINT = 'Ghi chép về ông Arthur trong đêm xảy ra vụ án.'

function lock (
	clueId: string,
	kind: 'scytale' | 'caesar' = 'scytale',
	hint = HINT,
) {
	return { clueId, kind, hint }
}

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

function sampleInput (
	locks?: { clueId: string; kind: 'scytale' | 'caesar'; hint: string }[],
) {
	const game = sampleGame
	return {
		title: game.title,
		description: game.description,
		banner: game.banner,
		level: 'easy' as const,
		gameMetadata: metadata(),
		result: sampleResult.answer,
		locks,
	}
}

test('a lock request cannot carry a cipher or a role', () => {
	const parsed = puzzleLockRequestSchema.parse({
		clueId: sampleIds.clues.c1,
		kind: 'scytale',
		hint: `  ${HINT} <b>x</b>  `,
		role: 'optional',
		columns: 2,
		strip: 'hacked',
		shift: 4,
	})
	assert.deepEqual(parsed, {
		clueId: sampleIds.clues.c1,
		kind: 'scytale',
		hint: `${HINT} x`,
	})
	assert.equal(
		puzzleLockRequestSchema.safeParse({
			clueId: sampleIds.clues.c1,
			kind: 'caesar',
		}).success,
		false,
	)
	assert.equal(
		puzzleLockRequestSchema.safeParse({
			clueId: sampleIds.clues.c1,
			kind: 'caesar',
			hint: '   ',
		}).success,
		false,
	)
	assert.equal(
		puzzleLockRequestSchema.safeParse({
			clueId: sampleIds.clues.c1,
			kind: 'caesar',
			hint: 'a'.repeat(201),
		}).success,
		false,
	)
})

test('create schema drops a client puzzle and keeps the lock', () => {
	const body = sampleInput([
		lock(sampleIds.clues.c1),
	])
	const first = body.gameMetadata.clues[0]
	assert.ok(first)
	const parsed = createGameInputSchema.safeParse({
		...body,
		gameMetadata: {
			...body.gameMetadata,
			clues: body.gameMetadata.clues.map((clue, index) =>
				index === 0
					? {
							...clue,
							puzzle: {
								kind: 'scytale',
								role: 'optional',
								columns: 2,
								strip: 'hacked',
							},
						}
					: clue,
			),
		},
	})
	assert.equal(parsed.success, true)
	if (!parsed.success) return
	const stored = parsed.data.gameMetadata.clues[0]
	assert.ok(stored)
	assert.equal('puzzle' in stored, false)
	assert.deepEqual(parsed.data.locks, [
		lock(sampleIds.clues.c1),
	])
})

test('no locks leave every clue unlocked', () => {
	const published = publishCase(sampleInput())
	assert.equal(
		published.gameMetadata.clues.some((clue) => clue.puzzle),
		false,
	)
})

test('an essential clue is locked as required from the sentence', () => {
	const meta = metadata()
	const published = publishCase(
		sampleInput([lock(sampleIds.clues.c1)]),
	)
	const clue = published.gameMetadata.clues.find(
		(item) => item.id === sampleIds.clues.c1,
	)
	assert.ok(clue?.puzzle)
	assert.equal(clue.puzzle.kind, 'scytale')
	assert.equal(clue.puzzle.role, 'required')
	assert.equal(
		clueLockRole(meta, sampleResult.answer, clue.id),
		'required',
	)
	if (clue.puzzle.kind !== 'scytale') return
	const sentence = clueToText(clue, published.gameMetadata)
	assert.equal(
		decodeScytale(clue.puzzle.strip, clue.puzzle.columns),
		sentence,
	)
	assert.notEqual(clue.puzzle.strip, 'hacked')
	assert.notEqual(clue.puzzle.role, 'optional')
})

test('a client cipher and role are replaced', () => {
	const meta = metadata()
	const clues = meta.clues.map((clue) =>
		clue.id === sampleIds.clues.c1
			? {
					...clue,
					puzzle: {
						kind: 'scytale' as const,
						role: 'optional' as const,
						columns: 2,
						strip: 'hacked',
					},
				}
			: clue,
	)
	const built = buildCasePuzzles(
		{ ...meta, clues },
		sampleResult.answer,
		[lock(sampleIds.clues.c1)],
	)
	const puzzle = built.clues.find(
		(clue) => clue.id === sampleIds.clues.c1,
	)?.puzzle
	assert.ok(puzzle)
	assert.equal(puzzle.role, 'required')
	if (puzzle.kind !== 'scytale') return
	assert.notEqual(puzzle.strip, 'hacked')
})

test('a redundant copy is optional', () => {
	const meta = metadata()
	const source = meta.clues[0]
	assert.ok(source)
	const copy: IClue = { ...source, id: 'redundant-copy' }
	const withCopy: IGameMetadata = {
		...meta,
		clues: [...meta.clues, copy],
	}
	const built = buildCasePuzzles(withCopy, sampleResult.answer, [
		lock(copy.id),
	])
	assert.equal(
		built.clues.find((clue) => clue.id === copy.id)?.puzzle?.role,
		'optional',
	)
	assert.equal(
		built.clues.find((clue) => clue.id === source.id)?.puzzle,
		undefined,
	)
})

test('a sentence with no unique diameter names the clue and stores nothing', () => {
	const input = sampleInput([
		lock(sampleIds.clues.c1),
	])
	assert.throws(
		() =>
			buildCasePuzzles(
				input.gameMetadata,
				input.result,
				input.locks ?? [],
				() => 'aaaaaa',
			),
		(error: unknown) => {
			assert.ok(error instanceof PuzzleLockError)
			assert.match(error.publicMessage, /manh mối 1/)
			assert.match(error.publicMessage, /Scytale/)
			assert.match(error.publicMessage, /đường kính/)
			assert.match(error.publicMessage, /Ông Arthur|aaaaaa/)
			return true
		},
	)
	assert.throws(
		() => publishCase({ ...input, gameMetadata: { ...input.gameMetadata, clues: [] } }),
		(error: unknown) => {
			assert.ok(error instanceof CaseNotSolvableError)
			assert.equal(error instanceof PuzzleLockError, false)
			return true
		},
	)
})

test('an unknown clue and a duplicate lock are rejected', () => {
	const meta = metadata()
	assert.throws(
		() =>
			buildCasePuzzles(meta, sampleResult.answer, [
				lock('missing-clue'),
			]),
		(error: unknown) => {
			assert.ok(error instanceof PuzzleLockError)
			assert.match(error.publicMessage, /không có trong vụ án/)
			return true
		},
	)
	assert.throws(
		() =>
			buildCasePuzzles(meta, sampleResult.answer, [
				lock(sampleIds.clues.c1),
				lock(sampleIds.clues.c1),
			]),
		/nhiều hơn một lần/,
	)
})

test('suggest picks a required clue and skips ones already locked', () => {
	const meta = metadata()
	const first = suggestPuzzleLock(meta, sampleResult.answer, [])
	assert.ok(first)
	assert.equal(first.kind, 'scytale')
	assert.equal(first.hint, '')
	assert.equal(
		clueLockRole(meta, sampleResult.answer, first.clueId),
		'required',
	)
	const second = suggestPuzzleLock(meta, sampleResult.answer, [
		first.clueId,
	])
	if (second) {
		assert.notEqual(second.clueId, first.clueId)
	}
	assert.equal(listPuzzleKinds()[0]?.kind, 'scytale')
})

test('the clue step does not name a puzzle kind', () => {
	const source = readFileSync(
		new URL(
			'../../components/create-game/ClueList.tsx',
			import.meta.url,
		),
		'utf8',
	)
	assert.match(source, /listPuzzleKinds/)
	assert.doesNotMatch(source, /scytale/)
	assert.doesNotMatch(source, /caesar/)
})

test('a caesar lock stores the hint and the solver ignores it', () => {
	const meta = metadata()
	const built = buildCasePuzzles(meta, sampleResult.answer, [
		lock(sampleIds.clues.c1, 'caesar', '  Ngữ cảnh <b>đêm ấy</b>  '),
	])
	const clue = built.clues.find((item) => item.id === sampleIds.clues.c1)
	assert.ok(clue?.puzzle)
	assert.equal(clue.puzzle.kind, 'caesar')
	assert.equal(clue.puzzle.role, 'required')
	assert.equal(clue.puzzle.hint, 'Ngữ cảnh đêm ấy')
	if (clue.puzzle.kind !== 'caesar') return
	const sentence = clueToText(clue, built)
	assert.equal(
		decodeCaesar(clue.puzzle.cipher, clue.puzzle.shift),
		normalizeCaesarSentence(sentence),
	)
	assert.notEqual(clue.puzzle.shift, 0)
	const altered = {
		...built,
		clues: built.clues.map((item) =>
			item.puzzle
				? {
						...item,
						puzzle: {
							...item.puzzle,
							hint: 'Một gợi ý khác, vẫn chỉ là ngữ cảnh.',
						},
					}
				: item,
		),
	}
	assert.deepEqual(solveCase(meta), solveCase(built))
	assert.deepEqual(solveCase(built), solveCase(altered))
	assert.doesNotThrow(() => {
		assertUniquelySolvable(built, sampleResult.answer)
		assertUniquelySolvable(altered, sampleResult.answer)
	})
})

test('a blank or oversized hint is rejected before a cipher is stored', () => {
	const meta = metadata()
	assert.throws(
		() =>
			buildCasePuzzles(meta, sampleResult.answer, [
				lock(sampleIds.clues.c1, 'caesar', '   '),
			]),
		/gợi ý ngắn/,
	)
	assert.throws(
		() =>
			buildCasePuzzles(meta, sampleResult.answer, [
				lock(sampleIds.clues.c1, 'scytale', 'a'.repeat(201)),
			]),
		/gợi ý ngắn/,
	)
	assert.throws(
		() =>
			buildCasePuzzles(
				meta,
				sampleResult.answer,
				[lock(sampleIds.clues.c1, 'caesar')],
				() => '...',
			),
		(error: unknown) => {
			assert.ok(error instanceof PuzzleLockError)
			assert.match(error.publicMessage, /Caesar/)
			assert.match(error.publicMessage, /chữ cái/)
			return true
		},
	)
})
