import { codePoints, placeScytale } from './scytale'

export const WRAP_VIEW_WIDTH = 640
export const WRAP_VIEW_HEIGHT = 268

const CY = 134
const LEFT = 28
const RIGHT = 612
const MIN_RADIUS = 48
const MAX_RADIUS = 110
const SLANT = 18

export interface WrapLetter {
	char: string
	index: number
	row: number
	column: number
	x: number
	y: number
	tilt: number
}

export interface ScytaleRod {
	left: number
	right: number
	cy: number
	radius: number
	capCx: number
	capRx: number
	body: string
	cap: string
	grain: string[]
}

export interface ScytaleWrap {
	columns: number
	rows: number
	radius: number
	fontSize: number
	view: { width: number; height: number }
	rod: ScytaleRod
	letters: WrapLetter[]
	bands: string[]
}

export function columnBounds (
	length: number,
): { min: number; max: number } {
	if (!Number.isFinite(length) || length < 2) {
		return { min: 2, max: 2 }
	}
	return { min: 2, max: Math.max(2, Math.floor(length) - 1) }
}

export function stepColumns (
	current: number,
	delta: number,
	length: number,
): number {
	const { min, max } = columnBounds(length)
	if (!Number.isFinite(current) || !Number.isFinite(delta)) {
		return min
	}
	const next = Math.round(current) + Math.round(delta)
	if (next < min) return min
	if (next > max) return max
	return next
}

export function dragColumns (
	startColumns: number,
	deltaX: number,
	deltaY: number,
	length: number,
	pixelsPerStep = 16,
): number {
	const stepPx = pixelsPerStep > 0 ? pixelsPerStep : 16
	const along = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX : deltaY
	const steps = Math.round(along / stepPx)
	return stepColumns(startColumns, steps, length)
}

export function thicknessRatio (
	columns: number,
	length: number,
): number {
	const { min, max } = columnBounds(length)
	const span = Math.max(1, max - min)
	return (stepColumns(columns, 0, length) - min) / span
}

export function columnsFromRatio (
	ratio: number,
	length: number,
): number {
	const { min, max } = columnBounds(length)
	if (!Number.isFinite(ratio)) return min
	const clamped = Math.min(1, Math.max(0, ratio))
	return stepColumns(min + clamped * (max - min), 0, length)
}

/** Spoken thickness. Never includes the column count. */
export function thicknessLabel (
	columns: number,
	length: number,
): string {
	const ratio = thicknessRatio(columns, length)
	if (ratio < 1 / 3) return 'thanh mỏng'
	if (ratio < 2 / 3) return 'thanh vừa'
	return 'thanh dày'
}

function radiusFor (columns: number, length: number): number {
	const span = MAX_RADIUS - MIN_RADIUS
	return MIN_RADIUS + thicknessRatio(columns, length) * span
}

function capRadius (radius: number): number {
	return Math.min(26, Math.max(12, radius * 0.22))
}

function wobbleOffset (seed: number, t: number): number {
	return (
		Math.sin(t * Math.PI * 4 + seed) * 1.3 +
		Math.cos(t * Math.PI * 10 + seed) * 0.7
	)
}

function edge (
	x0: number,
	x1: number,
	yAt: (t: number) => number,
	steps: number,
	first: boolean,
): string {
	let path = ''
	for (let index = 0; index <= steps; index += 1) {
		const t = index / steps
		const x = x0 + (x1 - x0) * t
		const y = yAt(t)
		const command = first && index === 0 ? 'M' : 'L'
		path += `${command}${x.toFixed(1)} ${y.toFixed(1)}`
	}
	return path
}

function bodyPath (radius: number, capRx: number): string {
	const right = RIGHT - capRx
	const bow = 14
	const steps = 14
	const top = edge(
		LEFT + bow,
		right,
		(t) => CY - radius + wobbleOffset(0.4, t),
		steps,
		true,
	)
	const bottom = edge(
		right,
		LEFT + bow,
		(t) => CY + radius + wobbleOffset(1.7, 1 - t),
		steps,
		false,
	)
	let arc = ''
	const arcSteps = 8
	for (let index = 0; index <= arcSteps; index += 1) {
		const theta = Math.PI / 2 + (index / arcSteps) * Math.PI
		const x = LEFT + bow + Math.cos(theta) * bow
		const y = CY + Math.sin(theta) * radius
		arc += `L${x.toFixed(1)} ${y.toFixed(1)}`
	}
	return `${top}${bottom}${arc}Z`
}

