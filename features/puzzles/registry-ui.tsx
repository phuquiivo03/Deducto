'use client'

import type { PlayerPuzzle } from '@/features/puzzles/types'

import { ScytaleSolveModal } from './scytale/scytale-solve-modal'

export interface PuzzleSolveModalProps {
	puzzle: PlayerPuzzle
	sentence: string
	onClose: () => void
	onSolved: () => void
}

/**
 * Opens the solve screen for whatever kind is locked on the clue.
 * Register a new component in the switch when a kind is added.
 */
export function PuzzleSolveModal ({
	puzzle,
	sentence,
	onClose,
	onSolved,
}: PuzzleSolveModalProps) {
	switch (puzzle.kind) {
		case 'scytale':
			return (
				<ScytaleSolveModal
					puzzle={puzzle}
					sentence={sentence}
					onClose={onClose}
					onSolved={onSolved}
				/>
			)
		default:
			return unexpectedKind(puzzle.kind)
	}
}

function unexpectedKind (kind: never): never {
	throw new Error(`Unknown puzzle kind: ${String(kind)}`)
}
