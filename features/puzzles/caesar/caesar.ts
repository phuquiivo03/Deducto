import type { PuzzleRole } from '@/features/puzzles/puzzle-role'
import { PuzzleGenerateError } from '@/features/puzzles/generate-error'
import type { PuzzleShapeCheck } from '@/features/puzzles/types'

import type { CaesarPlayerPuzzle, CaesarPuzzle } from './types'

const ALPHABET = 26

/**
 * Caesar substitution on A–Z.
 *
 * The sentence is normalized first: Vietnamese diacritics are
 * stripped (including đ/Đ), Latin letters are uppercased, and every
 * other character is left in place. A shift of 0 is the identity, so
 * it is never stored. With at least one letter, exactly one shift in
 * 1..25 restores the normalized sentence. The generator hashes the
 * normalized sentence to pick that shift. No randomness and no model.
 */
export function normalizeCaesarSentence (text: string): string {
	const stroked = Array.from(text, (char) => {
		if (char === 'đ') return 'd'
		if (char === 'Đ') return 'D'
		return char
	}).join('')
	const stripped = stroked.normalize('NFD').replace(/\p{M}/gu, '')
	return Array.from(stripped, (char) => {
		if (char >= 'a' && char <= 'z') return char.toUpperCase()
		if (char >= 'A' && char <= 'Z') return char
		return char
	}).join('')
}

function mod (value: number, base: number): number {
	return ((value % base) + base) % base
}

function shiftChar (char: string, shift: number): string {
	if (char < 'A' || char > 'Z') return char
	const index = char.charCodeAt(0) - 65
	return String.fromCharCode(65 + mod(index + shift, ALPHABET))
}

function shiftText (text: string, shift: number): string {
	return Array.from(text, (char) => shiftChar(char, shift)).join('')
}

export function hasCaesarLetter (normalized: string): boolean {
	return /[A-Z]/.test(normalized)
}

/** Encode a clue sentence. Normalization happens here. */
export function encodeCaesar (sentence: string, shift: number): string {
	return shiftText(normalizeCaesarSentence(sentence), shift)
}

/**
 * Decode ciphertext. Letters are normalized the same way as encode,
 * then shifted backward. Non-letters pass through.
 */
export function decodeCaesar (cipher: string, shift: number): string {
	return shiftText(normalizeCaesarSentence(cipher), -shift)
}

/** Shifts in 1..25 whose decoding equals `normalized`. */
export function caesarShiftsFor (
	cipher: string,
	normalized: string,
): number[] {
	const keys: number[] = []
	for (let shift = 1; shift <= ALPHABET - 1; shift += 1) {
		if (decodeCaesar(cipher, shift) === normalized) keys.push(shift)
	}
	return keys
}

/**
 * Deterministic shift in 1..25. The same sentence always returns
 * the same offset, and the offset is never zero.
 */
export function preferredCaesarShift (normalized: string): number {
	let hash = 2166136261
	for (const char of normalized) {
		hash ^= char.codePointAt(0) ?? 0
		hash = Math.imul(hash, 16777619)
	}
	return (hash >>> 0) % (ALPHABET - 1) + 1
}

export function generateCaesarPuzzle (
	sentence: string,
	role: PuzzleRole,
): CaesarPuzzle {
	const normalized = normalizeCaesarSentence(sentence)
	if (!hasCaesarLetter(normalized)) {
		throw new PuzzleGenerateError(
			'This sentence has no letters for a Caesar cipher.',
		)
	}
	const shift = preferredCaesarShift(normalized)
	const cipher = shiftText(normalized, shift)
	if (cipher === normalized || shift === 0) {
		throw new PuzzleGenerateError('Caesar shift is trivial.')
	}
	const matches = caesarShiftsFor(cipher, normalized)
	if (matches.length !== 1 || matches[0] !== shift) {
		throw new PuzzleGenerateError('Caesar shift is not unique.')
	}
	return { kind: 'caesar', role, shift, cipher }
}

export function toPlayerCaesarPuzzle (
	puzzle: CaesarPuzzle,
): CaesarPlayerPuzzle {
	const player: CaesarPlayerPuzzle = {
		kind: 'caesar',
		cipher: puzzle.cipher,
	}
	if (puzzle.hint) player.hint = puzzle.hint
	return player
}

export function canGenerateCaesar (sentence: string): boolean {
	try {
		generateCaesarPuzzle(sentence, 'required')
		return true
	} catch (error) {
		if (error instanceof PuzzleGenerateError) return false
		throw error
	}
}

export function caesarFailureReason (error: unknown): string | null {
	if (!(error instanceof PuzzleGenerateError)) return null
	if (error.message.includes('no letters')) {
		return 'Câu này không có chữ cái để mã hóa Caesar.'
	}
	if (
		error.message.includes('trivial') ||
		error.message.includes('not unique')
	) {
		return 'Không có độ lệch Caesar nào chỉ đúng mỗi câu này.'
	}
	return error.message
}

export function validateCaesarPuzzle (
	puzzle: CaesarPuzzle,
	sentence: string,
): PuzzleShapeCheck {
	const normalized = normalizeCaesarSentence(sentence)
	const decoded = decodeCaesar(puzzle.cipher, puzzle.shift)
	const decodeMatches = decoded === normalized
	const matches = caesarShiftsFor(puzzle.cipher, normalized)
	const uniqueKey =
		matches.length === 1 && matches[0] === puzzle.shift
	const messages: string[] = []
	if (!decodeMatches) {
		messages.push(
			'Caesar does not decode to the clue sentence.',
		)
	}
	if (!uniqueKey) {
		if (matches.length === 0) {
			messages.push(
				'No Caesar shift reproduces the clue sentence.',
			)
		} else if (matches.length > 1) {
			messages.push(
				'More than one Caesar shift reproduces the clue sentence.',
			)
		} else {
			messages.push(
				'The stored Caesar shift does not decode the sentence.',
			)
		}
	}
	if (puzzle.shift === 0 || puzzle.cipher === normalized) {
		messages.push('Caesar shift is trivial.')
	}
	return {
		ok: decodeMatches && uniqueKey && puzzle.cipher !== normalized,
		decoded,
		decodeMatches,
		uniqueKey,
		messages,
	}
}

export function caesarDecodes (
	cipher: string,
	sentence: string,
): boolean {
	const normalized = normalizeCaesarSentence(sentence)
	return caesarShiftsFor(cipher, normalized).length > 0
}

export function caesarReadingMatches (
	reading: string,
	sentence: string,
): boolean {
	return reading === normalizeCaesarSentence(sentence)
}

export function caesarCipherText (
	puzzle: { cipher: string },
): string {
	return puzzle.cipher
}
