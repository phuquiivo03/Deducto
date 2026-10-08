'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { Lock, Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

import { PuzzleDialog } from '../puzzle-dialog'
import {
	codePoints,
	decodeScytale,
	openingScytaleColumns,
	placeScytale,
} from './scytale'
import type { ScytalePlayerPuzzle } from './types'

export interface ScytaleSolveModalProps {
	puzzle: ScytalePlayerPuzzle
	sentence: string
	onClose: () => void
	onSolved: () => void
}

function Glyph ({
	char,
	compact = false,
}: {
	char: string
	compact?: boolean
}) {
	const blank = char === ' '
	return (
		<span
			aria-label={blank ? 'dấu cách' : undefined}
			className={cn(
				'inline-flex shrink-0 items-center justify-center',
				'border-2 border-pencil bg-card font-heading leading-none',
				compact
					? 'h-8 min-w-7 px-0.5 text-base'
					: 'h-10 min-w-8 px-1 text-lg',
				blank && 'bg-erased',
			)}
		>
			{blank ? '' : char}
		</span>
	)
}

export function ScytaleSolveModal (props: ScytaleSolveModalProps) {
	return (
		<ScytaleSession
			key={`${props.puzzle.strip}\n${props.sentence}`}
			{...props}
		/>
	)
}

