import type { CluePuzzle, PuzzleShapeCheck } from '@/features/puzzles/types'
import type { PuzzleRole } from '@/features/puzzles/puzzle-role'
import {
	generateScytalePuzzle,
	validateScytalePuzzle,
} from '@/features/puzzles/scytale/scytale'

/**
 * Logic registry. UI lives in `registry-ui.tsx` so server code does
 * not import a client component.
 *
 * To add a kind:
 * 1. Create `features/puzzles/<kind>/` with types, generator,
 *    validator, and a solve component.
 * 2. Add the zod schema to `schema.ts`.
 * 3. Register generate/validate here and the component in
 *    `registry-ui.tsx`.
 */
export const puzzleRegistry = {
	scytale: {
		kind: 'scytale' as const,
		generate: generateScytalePuzzle,
		validate: validateScytalePuzzle,
	},
}

export type PuzzleKind = keyof typeof puzzleRegistry

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

function unexpectedKind (kind: never): never {
	throw new Error(`Unknown puzzle kind: ${String(kind)}`)
}
