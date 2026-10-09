import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { decodeScytale, encodeScytale } from './scytale'
import {
	columnBounds,
	columnsFromRatio,
	dragColumns,
	scytaleWrapLayout,
	stepColumns,
	thicknessLabel,
	thicknessRatio,
	WRAP_VIEW_HEIGHT,
	WRAP_VIEW_WIDTH,
	type ScytaleWrap,
} from './wrap-geometry'

const ARTHUR = 'Ông Arthur có mặt ở Thư viện.'

function readRows (layout: ScytaleWrap): string {
	return [...layout.letters]
		.sort((a, b) => a.row - b.row || a.column - b.column)
		.map((letter) => letter.char)
		.join('')
}

function readStrip (layout: ScytaleWrap): string {
	return [...layout.letters]
		.sort((a, b) => a.index - b.index)
		.map((letter) => letter.char)
		.join('')
}

test('column steps stay inside 2 .. length - 1', () => {
	assert.deepEqual(columnBounds(12), { min: 2, max: 11 })
	assert.equal(stepColumns(2, -5, 12), 2)
	assert.equal(stepColumns(11, 3, 12), 11)
	assert.equal(stepColumns(4, 2, 12), 6)
	assert.equal(stepColumns(4.6, 0, 12), 5)
	assert.equal(stepColumns(Number.NaN, 1, 12), 2)
	assert.deepEqual(columnBounds(0), { min: 2, max: 2 })
})

test('a drag steps on the stronger axis and clamps', () => {
	assert.equal(dragColumns(4, 0, 0, 12), 4)
	assert.equal(dragColumns(4, 48, 10, 12, 16), 7)
	assert.equal(dragColumns(4, 10, -48, 12, 16), 2)
	assert.equal(dragColumns(4, -16, 16, 12, 16), 3)
	assert.equal(dragColumns(4, 32, 0, 12, 0), 6)
})

test('thickness labels and ratios hide the column count', () => {
	assert.equal(thicknessRatio(2, 12), 0)
	assert.equal(thicknessRatio(11, 12), 1)
	assert.equal(columnsFromRatio(0, 12), 2)
	assert.equal(columnsFromRatio(1, 12), 11)
	assert.equal(columnsFromRatio(1.4, 12), 11)
	assert.equal(columnsFromRatio(-1, 12), 2)
	assert.equal(columnsFromRatio(Number.NaN, 12), 2)
	for (let columns = 2; columns < 12; columns += 1) {
		const ratio = thicknessRatio(columns, 12)
		assert.equal(columnsFromRatio(ratio, 12), columns)
		assert.doesNotMatch(thicknessLabel(columns, 12), /\d/)
	}
	assert.equal(thicknessLabel(2, 12), 'thanh mỏng')
	assert.equal(thicknessLabel(11, 12), 'thanh dày')
})

test('the scytale tool does not print the column count', () => {
	const source = readFileSync(
		new URL('./scytale-tool.tsx', import.meta.url),
		'utf8',
	)
	assert.doesNotMatch(source, /cột/)
	assert.doesNotMatch(source, /\$\{(?:safe)?columns\}/)
	assert.doesNotMatch(source, /aria-valuenow=\{(?:safe)?columns\}/)
})

test('the wrap places every code point on a diagonal row', () => {
	const strip = 'AB CDEFGH'
	const layout = scytaleWrapLayout(strip, 3)
	assert.equal(layout.columns, 3)
	assert.equal(layout.rows, 3)
	assert.equal(layout.view.width, WRAP_VIEW_WIDTH)
	assert.equal(layout.view.height, WRAP_VIEW_HEIGHT)
	assert.equal(readStrip(layout), strip)
	assert.equal(readRows(layout), decodeScytale(strip, 3))
	assert.ok(layout.fontSize >= 8 && layout.fontSize <= 16)
	assert.equal(layout.bands.length, 3)
	for (const band of layout.bands) {
		assert.match(band, /^M/)
		assert.match(band, /Z$/)
	}
	const indexes = new Set(layout.letters.map((letter) => letter.index))
	assert.equal(indexes.size, Array.from(strip).length)
	for (const letter of layout.letters) {
		assert.ok(letter.x > 0 && letter.x < WRAP_VIEW_WIDTH)
		assert.ok(letter.y > 0 && letter.y < WRAP_VIEW_HEIGHT)
	}
	for (let row = 0; row < layout.rows; row += 1) {
		const line = layout.letters
			.filter((letter) => letter.row === row)
			.sort((a, b) => a.column - b.column)
		for (let index = 1; index < line.length; index += 1) {
			const prev = line[index - 1]
			const curr = line[index]
			assert.ok(prev && curr)
			assert.ok(curr.x > prev.x)
			assert.ok(Math.abs(curr.y - prev.y) <= 20)
		}
	}
})

test('a thicker rod is strictly wider and rewraps the sentence', () => {
	const text = 'ABCDEFGHJK'
	let previous = 0
	for (let columns = 2; columns < text.length; columns += 1) {
		const layout = scytaleWrapLayout(text, columns)
		assert.ok(layout.radius > previous)
		previous = layout.radius
		assert.equal(readRows(layout), decodeScytale(text, columns))
	}
	const thin = scytaleWrapLayout(text, 2)
	const thick = scytaleWrapLayout(text, text.length - 1)
	assert.notEqual(thin.rod.body, thick.rod.body)
	assert.ok(thick.rows < thin.rows)
	for (const layout of [thin, thick]) {
		const paths = [
			layout.rod.body,
			layout.rod.cap,
			...layout.rod.grain,
			...layout.bands,
		]
		for (const path of paths) {
			const nums = (path.match(/-?\d+\.?\d*/g) ?? []).map(Number)
			for (let index = 0; index < nums.length; index += 2) {
				const x = nums[index]
				const y = nums[index + 1]
				assert.ok(x !== undefined && y !== undefined)
				assert.ok(x >= -4 && x <= WRAP_VIEW_WIDTH + 4)
				assert.ok(y >= -4 && y <= WRAP_VIEW_HEIGHT + 4)
			}
		}
	}

	const columns = 5
	const strip = encodeScytale(ARTHUR, columns)
	const solved = scytaleWrapLayout(strip, columns)
	assert.equal(readRows(solved), ARTHUR)
	const missed = scytaleWrapLayout(strip, columns + 1)
	assert.notEqual(readRows(missed), ARTHUR)
})
