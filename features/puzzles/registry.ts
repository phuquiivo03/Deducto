import { z } from 'zod'

import {
	caesarCipherText,
	caesarDecodes,
	caesarFailureReason,
	caesarReadingMatches,
	canGenerateCaesar,
	generateCaesarPuzzle,
	toPlayerCaesarPuzzle,
	validateCaesarPuzzle,
} from '@/features/puzzles/caesar/caesar'
import type {
	CluePuzzle,
	PlayerPuzzle,
	PuzzleShapeCheck,
} from '@/features/puzzles/types'
import type { PuzzleRole } from '@/features/puzzles/puzzle-role'
import {
	canGenerateScytale,
	generateScytalePuzzle,
	scytaleCipherText,
	scytaleDecodes,
	scytaleFailureReason,
	scytaleReadingMatches,
	toPlayerScytalePuzzle,
	validateScytalePuzzle,
} from '@/features/puzzles/scytale/scytale'

/**
 * Logic registry. UI lives in `registry-ui.tsx` so server code does
 * not import a client component.
 *
 * To add a kind:
 * 1. Create `features/puzzles/<kind>/` with types, generator,
 *    validator, player projection, and a solve tool.
 * 2. Add both zod schemas to `schema.ts`. Hint stays optional on the
 *    stored schema. New locks require a hint in `lock-request.ts`.
 * 3. Register generate, validate, canGenerate, toPlayer, cipherText,
 *    decodes, readingMatches, label, and failureReason here, and the
 *    tool component in `registry-ui.tsx`.
 * The create wizard lists `listPuzzleKinds()`. The solve popup lists
 * the same kinds as tools. Neither file names a kind of its own.
 * The solver never reads `hint` or the cipher.
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
		cipherText: scytaleCipherText,
		decodes: scytaleDecodes,
		readingMatches: scytaleReadingMatches,
	},
	caesar: {
		kind: 'caesar' as const,
		label: 'Caesar',
		generate: generateCaesarPuzzle,
		validate: validateCaesarPuzzle,
		canGenerate: canGenerateCaesar,
		toPlayer: toPlayerCaesarPuzzle,
		failureReason: caesarFailureReason,
		cipherText: caesarCipherText,
		decodes: caesarDecodes,
		readingMatches: caesarReadingMatches,
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
		case 'caesar':
			return puzzleRegistry.caesar.validate(puzzle, sentence)
		default:
			return unexpectedKind(puzzle)
	}
}

export function toPlayerPuzzle (puzzle: CluePuzzle): PlayerPuzzle {
	switch (puzzle.kind) {
		case 'scytale':
			return puzzleRegistry.scytale.toPlayer(puzzle)
		case 'caesar':
			return puzzleRegistry.caesar.toPlayer(puzzle)
		default:
			return unexpectedKind(puzzle)
	}
}

export function puzzleCipherText (
	puzzle: CluePuzzle | PlayerPuzzle,
): string {
	switch (puzzle.kind) {
		case 'scytale':
			return puzzleRegistry.scytale.cipherText(puzzle)
		case 'caesar':
			return puzzleRegistry.caesar.cipherText(puzzle)
		default:
			return unexpectedKind(puzzle)
	}
}

export function puzzleDecodes (
	kind: PuzzleKind,
	cipher: string,
	sentence: string,
): boolean {
	return puzzleRegistry[kind].decodes(cipher, sentence)
}

export function readingMatchesSentence (
	kind: PuzzleKind,
	reading: string,
	sentence: string,
): boolean {
	return puzzleRegistry[kind].readingMatches(reading, sentence)
}

/**
 * Kinds whose tool can turn `cipher` into the canonical sentence.
 * A wrong kind returns an empty contribution: gibberish, not an error.
 */
export function decodingKinds (
	cipher: string,
	sentence: string,
): PuzzleKind[] {
	return listPuzzleKinds()
		.map((option) => option.kind)
		.filter((kind) => puzzleDecodes(kind, cipher, sentence))
}

export function puzzleFailureReason (
	kind: PuzzleKind,
	error: unknown,
): string | null {
	return puzzleRegistry[kind].failureReason(error)
}

function unexpectedKind (puzzle: never): never {
	throw new Error(`Unknown puzzle kind: ${JSON.stringify(puzzle)}`)
}
