import { PuzzleGenerateError } from '@/features/puzzles/generate-error'
import type { PuzzleRole } from '@/features/puzzles/puzzle-role'
import type { PuzzleShapeCheck } from '@/features/puzzles/types'

import type { ScytalePlayerPuzzle, ScytalePuzzle } from './types'

export { PuzzleGenerateError }

/**
 * Scytale transposition.
 *
 * The sentence is written in rows of `columns` letters (the last row
 * may be short). The strip is those columns read top to bottom.
 * Wrapping the strip on a rod of the same diameter and reading each
 * row left to right restores the sentence.
 *
 * Keys of 1 and of `length` are the identity permutation, so they are
 * not offered and are not counted as solutions. Uniqueness is not a
 * theorem of the cipher: some strings (for example a run of the same
 * letter) spell the sentence at every diameter. The generator walks
 * candidate diameters and the validator exhaustively rejects a strip
 * when any second diameter in `2 .. length-1` also decodes to the
 * sentence. Both are deterministic and use no randomness.
 */
export function codePoints (text: string): string[] {
	return Array.from(text)
}

export function scytaleKeyRange (
	length: number,
): { min: number; max: number } | null {
	if (length < 4) return null
	return { min: 2, max: length - 1 }
}

export function columnHeights (
	length: number,
	columns: number,
): number[] {
	const rows = Math.ceil(length / columns)
	const remainder = length % columns
	return Array.from({ length: columns }, (_, column) => {
		if (remainder === 0) return rows
		return column < remainder ? rows : rows - 1
	})
}

/**
 * Place a ciphertext strip onto a rod with `columns` faces.
 * Empty strings are the short cells of the last row.
 */
export function placeScytale (
	strip: string,
	columns: number,
): string[][] {
	const chars = codePoints(strip)
	const length = chars.length
	if (
		!Number.isInteger(columns) ||
		columns < 1 ||
		columns > length
	) {
		return []
	}
	const rows = Math.ceil(length / columns)
	const heights = columnHeights(length, columns)
	const grid = Array.from({ length: rows }, () =>
		Array.from({ length: columns }, () => ''),
	)
	let index = 0
	for (let column = 0; column < columns; column += 1) {
		const height = heights[column] ?? 0
		for (let row = 0; row < height; row += 1) {
			grid[row][column] = chars[index] ?? ''
			index += 1
		}
	}
	return grid
}

export function readScytaleGrid (grid: string[][]): string {
	const out: string[] = []
	for (const row of grid) {
		for (const cell of row) {
			if (cell) out.push(cell)
		}
	}
	return out.join('')
}

export function decodeScytale (
	strip: string,
	columns: number,
): string {
	return readScytaleGrid(placeScytale(strip, columns))
}

export function encodeScytale (
	text: string,
	columns: number,
): string {
	const chars = codePoints(text)
	const length = chars.length
	if (
		!Number.isInteger(columns) ||
		columns < 2 ||
		columns >= length
	) {
		throw new PuzzleGenerateError(
			'Scytale column count must be between 2 and length - 1.',
		)
	}
	const rows = Math.ceil(length / columns)
	const grid: string[][] = []
	let index = 0
	for (let row = 0; row < rows; row += 1) {
		const width = Math.min(columns, length - index)
		const line: string[] = []
		for (let column = 0; column < width; column += 1) {
			line.push(chars[index] ?? '')
			index += 1
		}
		grid.push(line)
	}
	const out: string[] = []
	for (let column = 0; column < columns; column += 1) {
		for (let row = 0; row < rows; row += 1) {
			const cell = grid[row]?.[column]
			if (cell) out.push(cell)
		}
	}
	return out.join('')
}

/** Diameters in 2..n-1 whose reading equals `sentence`. */
export function scytaleKeysFor (
	strip: string,
	sentence: string,
): number[] {
	const length = codePoints(strip).length
	const range = scytaleKeyRange(length)
	if (!range) return []
	const keys: number[] = []
	for (let columns = range.min; columns <= range.max; columns += 1) {
		if (decodeScytale(strip, columns) === sentence) {
			keys.push(columns)
		}
	}
	return keys
}

/**
 * Deterministic search order, starting near a square rod and
 * walking outward. The same sentence always tries keys in this order.
 */
