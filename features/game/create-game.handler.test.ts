import assert from 'node:assert/strict'
import test from 'node:test'

import { sampleGame, sampleResult } from '@/data/sample-be'
import { sampleIds } from '@/data/sample-ids'
import type { IGameMetadata } from '@/features/game/game.schemas'
import { clueWriteData } from '@/features/game/clue-write'
import { publishCase } from '@/features/game/publish-case'
import type { IPersistGameInput } from '@/features/game/publish-case'
import { buildCasePuzzles } from '@/features/puzzles/build-case-puzzles'
import {
	decodeCaesar,
	normalizeCaesarSentence,
} from '@/features/puzzles/caesar/caesar'
import { decodeScytale } from '@/features/puzzles/scytale/scytale'
import { clueToText } from '@/lib/clues.helper'

import { handleCreateGamePost } from './create-game.handler'

function metadata (): IGameMetadata {
	const value = sampleGame.gameMetadata
	if (typeof value === 'string') {
		throw new Error('sample metadata must be an object')
	}
	return value
}

const HINT = 'Ghi chép về ông Arthur trong đêm xảy ra vụ án.'

function body (
	locks?: { clueId: string; kind: 'scytale' | 'caesar'; hint: string }[],
	extraClue?: Record<string, unknown>,
) {
	const meta = metadata()
	return {
		title: sampleGame.title,
		description: sampleGame.description,
		banner: sampleGame.banner,
		level: 'easy',
		gameMetadata: {
			...meta,
			clues: meta.clues.map((clue, index) =>
				index === 0 && extraClue ? { ...clue, ...extraClue } : clue,
			),
		},
		result: sampleResult.answer,
		locks,
	}
}

