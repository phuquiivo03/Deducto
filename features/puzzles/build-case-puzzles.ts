import type {
	IAnswerAnswer,
	IClue,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

import { clueLockRole } from './clue-lock-role'
import {
	PUZZLE_HINT_MAX,
	sanitizePuzzleHint,
} from './hint'
import type { PuzzleLockRequest } from './lock-request'
import {
	generatePuzzle,
	puzzleFailureReason,
	puzzleRegistry,
} from './registry'

const PREVIEW_LIMIT = 90

export class PuzzleLockError extends Error {
	constructor (message: string) {
		super(message)
		this.name = 'PuzzleLockError'
	}

	/**
	 * Creator-facing text. A class field would be reset by the
	 * TypeScript field initializer, so this reads `message`.
	 */
	get publicMessage (): string {
		return this.message
	}
}

export function puzzleLockPublicMessage (
	error: unknown,
): string | null {
	if (error instanceof PuzzleLockError) return error.publicMessage
	return null
}

type SentenceOf = (
	clue: IClue,
	metadata: IGameMetadata,
) => string

function withoutPuzzles (metadata: IGameMetadata): IGameMetadata {
	return {
		...metadata,
		clues: metadata.clues.map((clue) => {
			const next = { ...clue }
			delete next.puzzle
			return next
		}),
	}
}

function previewSentence (sentence: string): string {
	const trimmed = sentence.trim()
	if (trimmed.length <= PREVIEW_LIMIT) return trimmed
	return `${trimmed.slice(0, PREVIEW_LIMIT - 1)}…`
}

/**
 * Attach server-built puzzles for the requested locks.
 *
 * Client ciphers and roles on the clues are discarded. Role comes
 * from `clueLockRole`. Generation uses the registry and the canonical
 * sentence. The creator hint is stored on the puzzle and is not read
 * by the solver. An empty lock list returns the case with no puzzles.
 */
export function buildCasePuzzles (
	metadata: IGameMetadata,
	result: IAnswerAnswer,
	locks: readonly PuzzleLockRequest[],
	sentenceOf: SentenceOf = clueToText,
): IGameMetadata {
	const base = withoutPuzzles(metadata)
	if (locks.length === 0) return base

	const seen = new Set<string>()
	for (const lock of locks) {
		if (seen.has(lock.clueId)) {
			const index = base.clues.findIndex(
				(clue) => clue.id === lock.clueId,
			)
			const which = index >= 0 ? `Manh mối ${index + 1}` : 'Manh mối'
			throw new PuzzleLockError(
				`${which} được khóa nhiều hơn một lần.`,
			)
		}
		seen.add(lock.clueId)
	}

	const clues = base.clues.map((clue) => ({ ...clue }))
	for (const lock of locks) {
		const index = clues.findIndex((clue) => clue.id === lock.clueId)
		if (index < 0) {
			throw new PuzzleLockError(
				'Không khóa được: manh mối không có trong vụ án.',
			)
		}
		const clue = clues[index]
		if (!clue) continue
		const sentence = sentenceOf(clue, base)
		const role = clueLockRole(base, result, clue.id)
		const label = puzzleRegistry[lock.kind].label
		const hint = sanitizePuzzleHint(lock.hint)
		if (hint.length < 1 || hint.length > PUZZLE_HINT_MAX) {
			throw new PuzzleLockError(
				[
					`Manh mối ${index + 1} cần một gợi ý ngắn,`,
					`tối đa ${PUZZLE_HINT_MAX} ký tự.`,
				].join(' '),
			)
		}
		try {
			const puzzle = {
				...generatePuzzle(lock.kind, sentence, role),
				hint,
			}
			clues[index] = { ...clue, puzzle }
		} catch (error) {
			const reason = puzzleFailureReason(lock.kind, error)
			if (!reason) throw error
			throw new PuzzleLockError(
				[
					`Không khóa được manh mối ${index + 1}`,
					`bằng ${label}`,
					`(“${previewSentence(sentence)}”): ${reason}`,
				].join(' '),
			)
		}
	}

	return { ...base, clues }
}
