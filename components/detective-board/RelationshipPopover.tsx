'use client'

import { useEffect, useRef, useState } from 'react'

import { RelationshipStatus } from '@/types/detective'
import { Input } from '@/components/ui/input'
import { buttonClassName } from '@/components/ui/button'
import { cn } from '@/lib/cn'

import { STATUS_OPTIONS, STATUS_STYLE } from './relationship-line-style'

interface Props {
	x: number
	y: number
	current?: RelationshipStatus
	currentLabel?: string
	onSave: (status: RelationshipStatus, label: string) => void
	onRemove?: () => void
	onClose: () => void
}

export default function RelationshipPopover({
	x,
	y,
	current,
	currentLabel = '',
	onSave,
	onRemove,
	onClose,
}: Props) {
	const panelRef = useRef<HTMLDivElement>(null)
	const [label, setLabel] = useState(currentLabel)

	useEffect(() => {
		setLabel(currentLabel)
	}, [currentLabel, x, y])

	useEffect(() => {
		function onKey(ev: KeyboardEvent) {
			if (ev.key === 'Escape') onClose()
		}

		function onPointerDown(ev: PointerEvent) {
			const panel = panelRef.current
			if (panel && !panel.contains(ev.target as Node)) onClose()
		}

		window.addEventListener('keydown', onKey)
		window.addEventListener('pointerdown', onPointerDown, true)
		return () => {
			window.removeEventListener('keydown', onKey)
			window.removeEventListener('pointerdown', onPointerDown, true)
		}
	}, [onClose])

	function normalizedLabel() {
		const trimmed = label.trim()
		return trimmed.length > 0 ? trimmed : '?'
	}

	function handleSaveStatus(status: RelationshipStatus) {
		onSave(status, normalizedLabel())
	}

	return (
		<div
			ref={panelRef}
			role="dialog"
			aria-label="Relationship"
			className="
absolute z-50 min-w-[220px]
border-2 border-pencil bg-card p-3 rounded-wobbly-md shadow-hard-lg
"
			style={{ left: x, top: y }}
			onPointerDown={(e) => e.stopPropagation()}
		>
			<p className="px-1 pb-2 text-xs font-heading uppercase text-pencil/60">
				Relationship
			</p>

			<label className="block px-1 pb-3 text-xs font-heading uppercase text-pencil/60">
				Label
				<Input
					type="text"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					placeholder="e.g. was at, owns"
					className="mt-1 text-sm"
					onKeyDown={(e) => {
						if (e.key === 'Enter' && current !== undefined) {
							handleSaveStatus(current)
						}
					}}
				/>
			</label>

			<div className="flex flex-col gap-1">
				{STATUS_OPTIONS.map((status) => {
					const style = STATUS_STYLE[status]
					const isActive = current === status
					return (
						<button
							key={status}
							type="button"
							aria-pressed={isActive}
							onClick={() => handleSaveStatus(status)}
							className={cn(
								'flex items-center gap-2 w-full px-2 py-2 rounded-wobbly-sm',
								'text-left text-sm font-body border-2 border-transparent',
								isActive
									? 'bg-postit border-pencil shadow-hard-sm'
									: 'hover:bg-paper',
							)}
						>
							<svg width="28" height="8" aria-hidden className="shrink-0">
								<line
									x1="0"
									y1="4"
									x2="28"
									y2="4"
									stroke={style.stroke}
									strokeWidth="2.5"
									strokeDasharray={style.dash}
								/>
							</svg>
							<span className="text-pencil/80">{style.label}</span>
						</button>
					)
				})}
			</div>

			{current !== undefined && (
				<button
					type="button"
					onClick={() => handleSaveStatus(current)}
					className={buttonClassName({
						variant: 'secondary',
						size: 'sm',
						className: 'mt-3 w-full',
					})}
				>
					Save label
				</button>
			)}

			{onRemove && (
				<button
					type="button"
					onClick={() => {
						onRemove()
						onClose()
					}}
					className={buttonClassName({
						variant: 'ghost',
						size: 'sm',
						className: 'mt-2 w-full text-marker',
					})}
				>
					Remove
				</button>
			)}
		</div>
	)
}
