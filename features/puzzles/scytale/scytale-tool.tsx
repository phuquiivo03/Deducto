'use client'

import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/cn'

import { useReportReading, type PuzzleToolProps } from '../toolkit'
import {
	codePoints,
	decodeScytale,
	openingScytaleColumns,
	placeScytale,
} from './scytale'

function Glyph ({ char }: { char: string }) {
	const blank = char === ' '
	return (
		<span
			aria-label={blank ? 'dấu cách' : undefined}
			className={cn(
				'inline-flex h-8 min-w-7 shrink-0 items-center justify-center',
				'border-2 border-pencil bg-card px-0.5',
				'font-heading text-base leading-none',
				blank && 'bg-erased',
			)}
		>
			{blank ? '' : char}
		</span>
	)
}

/**
 * Column chooser for a flat ciphertext strip.
 * The stored diameter is not shown. The number on the control is
 * the player's current choice.
 */
export function ScytaleTool ({
	cipher,
	sentence,
	onReading,
}: PuzzleToolProps) {
	const stripChars = useMemo(() => codePoints(cipher), [cipher])
	const maxColumns = Math.max(2, stripChars.length - 1)
	const [columns, setColumns] = useState(() =>
		openingScytaleColumns(cipher, sentence),
	)
	const safeColumns = Math.min(maxColumns, Math.max(2, columns))
	const grid = placeScytale(cipher, safeColumns)
	const reading = decodeScytale(cipher, safeColumns)
	useReportReading(reading, onReading)

	const setDiameter = (next: number) => {
		setColumns(Math.min(maxColumns, Math.max(2, next)))
	}

	return (
		<div className="space-y-4">
			<section aria-labelledby="scytale-strip-label">
				<h3
					id="scytale-strip-label"
					className="font-heading text-lg text-pencil"
				>
					Dải giấy
				</h3>
				<p
					className="
mt-1 max-h-12 overflow-y-auto break-all
text-sm leading-snug text-pencil
"
				>
					{cipher}
				</p>
			</section>

			<section aria-labelledby="scytale-columns-label">
				<div className="flex items-baseline justify-between gap-3">
					<h3
						id="scytale-columns-label"
						className="font-heading text-lg text-pencil"
					>
						Số cột
					</h3>
					<p className="font-heading text-lg text-pencil">
						{safeColumns}
					</p>
				</div>
				<p className="text-sm text-pencil/70">
					Chọn số cột, rồi đọc từng hàng từ trái sang phải.
				</p>
				<div className="mt-2 flex items-center gap-3">
					<button
						type="button"
						className="
inline-flex h-11 w-11 items-center justify-center
border-2 border-pencil bg-card rounded-wobbly-sm
disabled:opacity-40
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
"
						aria-label="Bớt một cột"
						onClick={() => setDiameter(safeColumns - 1)}
						disabled={safeColumns <= 2}
					>
						<Minus className="h-5 w-5" strokeWidth={2.5} />
					</button>
					<input
						type="range"
						min={2}
						max={maxColumns}
						step={1}
						value={safeColumns}
						aria-labelledby="scytale-columns-label"
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
						aria-label="Thêm một cột"
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
							className="mt-1 grid gap-1"
							style={{
								gridTemplateColumns:
									`repeat(${safeColumns}, minmax(1.75rem, auto))`,
							}}
							aria-label="Bảng chữ sau khi quấn"
						>
							{grid.map((row, rowIndex) =>
								row.map((cell, columnIndex) => (
									<span key={`${rowIndex}-${columnIndex}`}>
										{cell ? (
											<Glyph char={cell} />
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

			<section aria-labelledby="scytale-reading-label">
				<h3
					id="scytale-reading-label"
					className="font-heading text-lg text-pencil"
				>
					Đọc theo hàng
				</h3>
				<p
					className="
mt-1 max-h-12 overflow-y-auto break-words
text-sm leading-snug text-pencil
"
				>
					{reading}
				</p>
			</section>
		</div>
	)
}
