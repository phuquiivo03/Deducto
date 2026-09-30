'use client'

import { Entity } from '@/types/detective'

interface Props {
	entity: Entity
	selected: boolean
	scale: number
	onSelect: () => void
	onMove: (x: number, y: number) => void
	onStartConnect: (e: React.PointerEvent) => void
}

const PAPER_LINES =
	'repeating-linear-gradient(' +
	'to bottom,' +
	'transparent,' +
	'transparent 21px,' +
	'#e5e0d8 21px,' +
	'#e5e0d8 22px' +
	')'

export default function EntityCard({
	entity,
	selected,
	scale,
	onSelect,
	onMove,
	onStartConnect,
}: Props) {
	const typeLabel =
		entity.type === 'suspect'
			? 'Suspect'
			: entity.type === 'weapon'
				? 'Weapon'
				: 'Location'

	return (
		<div
			data-entity-id={entity.id}
			onPointerDown={(e) => {
				const startX = e.clientX
				const startY = e.clientY
				const ox = entity.x
				const oy = entity.y
				const dragScale = scale || 1

				function move(ev: PointerEvent) {
					const dx = (ev.clientX - startX) / dragScale
					const dy = (ev.clientY - startY) / dragScale
					onMove(ox + dx, oy + dy)
				}

				function up() {
					window.removeEventListener('pointermove', move)
					window.removeEventListener('pointerup', up)
				}

				window.addEventListener('pointermove', move)
				window.addEventListener('pointerup', up)
			}}
			onClick={onSelect}
			style={{
				left: entity.x,
				top: entity.y,
				backgroundImage: PAPER_LINES,
			}}
			className={`
absolute z-10 w-[196px] min-h-[108px]
bg-card border-2 rounded-wobbly-sm
pt-7 pb-3 pl-9 pr-3 shadow-hard
cursor-grab select-none transition-shadow duration-100
hover:rotate-1
${
	selected
		? 'border-pen shadow-hard-lg ring-2 ring-pen/20'
		: 'border-pencil hover:shadow-hard-lg'
}
`}
		>
			<div
				className="absolute top-0 bottom-0 left-7 w-px bg-marker/50 pointer-events-none"
				aria-hidden
			/>

			<div
				className="
absolute top-[-8px] left-1/2 z-10 -translate-x-1/2
flex flex-col items-center pointer-events-none
"
				aria-hidden
			>
				<div
					className="
w-3.5 h-3.5 rounded-full bg-marker
border-2 border-pencil shadow-hard-sm
"
				/>
				<div className="w-px h-1.5 bg-pencil/40" />
			</div>

			<p
				className="
text-[10px] font-heading uppercase tracking-[0.14em]
text-pencil/50 leading-[22px] -mb-px
"
			>
				{typeLabel}
			</p>

			<p className="font-heading text-sm text-pencil leading-[22px]">
				<span>{entity.icon}</span> {entity.name}
			</p>

			{entity.meta ? (
				<p className="text-xs text-pencil/70 leading-[22px] line-clamp-2">
					{entity.meta}
				</p>
			) : null}

			<button
				type="button"
				aria-label={`Connect ${entity.name} to another card`}
				className="
absolute right-0 top-1/2 z-20 h-5 w-5 -translate-y-1/2 translate-x-1/2
rounded-full border-2 border-pen bg-card shadow-hard-sm
cursor-crosshair hover:bg-postit
"
				onPointerDown={(e) => {
					e.stopPropagation()
					onStartConnect(e)
				}}
				onClick={(e) => e.stopPropagation()}
			/>
		</div>
	)
}
