import type {
	IAnswerAnswer,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

import { clueLockRole } from './clue-lock-role'
import type { PuzzleLockRequest } from './lock-request'
import {
	listPuzzleKinds,
	puzzleRegistry,
	type PuzzleKind,
} from './registry'

interface Candidate {
	clueId: string
	kind: PuzzleKind
	length: number
	required: boolean
}

/**
 * Pick one unlocked clue and a registry kind that can wrap it.
 * Prefers a clue the case cannot lose, then a longer sentence.
 * Kind order follows the registry, so a new kind needs no wizard edit.
 */
export function suggestPuzzleLock (
	metadata: IGameMetadata,
	result: IAnswerAnswer,
	lockedIds: readonly string[],
): PuzzleLockRequest | null {
	const kinds = listPuzzleKinds()
	if (kinds.length === 0) return null
	const taken = new Set(lockedIds)
	const candidates: Candidate[] = []

	for (const clue of metadata.clues) {
		if (taken.has(clue.id)) continue
		const sentence = clueToText(clue, metadata)
		const kind = kinds.find((option) =>
			puzzleRegistry[option.kind].canGenerate(sentence),
		)
		if (!kind) continue
		const role = clueLockRole(metadata, result, clue.id)
		candidates.push({
			clueId: clue.id,
			kind: kind.kind,
			length: Array.from(sentence).length,
			required: role === 'required',
		})
	}

	const required = candidates.filter((item) => item.required)
	const pool = required.length > 0 ? required : candidates
	pool.sort((a, b) => b.length - a.length)
	const best = pool[0]
	if (!best) return null
	return { clueId: best.clueId, kind: best.kind }
}
