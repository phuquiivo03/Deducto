import { z } from 'zod'

import type {
	CluePuzzle,
	PlayerPuzzle,
	PuzzleShapeCheck,
} from '@/features/puzzles/types'
import type { PuzzleRole } from '@/features/puzzles/puzzle-role'
import {
	canGenerateScytale,
	generateScytalePuzzle,
	scytaleFailureReason,
	toPlayerScytalePuzzle,
	validateScytalePuzzle,
} from '@/features/puzzles/scytale/scytale'

/**
 * Logic registry. UI lives in `registry-ui.tsx` so server code does
 * not import a client component.
 *
 * To add a kind:
 * 1. Create `features/puzzles/<kind>/` with types, generator,
 *    validator, player projection, and a solve component.
 * 2. Add both zod schemas to `schema.ts`.
 * 3. Register generate, validate, canGenerate, toPlayer, label,
 *    and failureReason here, and the component in `registry-ui.tsx`.
 * The create wizard lists `listPuzzleKinds()` and does not name kinds.
 */
export const puzzleRegistry = {
	scytale: {
		kind: 'scytale' as const,
		label: 'Scytale',
		generate: generateScytalePuzzle,
		validate: validateScytalePuzzle,
		canGenerate: canGenerateScytale,
		toPlayer: toPlayerScytalePuzzle,
		failureReason: scytaleFailureReason,
	},
}

export type PuzzleKind = keyof typeof puzzleRegistry

const puzzleKinds = Object.keys(puzzleRegistry) as [
	PuzzleKind,
	...PuzzleKind[],
]

export const puzzleKindSchema = z.enum(puzzleKinds)

export interface PuzzleKindOption {
	kind: PuzzleKind
	label: string
}

export function listPuzzleKinds (): PuzzleKindOption[] {
	return Object.values(puzzleRegistry).map((entry) => ({
		kind: entry.kind,
		label: entry.label,
	}))
}

export function generatePuzzle (
	kind: PuzzleKind,
	sentence: string,
	role: PuzzleRole,
): CluePuzzle {
	return puzzleRegistry[kind].generate(sentence, role)
}

export function validatePuzzle (
	puzzle: CluePuzzle,
	sentence: string,
): PuzzleShapeCheck {
	switch (puzzle.kind) {
		case 'scytale':
			return puzzleRegistry.scytale.validate(puzzle, sentence)
		default:
			return unexpectedKind(puzzle.kind)
	}
}

export function toPlayerPuzzle (puzzle: CluePuzzle): PlayerPuzzle {
	switch (puzzle.kind) {
		case 'scytale':
			return puzzleRegistry.scytale.toPlayer(puzzle)
		default:
			return unexpectedKind(puzzle.kind)
	}
}

export function puzzleFailureReason (
	kind: PuzzleKind,
	error: unknown,
): string | null {
	return puzzleRegistry[kind].failureReason(error)
}

function unexpectedKind (kind: never): never {
	throw new Error(`Unknown puzzle kind: ${String(kind)}`)
}
