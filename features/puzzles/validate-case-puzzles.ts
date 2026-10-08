import { checkUniquelySolvable } from '@/features/game/case-solver'
import { CaseNotSolvableError } from '@/features/game/game-errors'
import type {
	IAnswerAnswer,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

import { validatePuzzle } from './registry'
import type { PuzzleRole } from './puzzle-role'

export interface CluePuzzleReport {
	clueId: string
	role: PuzzleRole
	sentence: string
	decoded: string
	decodeMatches: boolean
	uniqueKey: boolean
	roleOk: boolean
	messages: string[]
}

export interface CasePuzzleReport {
	ok: boolean
	issues: string[]
	clues: CluePuzzleReport[]
}

function roleFailure (role: PuzzleRole): string {
	if (role === 'optional') {
		return [
			'Optional lock: the case must stay uniquely solvable',
			'without this clue.',
		].join(' ')
	}
	return [
		'Required lock: the case must not stay uniquely solvable',
		'without this clue.',
	].join(' ')
}

/**
 * Puzzle-layer gate beside `assertUniquelySolvable`.
 *
 * Each locked clue must decode to its canonical sentence, and its
 * role is checked with the existing solver:
 * - optional: removing that one clue still leaves one solution
 * - required: removing that one clue does not
 *
 * Clues with no puzzle are ignored. An empty list passes.
 */
export function validateCasePuzzles (
	metadata: IGameMetadata,
	result: IAnswerAnswer,
): CasePuzzleReport {
	const locked = metadata.clues.filter((clue) => clue.puzzle)
	if (locked.length === 0) {
		return { ok: true, issues: [], clues: [] }
	}

	const issues: string[] = []
	const full = checkUniquelySolvable(metadata, result)
	if (full.status !== 'valid') {
		issues.push(
			full.message ??
				'The case is not uniquely solvable with every clue.',
		)
	}

	const clues: CluePuzzleReport[] = []
	for (const clue of locked) {
		const puzzle = clue.puzzle
		if (!puzzle) continue
		const sentence = clueToText(clue, metadata)
		const shape = validatePuzzle(puzzle, sentence)
		const without: IGameMetadata = {
			...metadata,
			clues: metadata.clues.filter((item) => item.id !== clue.id),
		}
		const removed = checkUniquelySolvable(without, result)
		const roleOk =
			puzzle.role === 'optional'
				? removed.status === 'valid'
				: removed.status !== 'valid'
		const messages = [...shape.messages]
		if (!roleOk) messages.push(roleFailure(puzzle.role))
		if (messages.length > 0) {
			issues.push(`Clue ${clue.id}: ${messages.join(' ')}`)
		}
		clues.push({
			clueId: clue.id,
			role: puzzle.role,
			sentence,
			decoded: shape.decoded,
			decodeMatches: shape.decodeMatches,
			uniqueKey: shape.uniqueKey,
			roleOk,
			messages,
		})
	}

	return {
		ok: issues.length === 0,
		issues,
		clues,
	}
}

export function assertPuzzlesValid (
	metadata: IGameMetadata,
	result: IAnswerAnswer,
): void {
	const report = validateCasePuzzles(metadata, result)
	if (report.ok) return
	const detail = report.issues.slice(0, 3).join(' ')
	throw new CaseNotSolvableError(
		[
			'This case was rejected because a locked clue failed',
			'puzzle checks.',
			detail,
		].join(' '),
	)
}
