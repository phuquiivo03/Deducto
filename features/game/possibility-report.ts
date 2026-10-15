import type { IGameMetadata } from '@/features/game/game.schemas'
import { suggestDistinction } from '@/lib/attribute-rules'

import {
	searchSolutions,
	solveCase,
	type SolutionTuple,
	type SolveStatus,
} from './case-solver'

/** Exact counts up to this many. Beyond it the panel says "more than". */
const CAP = 48

/** List the remaining tuples only while the set is still small. */
const LIST_MAX = 6

export interface PossibilityReport {
	status: SolveStatus
	count: number
	truncated: boolean
	tuples: SolutionTuple[]
	issues: string[]
	conflictIndexes: number[]
	suggestion: string | null
}

/**
 * Live wizard view of the deduction: how many answers remain, a short
 * list, a distinguishing attribute, and the clues that contradict.
 */
export function reportPossibilities (
	metadata: IGameMetadata,
): PossibilityReport {
	const found = searchSolutions(metadata, CAP + 1)
	const truncated = found.tuples.length > CAP
	const tuples = truncated ? found.tuples.slice(0, CAP) : found.tuples
	const suggestion =
		!truncated && tuples.length > 1
			? suggestDistinction(metadata, tuples)
			: null
	return {
		status: found.status,
		count: tuples.length,
		truncated,
		tuples:
			!truncated && tuples.length <= LIST_MAX ? tuples : [],
		issues: found.issues,
		conflictIndexes:
			found.status === 'none' || found.status === 'invalid'
				? conflictingIndexes(metadata)
				: [],
		suggestion,
	}
}

function conflictingIndexes (metadata: IGameMetadata): number[] {
	const baseline = solveCase(metadata)
	if (baseline.status === 'none') {
		return minimalUnsat(metadata)
	}
	if (baseline.status === 'invalid') {
		return indexesFromIssues(baseline.issues)
	}
	return []
}

function indexesFromIssues (issues: string[]): number[] {
	const found = new Set<number>()
	for (const issue of issues) {
		const match = /Clue (\d+)/.exec(issue)
		if (!match?.[1]) continue
		const index = Number(match[1]) - 1
		if (index >= 0) found.add(index)
	}
	return [...found]
}

/**
 * Delete clues that are not required for the contradiction. What
 * remains is one minimal set the wizard can name.
 */
function minimalUnsat (metadata: IGameMetadata): number[] {
	const clues = metadata.clues
	const unsat = (indexes: number[]): boolean => {
		if (indexes.length === 0) return false
		const outcome = solveCase({
			...metadata,
			clues: indexes.map((index) => clues[index]!),
		})
		return outcome.status === 'none'
	}

	let active = clues.map((_, index) => index)
	if (!unsat(active)) return []

	for (const index of [...active]) {
		const next = active.filter((item) => item !== index)
		if (unsat(next)) active = next
	}
	return active
}
