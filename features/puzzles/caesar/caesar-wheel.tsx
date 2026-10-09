'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { decodeCaesar } from './caesar'
import { useReportReading, type PuzzleToolProps } from '../toolkit'

const LETTERS = Array.from({ length: 26 }, (_, index) =>
	String.fromCharCode(65 + index),
)
const STEP = 360 / 26
const CX = 200
const CY = 200
const R_OUTER = 158
const R_INNER = 102

function wobblePath (
	cx: number,
	cy: number,
	radius: number,
	seed: number,
): string {
	const steps = 40
	let path = ''
	for (let index = 0; index <= steps; index += 1) {
		const theta = (index / steps) * Math.PI * 2
		const wobble =
			1 +
			Math.sin(theta * 3 + seed) * 0.016 +
			Math.cos(theta * 7 + seed) * 0.01
		const x = cx + Math.cos(theta) * radius * wobble
		const y = cy + Math.sin(theta) * radius * wobble
		path += `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
	}
	return `${path}Z`
}

function letterPoint (index: number, radius: number) {
	const degrees = -90 + index * STEP
	const theta = (degrees * Math.PI) / 180
	return {
		x: CX + radius * Math.cos(theta),
		y: CY + radius * Math.sin(theta),
		rot: degrees + 90,
	}
}

function shiftFromRotation (degrees: number): number {
	const steps = Math.round(degrees / STEP)
	return ((-steps % 26) + 26) % 26
}

function unwrap (delta: number): number {
	return delta - 360 * Math.round(delta / 360)
}

interface DragState {
	active: boolean
	lastAngle: number
	x: number
	y: number
}

function tickLine (index: number) {
	const degrees = -90 + index * STEP
	const theta = (degrees * Math.PI) / 180
	const inner = R_INNER + 30
	const outer = R_OUTER + 14
	return {
		x1: CX + inner * Math.cos(theta),
		y1: CY + inner * Math.sin(theta),
		x2: CX + outer * Math.cos(theta),
		y2: CY + outer * Math.sin(theta),
	}
}

export function CaesarTool (props: PuzzleToolProps) {
	return (
		<CaesarSession
			key={props.cipher}
			cipher={props.cipher}
			onReading={props.onReading}
		/>
	)
}

function CaesarSession ({
	cipher,
	onReading,
}: {
	cipher: string
	onReading: (reading: string) => void
}) {
	const svgRef = useRef<SVGSVGElement>(null)
	const rotorRef = useRef<SVGGElement>(null)
	const rotationRef = useRef(0)
	const reduceRef = useRef(false)
	const dragRef = useRef<DragState>({
		active: false,
		lastAngle: 0,
		x: 0,
		y: 0,
	})
	const [shift, setShift] = useState(0)
	const [rotation, setRotation] = useState(0)
	const [animate, setAnimate] = useState(true)
	const mountedRef = useRef(true)
	const hatchId = `caesar-hatch-${useId().replace(/:/g, '')}`
	const plain = decodeCaesar(cipher, shift)
	useReportReading(plain, onReading)

	useEffect(() => {
		mountedRef.current = true
		const media = window.matchMedia('(prefers-reduced-motion: reduce)')
		const apply = () => {
			reduceRef.current = media.matches
		}
		apply()
		media.addEventListener('change', apply)
		return () => {
			mountedRef.current = false
			media.removeEventListener('change', apply)
		}
	}, [])

	const commitSteps = (steps: number) => {
		const degrees = steps * STEP
		rotationRef.current = degrees
		setShift(shiftFromRotation(degrees))
		setAnimate(!reduceRef.current)
		requestAnimationFrame(() => {
			if (!mountedRef.current) return
			setRotation(degrees)
		})
	}

	const rotateBy = (deltaSteps: number) => {
		const steps = Math.round(rotationRef.current / STEP) + deltaSteps
		commitSteps(steps)
	}

	const angleOf = (clientX: number, clientY: number) => {
		const svg = svgRef.current
		if (!svg) return -90
		const point = svg.createSVGPoint()
		point.x = clientX
		point.y = clientY
		const matrix = svg.getScreenCTM()
		if (!matrix) return -90
		const local = point.matrixTransform(matrix.inverse())
		return (Math.atan2(local.y - CY, local.x - CX) * 180) / Math.PI
	}

	const pointOf = (clientX: number, clientY: number) => {
		const svg = svgRef.current
		if (!svg) return { x: CX, y: CY }
		const point = svg.createSVGPoint()
		point.x = clientX
		point.y = clientY
		const matrix = svg.getScreenCTM()
		if (!matrix) return { x: CX, y: CY }
		const local = point.matrixTransform(matrix.inverse())
		return { x: local.x, y: local.y }
	}

	const alignLetter = (index: number) => {
		const base = Math.round(rotationRef.current / STEP)
		let diff = -index - base
		diff -= 26 * Math.round(diff / 26)
		commitSteps(base + diff)
	}

	const onPointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId)
		rotorRef.current?.focus()
		dragRef.current = {
			active: true,
			lastAngle: angleOf(event.clientX, event.clientY),
			x: event.clientX,
			y: event.clientY,
		}
		setAnimate(false)
	}

	const onPointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
		const drag = dragRef.current
		if (!drag.active) return
		const angle = angleOf(event.clientX, event.clientY)
		const next = rotationRef.current + unwrap(angle - drag.lastAngle)
		drag.lastAngle = angle
		rotationRef.current = next
		setAnimate(false)
		setRotation(next)
	}

	const onPointerUp = (event: React.PointerEvent<SVGCircleElement>) => {
		const drag = dragRef.current
		if (!drag.active) return
		drag.active = false
		const moved = Math.hypot(event.clientX - drag.x, event.clientY - drag.y)
		if (moved < 7) {
			const point = pointOf(drag.x, drag.y)
			const radius = Math.hypot(point.x - CX, point.y - CY)
			if (radius > 70 && radius < 150) {
				const pointer = angleOf(drag.x, drag.y)
				let nearest = 0
				let best = 360
				for (let index = 0; index < 26; index += 1) {
					const center = -90 + index * STEP + rotationRef.current
					const delta = Math.abs(unwrap(pointer - center))
					if (delta < best) {
						best = delta
						nearest = index
					}
				}
				alignLetter(nearest)
				return
			}
		}
		commitSteps(Math.round(rotationRef.current / STEP))
	}

	return (
		<div className="caesar-wheel space-y-3">
			<div className="mx-auto w-[min(100%,280px)]">
				<svg
					ref={svgRef}
					viewBox="0 0 400 400"
					role="img"
					aria-label="Bánh xe mật mã Caesar, kéo để xoay"
					className="h-auto w-full touch-none overflow-visible"
				>
					<defs>
						<pattern
							id={hatchId}
							width="6"
							height="6"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(35)"
						>
							<line
								x1="0"
								y1="0"
								x2="0"
								y2="6"
								className="caesar-hatch"
							/>
						</pattern>
					</defs>
					<path
						d={wobblePath(CX, CY, R_OUTER + 22, 0.4)}
						className="caesar-stroke"
					/>
					<path
						d={wobblePath(CX, CY, R_INNER + 28, 1.2)}
						className="caesar-stroke-thin"
					/>
					{LETTERS.map((_, index) => {
						const tick = tickLine(index)
						return (
							<line
								key={`tick-${index}`}
								x1={tick.x1}
								y1={tick.y1}
								x2={tick.x2}
								y2={tick.y2}
								className="caesar-tick"
							/>
						)
					})}
					<g
						ref={rotorRef}
						className={animate ? 'caesar-rotor' : 'caesar-rotor caesar-rotor-still'}
						tabIndex={0}
						aria-label="Vòng trong, dùng phím mũi tên trái phải để xoay"
						style={{ transform: `rotate(${rotation}deg)` }}
						onKeyDown={(event) => {
							if (event.key === 'ArrowLeft') {
								event.preventDefault()
								rotateBy(-1)
							}
							if (event.key === 'ArrowRight') {
								event.preventDefault()
								rotateBy(1)
							}
						}}
					>
						<circle
							cx={CX}
							cy={CY}
							r={R_INNER + 26}
							fill={`url(#${hatchId})`}
							className="caesar-disk"
						/>
						{LETTERS.map((letter, index) => {
							const point = letterPoint(index, R_INNER)
							const aligned = index === shift
							return (
								<text
									key={`inner-${letter}`}
									x={point.x}
									y={point.y}
									className={
										aligned
											? 'caesar-letter caesar-inner caesar-glow'
											: 'caesar-letter caesar-inner'
									}
									style={{ transform: `rotate(${point.rot}deg)` }}
								>
									{letter}
								</text>
							)
						})}
					</g>
					{LETTERS.map((letter, index) => {
						const point = letterPoint(index, R_OUTER)
						return (
							<text
								key={`outer-${letter}`}
								x={point.x}
								y={point.y}
								className={
									index === 0
										? 'caesar-letter caesar-outer caesar-glow'
										: 'caesar-letter caesar-outer'
								}
								style={{ transform: `rotate(${point.rot}deg)` }}
							>
								{letter}
							</text>
						)
					})}
					<polygon
						points="191,16 210,18 200,36"
						className="caesar-pin"
					/>
					<circle cx={CX} cy={CY} r="8" className="caesar-hub" />
					<circle
						cx={CX}
						cy={CY}
						r="148"
						fill="transparent"
						className="caesar-hit"
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerCancel={onPointerUp}
					/>
				</svg>
			</div>
			<p className="text-center text-sm text-pencil/70">
				Vòng ngoài là chữ gốc. Vòng trong là chữ mật mã.
			</p>
			<div className="flex items-center justify-center gap-3">
				<button
					type="button"
					className="caesar-round"
					aria-label="Xoay trái một chữ"
					onClick={() => rotateBy(-1)}
				>
					↺
				</button>
				<button
					type="button"
					className="caesar-round"
					aria-label="Xoay phải một chữ"
					onClick={() => rotateBy(1)}
				>
					↻
				</button>
			</div>
			<div className="grid gap-2 sm:grid-cols-2">
				<label className="caesar-field">
					<span className="caesar-field-label">Văn bản mật mã</span>
					<textarea
						readOnly
						rows={2}
						spellCheck={false}
						value={cipher}
						className="caesar-field-box"
					/>
				</label>
				<label className="caesar-field">
					<span className="caesar-field-label caesar-field-label-cipher">
						Văn bản gốc
					</span>
					<textarea
						readOnly
						rows={2}
						spellCheck={false}
						value={plain}
						className="caesar-field-box"
					/>
				</label>
			</div>
		</div>
	)
}
