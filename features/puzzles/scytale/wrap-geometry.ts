import { codePoints, placeScytale } from './scytale'

export const WRAP_VIEW_WIDTH = 640
export const WRAP_VIEW_HEIGHT = 292

const CY = 118
const LEFT = 28
const RIGHT = 612
const MIN_RADIUS = 44
const MAX_RADIUS = 100
const FRONT = 0.08
const TAIL_DROP = 36

export interface WrapLetter {
	char: string
	index: number
	row: number
	column: number
	x: number
	y: number
	tilt: number
	/** cos(theta). 1 faces the viewer; <= 0 is the back of the rod. */
	scaleY: number
	visible: boolean
	theta: number
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
	pitch: number
	fontSize: number
	view: { width: number; height: number }
	rod: ScytaleRod
	letters: WrapLetter[]
	/** Front arcs of the one helical strip. The back is not drawn. */
	ribbons: string[]
	lead: string
	tail: string
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

interface HelixPoint {
	x: number
	y: number
	theta: number
	scaleY: number
}

/**
 * One narrow strip wound edge to edge.
 * `turn` 0 is the top of the first wrap. A full turn advances `pitch`
 * along the rod and 2π around it. theta 0 faces the viewer.
 */
function helixPoint (
	turn: number,
	x0: number,
	pitch: number,
	radius: number,
): HelixPoint {
	const theta = turn * Math.PI * 2 - Math.PI / 2
	const scaleY = Math.cos(theta)
	return {
		x: x0 + turn * pitch,
		y: CY + radius * Math.sin(theta),
		theta,
		scaleY,
	}
}

function ribbonFrom (
	points: HelixPoint[],
	half: number,
): string {
	const first = points[0]
	if (!first || points.length < 2) return ''
	let path = ''
	for (let index = 0; index < points.length; index += 1) {
		const point = points[index]
		if (!point) continue
		const y = point.y + wobbleOffset(0.6, index / 6) * 0.35
		const command = index === 0 ? 'M' : 'L'
		path += `${command}${(point.x - half).toFixed(1)} ${y.toFixed(1)}`
	}
	for (let index = points.length - 1; index >= 0; index -= 1) {
		const point = points[index]
		if (!point) continue
		const y = point.y + wobbleOffset(1.4, index / 6) * 0.35
		path += `L${(point.x + half).toFixed(1)} ${y.toFixed(1)}`
	}
	return `${path}Z`
}

function frontRibbons (
	turns: number,
	x0: number,
	pitch: number,
	radius: number,
): string[] {
	const samples = Math.max(8, Math.ceil(turns * 24))
	const half = pitch / 2
	const ribbons: string[] = []
	let current: HelixPoint[] = []
	const flush = () => {
		const path = ribbonFrom(current, half)
		if (path) ribbons.push(path)
		current = []
	}
	for (let step = 0; step <= samples; step += 1) {
		const turn = (step / samples) * turns
		const point = helixPoint(turn, x0, pitch, radius)
		if (point.scaleY > 0.02) {
			current.push(point)
		} else if (current.length > 0) {
			flush()
		}
	}
	if (current.length > 0) flush()
	return ribbons
}

function leadPath (x0: number, radius: number): string {
	const y = CY - radius
	const x1 = Math.max(LEFT + 8, x0 - 20)
	const y1 = CY - radius * 0.42
	const half = 8
	return [
		`M${x1.toFixed(1)} ${y1.toFixed(1)}`,
		`L${(x0 - half).toFixed(1)} ${(y + 3).toFixed(1)}`,
		`L${(x0 + half).toFixed(1)} ${(y + 3).toFixed(1)}`,
		`L${(x1 + 10).toFixed(1)} ${(y1 + 7).toFixed(1)}`,
		'Z',
	].join('')
}

function tailPath (x: number, y: number, half: number): string {
	const drop = TAIL_DROP
	const midY = y + drop * 0.5
	const endY = y + drop
	const endX = x + Math.min(14, half * 0.2)
	const topL = x - half
	const topR = x + half
	const botL = endX - half * 0.55
	const botR = endX + half * 0.28
	const midX = (topL + 8).toFixed(1)
	const endLeft = botL.toFixed(1)
	const endRight = botR.toFixed(1)
	const riseX = (topR - 4).toFixed(1)
	return [
		`M${topL.toFixed(1)} ${y.toFixed(1)}`,
		`Q${midX} ${midY.toFixed(1)} ${endLeft} ${endY.toFixed(1)}`,
		`L${endRight} ${endY.toFixed(1)}`,
		`Q${riseX} ${midY.toFixed(1)} ${topR.toFixed(1)} ${y.toFixed(1)}`,
		'Z',
	].join('')
}

/**
 * Wind `strip` on a rod of thickness `columns`.
 * One turn goes around the rod and holds one grid column. Reading
 * left to right follows a grid row: those letters share a height.
 * The back (cos <= 0) is omitted, and the tail leaves at the bottom.
 */
export function scytaleWrapLayout (
	strip: string,
	columns: number,
): ScytaleWrap {
	const length = codePoints(strip).length
	const bound = Math.max(length, 2)
	const safe = stepColumns(columns, 0, bound)
	const radius = radiusFor(safe, bound)
	const capRx = capRadius(radius)
	const rodLeft = LEFT + 18
	const rodRight = RIGHT - capRx - 10
	const full = Math.max(48, rodRight - rodLeft)
	const grid = length >= safe ? placeScytale(strip, safe) : []
	const rows = Math.max(1, grid.length)
	const turnsTotal = Math.max(safe, 0.4)
	const pitch = full / (turnsTotal + 1)
	const x0 = rodLeft + pitch / 2
	const arc = (2 * Math.PI * radius) / rows
	const fontSize = Math.round(
		Math.max(8, Math.min(15, arc * 0.42, pitch * 0.48)),
	)
	const letters: WrapLetter[] = []
	let index = 0
	for (let column = 0; column < safe; column += 1) {
		for (let row = 0; row < rows; row += 1) {
			const char = grid[row]?.[column] ?? ''
			if (!char) continue
			const around = rows === 1
				? 0.25
				: (row + 0.5) / rows
			const point = helixPoint(
				column + around,
				x0,
				pitch,
				radius,
			)
			const dx = pitch / rows
			const dy = radius * point.scaleY * (2 * Math.PI / rows)
			const raw = (Math.atan2(dy, dx) * 180) / Math.PI
			const tilt = Math.max(-32, Math.min(32, raw))
			letters.push({
				char,
				index,
				row,
				column,
				x: point.x,
				y: point.y,
				tilt: Number(tilt.toFixed(2)),
				scaleY: point.scaleY,
				visible: point.scaleY > FRONT,
				theta: point.theta,
			})
			index += 1
		}
	}
	const peel = helixPoint(turnsTotal - 0.5, x0, pitch, radius)
	const wound = letters.length > 0
	return {
		columns: safe,
		rows,
		radius,
		pitch,
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
		ribbons: wound
			? frontRibbons(turnsTotal - 0.5, x0, pitch, radius)
			: [],
		lead: wound ? leadPath(x0, radius) : '',
		tail: wound ? tailPath(peel.x, peel.y, pitch / 2) : '',
	}
}