function capPath (radius: number, capRx: number): string {
	const cx = RIGHT - capRx
	const steps = 36
	let path = ''
	for (let index = 0; index <= steps; index += 1) {
		const theta = (index / steps) * Math.PI * 2
		const wobble =
			1 +
			Math.sin(theta * 3 + 1.2) * 0.018 +
			Math.cos(theta * 7 + 1.2) * 0.01
		const x = cx + Math.cos(theta) * capRx * wobble
		const y = CY + Math.sin(theta) * radius * wobble
		path += `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
	}
	return `${path}Z`
}

function grainPaths (radius: number, capRx: number): string[] {
	const right = RIGHT - capRx - 12
	const left = LEFT + 24
	return [-0.42, 0, 0.42].map((portion, index) => {
		const y = CY + radius * portion
		return edge(
			left,
			right,
			(t) => y + wobbleOffset(index + 0.2, t) * 0.55,
			8,
			true,
		)
	})
}

export function ribbonPath (
	letters: WrapLetter[],
	row: number,
): string {
	const rowLetters = letters
		.filter((letter) => letter.row === row)
		.sort((a, b) => a.column - b.column)
	const first = rowLetters[0]
	const last = rowLetters[rowLetters.length - 1]
	if (!first || !last) return ''
	const pad = 8
	const x0 = first.x - pad
	const x1 = last.x + pad
	const y0 = first.y
	const y1 = last.y
	const dx = x1 - x0
	const dy = y1 - y0
	const len = Math.hypot(dx, dy) || 1
	const half = 10
	const nx = (-dy / len) * half
	const ny = (dx / len) * half
	const steps = 10
	let path = ''
	for (let index = 0; index <= steps; index += 1) {
		const t = index / steps
		const x = x0 + dx * t
		const y = y0 + dy * t + wobbleOffset(row + 0.3, t) * 0.4
		const command = index === 0 ? 'M' : 'L'
		path += `${command}${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`
	}
	for (let index = steps; index >= 0; index -= 1) {
		const t = index / steps
		const x = x0 + dx * t
		const y = y0 + dy * t + wobbleOffset(row + 1.3, t) * 0.4
		path += `L${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`
	}
	return `${path}Z`
}

export function scytaleWrapLayout (
	strip: string,
	columns: number,
): ScytaleWrap {
	const chars = codePoints(strip)
	const length = chars.length
	const safe = stepColumns(columns, 0, length)
	const grid = placeScytale(strip, safe)
	const rows = Math.max(1, grid.length)
	const radius = radiusFor(safe, length)
	const capRx = capRadius(radius)
	const innerLeft = LEFT + 20
	const innerRight = RIGHT - capRx - 20
	const innerWidth = Math.max(1, innerRight - innerLeft)
	const pitch = Math.min(22, (WRAP_VIEW_HEIGHT - 36) / rows)
	const y0 = CY - ((rows - 1) * pitch) / 2
	const colGap = innerWidth / safe
	const fontSize = Math.round(
		Math.max(8, Math.min(16, colGap * 0.62, pitch * 0.68)),
	)
	const tilt = Number(
		(
			(Math.atan2(SLANT, Math.max(1, innerWidth)) * 180) /
			Math.PI
		).toFixed(2),
	)
	const letters: WrapLetter[] = []
	let index = 0
	for (let column = 0; column < safe; column += 1) {
		for (let row = 0; row < rows; row += 1) {
			const char = grid[row]?.[column] ?? ''
			if (!char) continue
			const across = safe === 1 ? 0.5 : column / (safe - 1)
			letters.push({
				char,
				index,
				row,
				column,
				x: innerLeft + (column + 0.5) * colGap,
				y: y0 + row * pitch + (across - 0.5) * SLANT,
				tilt,
			})
			index += 1
		}
	}
	const bands: string[] = []
	for (let row = 0; row < rows; row += 1) {
		const band = ribbonPath(letters, row)
		if (band) bands.push(band)
	}
	return {
		columns: safe,
		rows,
		radius,
		fontSize,
		view: { width: WRAP_VIEW_WIDTH, height: WRAP_VIEW_HEIGHT },
		rod: {
			left: LEFT,
			right: RIGHT,
			cy: CY,
			radius,
			capCx: RIGHT - capRx,
			capRx,
			body: bodyPath(radius, capRx),
			cap: capPath(radius, capRx),
			grain: grainPaths(radius, capRx),
		},
		letters,
		bands,
	}
}
