import { randomUUID } from 'node:crypto'

import {
	ICreateGameInput,
	IGame,
	IGeneratedCase,
	GameLevelStrict,
	IAiCaseDraft,
	IShortGame,
	entityCountForLevel,
	parseAiCaseDraft,
} from '@/features/game/game.schemas'
import { extractJson } from '@/lib/extract-json'
import gameRepositories from './game.repositories'
import submissionRepositories from '../submission/submission.repositories'
import { assertUniquelySolvable } from './case-solver'
import { assertPuzzlesValid } from '@/features/puzzles/validate-case-puzzles'
import { publishCase } from './publish-case'
import { normalizeDraft } from './case-draft'
import { generateCaseLogic } from './case-generator'
import { GameNotFoundError } from './game-errors'
import { canReadGame, publicCatalog } from './game-visibility'
import type { GameVisibility } from './game-visibility'
import { getSessionUserId } from '@/features/user/user.auth'

const getById = async (id: string): Promise<IGame> => {
	const game = await gameRepositories.getGame(id)
	if (!game) {
		throw new GameNotFoundError()
	}
	if (!(await canViewerRead(game, id))) {
		throw new GameNotFoundError()
	}
	return game
}

async function canViewerRead (game: IGame, id: string): Promise<boolean> {
	const viewerId = game.visibility === 'public'
		? null
		: await getSessionUserId()
	const isCreator = Boolean(
		viewerId &&
			viewerId.toLowerCase() === game.creator.toLowerCase(),
	)
	const hasSolved = viewerId && !isCreator
		? Boolean(
			await submissionRepositories.findByUserAndGame(viewerId, id),
		)
		: false
	return canReadGame({
		visibility: game.visibility,
		creatorId: game.creator,
		viewerId,
		hasSolved,
	})
}
const isResolved = async (userId: string, gameId: string): Promise<boolean> => {
	const submission = await submissionRepositories.findByUserAndGame(
		userId,
		gameId,
	)
	if (!submission) {
		return false
	}
	return true
}

async function fetchAiDraft(
	requestText: string,
	level: GameLevelStrict,
): Promise<IAiCaseDraft> {
	let lastError: unknown = null
	for (let attempt = 0; attempt < 2; attempt += 1) {
		const raw = await gameRepositories.askAi(requestText)
		let parsed: unknown
		try {
			parsed = JSON.parse(extractJson(raw))
		} catch (err) {
			lastError = err
			continue
		}
		const draft = parseAiCaseDraft(parsed, level)
		if (draft.success) {
			return draft.data
		}
		lastError = draft.error
		console.error('generate: draft schema failed', draft.error)
	}
	throw new Error(
		lastError instanceof Error
			? lastError.message
			: 'Generated case did not match the entity schema',
	)
}

const generate = async (
	prompt: string,
	level: GameLevelStrict,
	userId: string,
): Promise<IGeneratedCase> => {
	const createdAt = new Date().toISOString()
	const n = entityCountForLevel(level)
	const requestText = [
		`Level: ${level}`,
		`Entity count N: ${n}`,
		`Creator: ${userId}`,
		`Created at: ${createdAt}`,
		'',
		prompt,
	].join('\n')

	const draft = await fetchAiDraft(requestText, level)
	const entities = normalizeDraft(draft, level)
	const { clues, result } = generateCaseLogic(entities, level)

	const gameId = randomUUID()
	const metaId = randomUUID()
	const generated: IGeneratedCase = {
		game: {
			id: gameId,
			creator: userId,
			title: entities.title,
			description: entities.description,
			banner: entities.banner,
			level,
			visibility: 'private',
			created_at: createdAt,
			gameMetadata: {
				id: metaId,
				suspects: entities.suspects,
				locations: entities.locations,
				weapons: entities.weapons,
				motives: entities.motives,
				clues,
			},
		},
		result,
	}

	assertUniquelySolvable(generated.game.gameMetadata, generated.result)
	assertPuzzlesValid(generated.game.gameMetadata, generated.result)

	return generated
}

const create = async (
	input: ICreateGameInput,
	creatorId: string,
): Promise<string> => {
	const prepared = publishCase(input)
	return gameRepositories.createGame(prepared, creatorId)
}

const findPublic = async (): Promise<IShortGame[]> => {
	return publicCatalog(await gameRepositories.findPublic())
}

const findSolved = async (userId: string): Promise<IShortGame[]> => {
	const res = await gameRepositories.findResolved(userId)
	return res
}

const findByUserId = async (userId: string): Promise<IShortGame[]> => {
	const res = await gameRepositories.findByUserId(userId)
	console.log(res)
	return res
}

const updateVisibility = async (
	gameId: string,
	userId: string,
	visibility: GameVisibility,
): Promise<boolean> => {
	return gameRepositories.updateVisibility(gameId, userId, visibility)
}

const gameServices = {
	getById,
	isResolved,
	generate,
	create,
	findPublic,
	findSolved,
	findByUserId,
	updateVisibility,
}

export default gameServices