function post (payload: unknown): Request {
	return new Request('http://localhost/api/game', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
}

test('POST /api/game persists a server-built puzzle and ignores a client cipher', async () => {
	const saved: IPersistGameInput[] = []
	const response = await handleCreateGamePost(
		post(
			body(
				[{ clueId: sampleIds.clues.c1, kind: 'scytale', hint: HINT }],
				{
					puzzle: {
						kind: 'scytale',
						role: 'optional',
						columns: 2,
						strip: 'hacked',
					},
				},
			),
		),
		{
			getSessionUserId: async () => sampleIds.user,
			createGame: async (input) => {
				const prepared = publishCase(input)
				saved.push(prepared)
				return 'created-game'
			},
		},
	)
	assert.equal(response.status, 201)
	const json = (await response.json()) as { data: { id: string } }
	assert.equal(json.data.id, 'created-game')
	const prepared = saved[0]
	assert.ok(prepared)
	const clue = prepared.gameMetadata.clues.find(
		(item) => item.id === sampleIds.clues.c1,
	)
	assert.ok(clue?.puzzle)
	assert.equal(clue.puzzle.role, 'required')
	assert.equal(clue.puzzle.kind, 'scytale')
	assert.equal(clue.puzzle.hint, HINT)
	if (clue.puzzle.kind !== 'scytale') return
	assert.notEqual(clue.puzzle.strip, 'hacked')
	const sentence = clueToText(clue, prepared.gameMetadata)
	assert.equal(
		decodeScytale(clue.puzzle.strip, clue.puzzle.columns),
		sentence,
	)
	const row = clueWriteData(clue, (id) => `new-${id}`)
	assert.equal(row.puzzle?.kind, 'scytale')
	assert.equal(row.id, `new-${sampleIds.clues.c1}`)
	const unlocked = prepared.gameMetadata.clues.find(
		(item) => item.id === sampleIds.clues.c2,
	)
	assert.ok(unlocked)
	assert.equal(unlocked.puzzle, undefined)
	assert.equal(clueWriteData(unlocked, (id) => id).puzzle, undefined)
})

test('POST /api/game persists a Caesar lock and its hint', async () => {
	const saved: IPersistGameInput[] = []
	const response = await handleCreateGamePost(
		post(
			body([
				{
					clueId: sampleIds.clues.c1,
					kind: 'caesar',
					hint: `  ${HINT}  `,
				},
			]),
		),
		{
			getSessionUserId: async () => sampleIds.user,
			createGame: async (input) => {
				saved.push(publishCase(input))
				return 'caesar-game'
			},
		},
	)
	assert.equal(response.status, 201)
	const prepared = saved[0]
	assert.ok(prepared)
	const clue = prepared.gameMetadata.clues.find(
		(item) => item.id === sampleIds.clues.c1,
	)
	assert.ok(clue?.puzzle)
	assert.equal(clue.puzzle.kind, 'caesar')
	assert.equal(clue.puzzle.role, 'required')
	assert.equal(clue.puzzle.hint, HINT)
	if (clue.puzzle.kind !== 'caesar') return
	assert.notEqual(clue.puzzle.shift, 0)
	assert.equal(
		decodeCaesar(clue.puzzle.cipher, clue.puzzle.shift),
		normalizeCaesarSentence(
			clueToText(clue, prepared.gameMetadata),
		),
	)
})

test('POST /api/game rejects a lock that has no hint', async () => {
	let writes = 0
	const payload = body()
	const response = await handleCreateGamePost(
		post({
			...payload,
			locks: [{ clueId: sampleIds.clues.c1, kind: 'caesar' }],
		}),
		{
			getSessionUserId: async () => sampleIds.user,
			createGame: async () => {
				writes += 1
				return 'nope'
			},
		},
	)
	assert.equal(response.status, 400)
	assert.equal(writes, 0)
	const json = (await response.json()) as { success: boolean }
	assert.equal(json.success, false)
})

test('POST /api/game returns 400 and stores nothing when a lock cannot be built', async () => {
	let writes = 0
	const response = await handleCreateGamePost(
		post(body([{ clueId: sampleIds.clues.c1, kind: 'scytale', hint: HINT }])),
		{
			getSessionUserId: async () => sampleIds.user,
			createGame: async (input) => {
				buildCasePuzzles(
					input.gameMetadata,
					input.result,
					input.locks ?? [],
					() => 'aaaaaa',
				)
				writes += 1
				return 'should-not-save'
			},
		},
	)
	assert.equal(response.status, 400)
	assert.equal(writes, 0)
	const json = (await response.json()) as {
		success: boolean
		message: string
	}
	assert.equal(json.success, false)
	assert.match(json.message, /manh mối 1/)
	assert.match(json.message, /đường kính/)
	assert.equal(json.message.includes('hacked'), false)
})

test('POST /api/game still rejects an unsolvable case without storing it', async () => {
	let writes = 0
	const payload = body()
	payload.gameMetadata = {
		...payload.gameMetadata,
		clues: [],
	}
	const response = await handleCreateGamePost(post(payload), {
		getSessionUserId: async () => sampleIds.user,
		createGame: async (input) => {
			publishCase(input)
			writes += 1
			return 'nope'
		},
	})
	assert.equal(response.status, 500)
	assert.equal(writes, 0)
	const json = (await response.json()) as { message: string }
	assert.equal(json.message, 'Không thể tạo trò chơi')
	assert.equal(json.message.includes('rejected'), false)
})

test('POST /api/game with no locks persists clues without puzzles', async () => {
	const saved: IPersistGameInput[] = []
	const response = await handleCreateGamePost(post(body()), {
		getSessionUserId: async () => sampleIds.user,
		createGame: async (input) => {
			saved.push(publishCase(input))
			return 'open-case'
		},
	})
	assert.equal(response.status, 201)
	const prepared = saved[0]
	assert.ok(prepared)
	assert.equal(
		prepared.gameMetadata.clues.every((clue) => clue.puzzle === undefined),
		true,
	)
})

test('POST /api/game requires a session', async () => {
	let writes = 0
	const response = await handleCreateGamePost(post(body()), {
		getSessionUserId: async () => null,
		createGame: async () => {
			writes += 1
			return 'nope'
		},
	})
	assert.equal(response.status, 401)
	assert.equal(writes, 0)
})
