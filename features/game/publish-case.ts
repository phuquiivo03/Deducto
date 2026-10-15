import type { IGameMetadata } from '@/features/game/game.schemas'
import { assertUniquelySolvable } from '@/features/game/case-solver'
import { CaseNotSolvableError } from '@/features/game/game-errors'
import { expandAttributeVeils } from '@/lib/attribute-veil'
import { assertPuzzlesValid } from '@/features/puzzles/validate-case-puzzles'
import { buildCasePuzzles } from '@/features/puzzles/build-case-puzzles'
import type {
	ICreateGameInput,
	IAnswerAnswer,
	GameLevelStrict,
} from '@/features/game/game.schemas'

/**
 * Case body written by `createGame` after the publish gates.
 * Puzzles here were built on the server. Locks are not stored.
 */
export interface IPersistGameInput {
	title: string
	description: string
	banner: string
	level: GameLevelStrict
	gameMetadata: IGameMetadata
	result: IAnswerAnswer
}

/**
 * Reject a draft that is not uniquely solvable, build requested
 * locks, then reject the case if those locks fail puzzle checks.
 * Nothing is written here.
 */
export function publishCase (input: ICreateGameInput): IPersistGameInput {
	const expanded = expandAttributeVeils(
		input.gameMetadata,
		input.veils ?? [],
	)
	if (!expanded.ok) {
		throw new CaseNotSolvableError(expanded.message)
	}
	assertUniquelySolvable(expanded.metadata, input.result)
	const gameMetadata = buildCasePuzzles(
		expanded.metadata,
		input.result,
		input.locks ?? [],
	)
	assertPuzzlesValid(gameMetadata, input.result)
	return {
		title: input.title,
		description: input.description,
		banner: input.banner,
		level: input.level,
		gameMetadata,
		result: input.result,
	}
}