function ScytaleSession ({
	puzzle,
	sentence,
	onClose,
	onSolved,
}: ScytaleSolveModalProps) {
	const titleId = useId()
	const helpId = useId()
	const sliderRef = useRef<HTMLInputElement>(null)
	const stripChars = useMemo(
		() => codePoints(puzzle.strip),
		[puzzle.strip],
	)
	const maxColumns = Math.max(2, stripChars.length - 1)
	const [columns, setColumns] = useState(() =>
		openingScytaleColumns(puzzle.strip, sentence),
	)

	const safeColumns = Math.min(maxColumns, Math.max(2, columns))
	const grid = placeScytale(puzzle.strip, safeColumns)
	const reading = decodeScytale(puzzle.strip, safeColumns)
	const matched = reading === sentence

	const setDiameter = (next: number) => {
		setColumns(Math.min(maxColumns, Math.max(2, next)))
	}

	return (
		<PuzzleDialog
			titleId={titleId}
			descriptionId={helpId}
			onClose={onClose}
			initialFocusRef={sliderRef}
		>
			<div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-erased px-5 py-4">
				<div className="min-w-0">
					<p className="flex items-center gap-2 font-heading text-pen">
						<Lock
							className="h-4 w-4"
							strokeWidth={2.5}
							aria-hidden
						/>
						Manh mối bị khóa
					</p>
					<h2
						id={titleId}
						className="mt-1 font-heading text-2xl text-pencil"
					>
						Mật thư Scytale
					</h2>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="
shrink-0 border-2 border-pencil bg-card px-3 py-1.5
rounded-wobbly-sm font-heading text-base text-pencil
hover:bg-postit
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
"
				>
					Đóng
				</button>
			</div>

			<div className="space-y-5 overflow-y-auto px-5 py-5">
				<p id={helpId} className="text-base leading-relaxed text-pencil">
					Dải giấy được quấn quanh một thanh tròn. Chọn đường kính
					— số cột — rồi đọc từng hàng từ trái sang phải.
				</p>

				<section aria-labelledby="scytale-strip-label">
					<h3
						id="scytale-strip-label"
						className="font-heading text-lg text-pencil"
					>
						Dải giấy
					</h3>
					<div className="mt-2 overflow-x-auto pb-1">
						<div className="flex w-max gap-1">
							{stripChars.map((char, index) => (
								<Glyph
									key={`strip-${index}`}
									char={char}
								/>
							))}
						</div>
					</div>
				</section>

				<section aria-labelledby="scytale-diameter-label">
					<div className="flex flex-wrap items-end justify-between gap-3">
						<h3
							id="scytale-diameter-label"
							className="font-heading text-lg text-pencil"
						>
							Đường kính thanh
						</h3>
						<p className="font-heading text-2xl text-pen">
							{safeColumns}
							<span className="ml-2 text-base text-pencil/70">
								cột
							</span>
						</p>
					</div>
					<div className="mt-3 flex items-center gap-3">
						<button
							type="button"
							className="
inline-flex h-11 w-11 items-center justify-center
border-2 border-pencil bg-card rounded-wobbly-sm
disabled:opacity-40
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
"
							aria-label="Thu nhỏ đường kính"
							onClick={() => setDiameter(safeColumns - 1)}
							disabled={safeColumns <= 2}
						>
							<Minus className="h-5 w-5" strokeWidth={2.5} />
						</button>
						<input
							ref={sliderRef}
							type="range"
							min={2}
							max={maxColumns}
							step={1}
							value={safeColumns}
							aria-labelledby="scytale-diameter-label"
							aria-valuemin={2}
							aria-valuemax={maxColumns}
							aria-valuenow={safeColumns}
							aria-valuetext={`${safeColumns} cột`}
							onChange={(event) => {
								setDiameter(Number(event.target.value))
							}}
							className="h-11 w-full accent-pen"
						/>
						<button
							type="button"
							className="
inline-flex h-11 w-11 items-center justify-center
border-2 border-pencil bg-card rounded-wobbly-sm
disabled:opacity-40
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
"
							aria-label="Nới đường kính"
							onClick={() => setDiameter(safeColumns + 1)}
							disabled={safeColumns >= maxColumns}
						>
							<Plus className="h-5 w-5" strokeWidth={2.5} />
						</button>
					</div>
				</section>

				<section aria-labelledby="scytale-wrap-label">
					<h3
						id="scytale-wrap-label"
						className="font-heading text-lg text-pencil"
					>
						Khi quấn lên thanh
					</h3>
					<div className="mt-2 overflow-x-auto pb-2">
						<div className="puzzle-grid w-max" key={safeColumns}>
							<div
								className="grid gap-1"
								style={{
									gridTemplateColumns: `repeat(${safeColumns}, minmax(1.75rem, auto))`,
								}}
								aria-hidden
							>
								{Array.from({ length: safeColumns }, (_, column) => (
									<span
										key={`col-${column}`}
										className="text-center font-heading text-sm text-pencil/50"
									>
										{column + 1}
									</span>
								))}
							</div>
							<div
								className="mt-1 grid gap-1"
								style={{
									gridTemplateColumns: `repeat(${safeColumns}, minmax(1.75rem, auto))`,
								}}
								aria-label="Bảng chữ sau khi quấn"
							>
								{grid.map((row, rowIndex) =>
									row.map((cell, columnIndex) => (
										<span key={`${rowIndex}-${columnIndex}`}>
											{cell ? (
												<Glyph char={cell} compact />
											) : (
												<span className="inline-flex h-8 min-w-7" />
											)}
										</span>
									)),
								)}
							</div>
							<div
								className="mx-2 mt-3 h-3 rounded-full border-2 border-pencil bg-erased"
								aria-hidden
							/>
						</div>
					</div>
				</section>

				<section
					aria-labelledby="scytale-reading-label"
					className={cn(
						'border-2 border-pencil p-4 rounded-wobbly-sm',
						matched ? 'bg-postit' : 'bg-card',
					)}
				>
					<h3
						id="scytale-reading-label"
						className="font-heading text-lg text-pencil"
					>
						Đọc theo hàng
					</h3>
					<p className="mt-2 text-lg leading-relaxed text-pencil break-words">
						{reading}
					</p>
					<p role="status" className="mt-2 text-base text-pen">
						{matched
							? 'Các hàng thành một câu.'
							: 'Các hàng chưa thành câu.'}
					</p>
					{matched ? (
						<div className="puzzle-stamp mt-4 space-y-3">
							<p className="font-heading text-xl text-pencil">
								Khớp rồi
							</p>
							<p className="text-lg text-pencil">{sentence}</p>
							<Button type="button" onClick={onSolved}>
								Ghim manh mối lên bảng
							</Button>
						</div>
					) : null}
				</section>
			</div>
		</PuzzleDialog>
	)
}