export function preferredScytaleKeys (length: number): number[] {
	const range = scytaleKeyRange(length)
	if (!range) return []
	const target = Math.min(
		range.max,
		Math.max(range.min, Math.round(Math.sqrt(length))),
	)
	const keys: number[] = []
	const seen = new Set<number>()
	const push = (value: number) => {
		if (
			value < range.min ||
			value > range.max ||
			seen.has(value)
		) {
			return
		}
		seen.add(value)
		keys.push(value)
	}
	push(target)
	for (let delta = 1; delta < length; delta += 1) {
		push(target + delta)
		push(target - delta)
	}
	return keys
}

/**
 * Build a scytale whose only successful diameter is the stored one.
 * Throws when the sentence is too short or every diameter collides.
 */
export function generateScytalePuzzle (
	sentence: string,
	role: PuzzleRole,
): ScytalePuzzle {
	const length = codePoints(sentence).length
	const keys = preferredScytaleKeys(length)
	if (keys.length < 2) {
		throw new PuzzleGenerateError(
			'This sentence is too short for a scytale puzzle.',
		)
	}
	for (const columns of keys) {
		const strip = encodeScytale(sentence, columns)
		if (strip === sentence) continue
		if (decodeScytale(strip, columns) !== sentence) continue
		const matches = scytaleKeysFor(strip, sentence)
		if (matches.length === 1 && matches[0] === columns) {
			return { kind: 'scytale', role, columns, strip }
		}
	}
	throw new PuzzleGenerateError(
		'No scytale diameter spells this sentence alone.',
	)
}

export function toPlayerScytalePuzzle (
	puzzle: ScytalePuzzle,
): ScytalePlayerPuzzle {
	const player: ScytalePlayerPuzzle = {
		kind: 'scytale',
		strip: puzzle.strip,
	}
	if (puzzle.hint) player.hint = puzzle.hint
	return player
}

export function canGenerateScytale (sentence: string): boolean {
	try {
		generateScytalePuzzle(sentence, 'required')
		return true
	} catch (error) {
		if (error instanceof PuzzleGenerateError) return false
		throw error
	}
}

/**
 * Creator-facing reason when this kind cannot lock a sentence.
 * Returns null when the error belongs to another layer.
 */
export function scytaleFailureReason (error: unknown): string | null {
	if (!(error instanceof PuzzleGenerateError)) return null
	if (error.message.includes('too short')) {
		return 'Câu này quá ngắn để quấn thành scytale.'
	}
	if (error.message.includes('No scytale diameter')) {
		return 'Không có đường kính nào chỉ đúng mỗi câu này.'
	}
	return error.message
}

export function validateScytalePuzzle (
	puzzle: ScytalePuzzle,
	sentence: string,
): PuzzleShapeCheck {
	const decoded = decodeScytale(puzzle.strip, puzzle.columns)
	const decodeMatches = decoded === sentence
	const matches = scytaleKeysFor(puzzle.strip, sentence)
	const uniqueKey =
		matches.length === 1 && matches[0] === puzzle.columns
	const messages: string[] = []
	if (!decodeMatches) {
		messages.push(
			'Scytale does not decode to the clue sentence.',
		)
	}
	if (!uniqueKey) {
		messages.push(
			matches.length === 0
				? 'No rod diameter reproduces the clue sentence.'
				: 'More than one rod diameter reproduces the clue sentence.',
		)
	}
	return {
		ok: decodeMatches && uniqueKey,
		decoded,
		decodeMatches,
		uniqueKey,
		messages,
	}
}

export function scytaleDecodes (
	cipher: string,
	sentence: string,
): boolean {
	return scytaleKeysFor(cipher, sentence).length > 0
}

export function scytaleReadingMatches (
	reading: string,
	sentence: string,
): boolean {
	return reading === sentence
}

export function scytaleCipherText (
	puzzle: { strip: string },
): string {
	return puzzle.strip
}

/**
 * A starting diameter that does not spell the sentence.
 * Prefers a near-square rod so the first view is a wrap, not a
 * two-column ribbon.
 */
export function openingScytaleColumns (
	strip: string,
	sentence: string,
): number {
	const length = codePoints(strip).length
	const range = scytaleKeyRange(length)
	if (!range) return 2
	for (const columns of preferredScytaleKeys(length)) {
		if (decodeScytale(strip, columns) !== sentence) {
			return columns
		}
	}
	return range.min
}
