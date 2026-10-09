import assert from 'node:assert/strict'
import test from 'node:test'

import { PuzzleGenerateError } from '@/features/puzzles/generate-error'

import {
	caesarShiftsFor,
	decodeCaesar,
	encodeCaesar,
	generateCaesarPuzzle,
	normalizeCaesarSentence,
	preferredCaesarShift,
	validateCaesarPuzzle,
} from './caesar'
import { caesarPuzzleSchema } from './types'

const ARTHUR = 'Ông Arthur có mặt ở Thư viện.'

test('normalization strips diacritics, case, and keeps punctuation', () => {
	assert.equal(
		normalizeCaesarSentence(ARTHUR),
		'ONG ARTHUR CO MAT O THU VIEN.',
	)
	assert.equal(
		normalizeCaesarSentence('Đêm ở phố, 12 giờ!'),
		'DEM O PHO, 12 GIO!',
	)
	assert.equal(
		normalizeCaesarSentence('Xin chào Đà Nẵng.'),
		'XIN CHAO DA NANG.',
	)
	assert.equal(normalizeCaesarSentence('AbC'), 'ABC')
	assert.equal(normalizeCaesarSentence('a  b.'), 'A  B.')
})

test('encode and decode keep non-letters and ignore case', () => {
	const sentence = 'Xin chào, bạn 123!'
	const normalized = normalizeCaesarSentence(sentence)
	assert.equal(normalized, 'XIN CHAO, BAN 123!')
	for (let shift = 1; shift <= 25; shift += 1) {
		const cipher = encodeCaesar(sentence, shift)
		assert.equal(cipher.includes(', '), true)
		assert.equal(cipher.endsWith('123!'), true)
		assert.equal(decodeCaesar(cipher, shift), normalized)
		assert.notEqual(cipher, normalized)
	}
	assert.equal(encodeCaesar('a  b.', 1), 'B  C.')
	assert.equal(decodeCaesar('b  c.', 1), 'A  B.')
})

test('the shift is deterministic, unique, and not zero', () => {
	const first = generateCaesarPuzzle(ARTHUR, 'required')
	const again = generateCaesarPuzzle(ARTHUR, 'optional')
	assert.equal(first.shift, again.shift)
	assert.equal(first.cipher, again.cipher)
	assert.equal(first.shift, preferredCaesarShift(normalizeCaesarSentence(ARTHUR)))
	assert.ok(first.shift >= 1 && first.shift <= 25)
	assert.notEqual(first.cipher, normalizeCaesarSentence(ARTHUR))
	const check = validateCaesarPuzzle(first, ARTHUR)
	assert.equal(check.ok, true)
	assert.equal(check.decodeMatches, true)
	assert.equal(check.uniqueKey, true)
	assert.equal(check.decoded, normalizeCaesarSentence(ARTHUR))
	assert.deepEqual(
		caesarShiftsFor(first.cipher, normalizeCaesarSentence(ARTHUR)),
		[first.shift],
	)
})

test('a wrong shift does not restore the sentence', () => {
	const puzzle = generateCaesarPuzzle('Hello, thế giới!', 'required')
	const normalized = normalizeCaesarSentence('Hello, thế giới!')
	const wrong = puzzle.shift === 1 ? 2 : 1
	assert.notEqual(decodeCaesar(puzzle.cipher, wrong), normalized)
	const check = validateCaesarPuzzle(
		{ ...puzzle, shift: wrong },
		'Hello, thế giới!',
	)
	assert.equal(check.ok, false)
	assert.equal(check.decodeMatches, false)
})

test('a hint on the puzzle does not change validation', () => {
	const puzzle = generateCaesarPuzzle(ARTHUR, 'required')
	const plain = validateCaesarPuzzle(puzzle, ARTHUR)
	const hinted = validateCaesarPuzzle(
		{ ...puzzle, hint: 'Chỉ là ngữ cảnh.' },
		ARTHUR,
	)
	assert.equal(plain.ok, true)
	assert.deepEqual(plain, hinted)
})

test('a sentence with no letters is rejected', () => {
	assert.throws(
		() => generateCaesarPuzzle('... 123!', 'required'),
		(error: unknown) => {
			assert.ok(error instanceof PuzzleGenerateError)
			assert.match(error.message, /no letters/)
			return true
		},
	)
})

test('every shift of a letterless string matches, so it is not unique', () => {
	const check = validateCaesarPuzzle(
		{
			kind: 'caesar',
			role: 'required',
			shift: 3,
			cipher: '...',
		},
		'...',
	)
	assert.equal(check.decodeMatches, true)
	assert.equal(check.uniqueKey, false)
	assert.equal(check.ok, false)
	assert.match(check.messages.join(' '), /More than one/)
})

test('schema rejects a zero shift and accepts a real one', () => {
	assert.equal(
		caesarPuzzleSchema.safeParse({
			kind: 'caesar',
			role: 'required',
			shift: 0,
			cipher: 'ABC',
		}).success,
		false,
	)
	const puzzle = generateCaesarPuzzle(ARTHUR, 'required')
	assert.equal(caesarPuzzleSchema.safeParse(puzzle).success, true)
	assert.equal(
		caesarPuzzleSchema.safeParse({ ...puzzle, hint: undefined }).success,
		true,
	)
})
