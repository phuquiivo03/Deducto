'use client'

import { useEffect, useMemo, useState } from 'react'

import {
	checkUniquelySolvable,
	type DraftSolvabilityStatus,
} from '@/features/game/case-solver'
import { solvabilityMessageVi } from '@/features/game/draft-solvability-messages'
import { prepareMetadataForSolver } from '@/features/game/prepare-metadata-for-solver'
import { useCreateGameStore } from '@/store/create-game.store'

const DEBOUNCE_MS = 300

export type DraftSolvabilityUiStatus = DraftSolvabilityStatus | 'unknown'

interface DebouncedInput {
	metadata: ReturnType<typeof prepareMetadataForSolver>
	result: NonNullable<ReturnType<typeof useCreateGameStore.getState>['result']>
}

export function useDraftSolvability(): {
	status: DraftSolvabilityUiStatus
	messageVi: string | null
	isChecking: boolean
	canCreate: boolean
} {
	const draft = useCreateGameStore((s) => s.draft)
	const result = useCreateGameStore((s) => s.result)

	const input = useMemo((): DebouncedInput | null => {
		if (!draft || !result) {
			return null
		}
		return {
			metadata: prepareMetadataForSolver(draft.gameMetadata),
			result,
		}
	}, [draft, result])

	const [debounced, setDebounced] = useState<DebouncedInput | null>(input)
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
		if (!debounced) {
			return null
		}
		return checkUniquelySolvable(debounced.metadata, debounced.result)
	}, [debounced])

	if (!draft || !result) {
		return {
			status: 'unknown',
			messageVi: null,
			isChecking: false,
			canCreate: false,
		}
	}

	if (isChecking) {
		return {
			status: 'unknown',
			messageVi: null,
			isChecking: true,
			canCreate: false,
		}
	}

	if (!check) {
		return {
			status: 'unknown',
			messageVi: null,
			isChecking: false,
			canCreate: false,
		}
	}

	return {
		status: check.status,
		messageVi: solvabilityMessageVi(check),
		isChecking: false,
		canCreate: check.status === 'valid',
	}
}
