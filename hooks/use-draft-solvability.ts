'use client'

import { useEffect, useMemo, useState } from 'react'

import { checkUniquelySolvable } from '@/features/game/case-solver'
import { solvabilityMessageVi } from '@/features/game/draft-solvability-messages'
import { reportPossibilities } from '@/features/game/possibility-report'
import { prepareMetadataForSolver } from '@/features/game/prepare-metadata-for-solver'
import type { IGameMetadata } from '@/features/game/game.schemas'
import type { SolutionTuple } from '@/features/game/case-solver'
import { attributeGaps } from '@/lib/attribute-rules'
import { expandAttributeVeils } from '@/lib/attribute-veil'
import { clueToText } from '@/lib/clues.helper'
import { useCreateGameStore } from '@/store/create-game.store'

const DEBOUNCE_MS = 300

export type DraftSolvabilityUiStatus =
	| 'valid'
	| 'invalid'
	| 'none'
	| 'ambiguous'
	| 'mismatch'
	| 'unknown'

interface DebouncedInput {
	metadata: IGameMetadata
	result: NonNullable<
		ReturnType<typeof useCreateGameStore.getState>['result']
	>
	veilMessage: string | null
}

export interface DraftSolvabilityView {
	status: DraftSolvabilityUiStatus
	messageVi: string | null
	isChecking: boolean
	canCreate: boolean
	countLabel: string | null
	possibilities: string[]
	suggestion: string | null
	conflicts: string[]
	attributeGaps: string[]
}

export function useDraftSolvability (): DraftSolvabilityView {
	const draft = useCreateGameStore((s) => s.draft)
	const result = useCreateGameStore((s) => s.result)
	const veils = useCreateGameStore((s) => s.veils)

	const input = useMemo((): DebouncedInput | null => {
		if (!draft || !result) return null
		const prepared = prepareMetadataForSolver(draft.gameMetadata)
		const expanded = expandAttributeVeils(prepared, veils)
		if (!expanded.ok) {
			return {
				metadata: prepared,
				result,
				veilMessage: expanded.message,
			}
		}
		return { metadata: expanded.metadata, result, veilMessage: null }
	}, [draft, result, veils])

	const [debounced, setDebounced] = useState<DebouncedInput | null>(
		input,
	)
	const [isChecking, setIsChecking] = useState(false)

	useEffect(() => {
		if (!input) {
			setDebounced(null)
			setIsChecking(false)
			return
		}
		setIsChecking(true)
		const timer = window.setTimeout(() => {
			setDebounced(input)
			setIsChecking(false)
		}, DEBOUNCE_MS)
		return () => {
			window.clearTimeout(timer)
		}
	}, [input])

	const check = useMemo(() => {
		if (!debounced || debounced.veilMessage) return null
		return checkUniquelySolvable(debounced.metadata, debounced.result)
	}, [debounced])

	const report = useMemo(() => {
		if (!debounced || debounced.veilMessage) return null
		return reportPossibilities(debounced.metadata)
	}, [debounced])

	const gaps = useMemo(() => {
		if (!draft) return []
		return attributeGaps(draft.gameMetadata).map((gap) => gap.labelVi)
	}, [draft])

	if (!draft || !result) {
		return emptyView(false)
	}

	if (debounced?.veilMessage && !isChecking) {
		return {
			status: 'invalid',
			messageVi: debounced.veilMessage,
			isChecking: false,
			canCreate: false,
			countLabel: null,
			possibilities: [],
			suggestion: null,
			conflicts: [],
			attributeGaps: gaps,
		}
	}

	if (isChecking || !check || !report || !debounced) {
		return {
			...emptyView(true),
			attributeGaps: gaps,
		}
	}

	const countLabel = report.truncated
		? `Còn hơn ${report.count} khả năng`
		: `Còn ${report.count} khả năng`

	return {
		status: check.status,
		messageVi: solvabilityMessageVi(check),
		isChecking: false,
		canCreate: check.status === 'valid' && gaps.length === 0,
		countLabel,
		possibilities: report.tuples.map((tuple) =>
			formatTuple(debounced.metadata, tuple),
		),
		suggestion: report.suggestion,
		conflicts: report.conflictIndexes.map((index) =>
			conflictLabel(debounced.metadata, index),
		),
		attributeGaps: gaps,
	}
}

function emptyView (isChecking: boolean): DraftSolvabilityView {
	return {
		status: 'unknown',
		messageVi: null,
		isChecking,
		canCreate: false,
		countLabel: null,
		possibilities: [],
		suggestion: null,
		conflicts: [],
		attributeGaps: [],
	}
}

function formatTuple (
	metadata: IGameMetadata,
	tuple: SolutionTuple,
): string {
	const name = (
		items: { id: string; name: string }[],
		id: string,
	) => items.find((item) => item.id === id)?.name ?? '…'
	return [
		name(metadata.suspects, tuple.murderId),
		name(metadata.weapons, tuple.weaponId),
		name(metadata.locations, tuple.locationId),
		name(metadata.motives, tuple.motiveId),
	].join(' — ')
}

function conflictLabel (metadata: IGameMetadata, index: number): string {
	const clue = metadata.clues[index]
	const sentence = clue
		? clueToText(clue, metadata)
		: 'Manh mối không đọc được.'
	return `Manh mối #${index + 1}: ${sentence}`
}
