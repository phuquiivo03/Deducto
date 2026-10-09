import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { clueBoardText } from './clue-board-text'

const SENTENCE = 'Ông Arthur có mặt ở Thư viện.'
const HINT = 'Ghi chép về ông Arthur trong đêm xảy ra vụ án.'

test('an unsolved lock shows the hint instead of the sentence', () => {
	assert.equal(
		clueBoardText({ text: SENTENCE, puzzle: { hint: HINT } }, false),
		HINT,
	)
	assert.equal(HINT.includes('<'), false)
	assert.equal(HINT.includes('Thư viện'), false)
})

test('a solved lock shows the clue sentence', () => {
	assert.equal(
		clueBoardText({ text: SENTENCE, puzzle: { hint: HINT } }, true),
		SENTENCE,
	)
})

test('a lock saved without a hint stays sealed', () => {
	assert.equal(
		clueBoardText({ text: SENTENCE, puzzle: {} }, false),
		'Manh mối này đang bị khóa.',
	)
	assert.notEqual(
		clueBoardText({ text: SENTENCE, puzzle: {} }, false),
		SENTENCE,
	)
})

test('an open clue shows its sentence', () => {
	assert.equal(clueBoardText({ text: SENTENCE }, false), SENTENCE)
})

test('the board renders the hint as text', () => {
	const source = readFileSync(
		new URL(
			'../../components/detective-board/CluePanel.tsx',
			import.meta.url,
		),
		'utf8',
	)
	assert.match(source, /clueBoardText/)
	assert.doesNotMatch(source, /dangerouslySetInnerHTML/)
})
