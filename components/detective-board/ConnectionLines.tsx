import { Entity, Relationship } from '@/types/detective'

import { entityAnchor, STATUS_STYLE } from './relationship-line-style'

interface Props {
	entities: Record<string, Entity>
	relationships: Relationship[]
	draft?: { from: Entity; x: number; y: number }
	activeId?: string | null
	onLineClick?: (rel: Relationship, midX: number, midY: number) => void
}

export default function ConnectionLines({
	entities,
	relationships,
	draft,
	activeId,
	onLineClick,
}: Props) {
	return (
		<svg
			className="absolute inset-0 pointer-events-none w-full h-full"
		>
			{relationships.map((rel) => {
				const a = entities[rel.a]
				const b = entities[rel.b]
				if (!a || !b || rel.status === 'empty') return null

				const p1 = entityAnchor(a)
				const p2 = entityAnchor(b)
				const style = STATUS_STYLE[rel.status]
				const midX = (p1.x + p2.x) / 2
				const midY = (p1.y + p2.y) / 2
				const isActive = activeId === rel.id
				const lineLabel = rel.label.trim()

				return (
					<g key={rel.id}>
						<line
							x1={p1.x}
							y1={p1.y}
							x2={p2.x}
							y2={p2.y}
							stroke={style.stroke}
							strokeWidth={isActive ? 3 : 2.5}
							strokeDasharray={style.dash}
							pointerEvents="none"
						/>
						{lineLabel.length > 0 && lineLabel !== '?' && (
							<g pointerEvents="none">
								<rect
									x={midX - lineLabel.length * 3.2 - 6}
									y={midY - 10}
									width={lineLabel.length * 6.4 + 12}
									height={18}
									rx={4}
									fill="#fdfbf7"
									stroke="#e5e0d8"
									strokeWidth={1}
								/>
								<text
									x={midX}
									y={midY + 1}
									textAnchor="middle"
									dominantBaseline="middle"
									fill="#2d2d2d"
									fontSize={11}
									fontWeight={600}
									fontFamily="var(--font-patrick-hand), cursive"
								>
									{lineLabel}
								</text>
							</g>
						)}
						{onLineClick && (
							<line
								x1={p1.x}
								y1={p1.y}
								x2={p2.x}
								y2={p2.y}
								stroke="transparent"
								strokeWidth={14}
								className="cursor-pointer"
								style={{ pointerEvents: 'stroke' }}
								onClick={(e) => {
									e.stopPropagation()
									onLineClick(rel, midX, midY)
								}}
							/>
						)}
					</g>
				)
			})}

			{draft && (
				<line
					x1={entityAnchor(draft.from).x}
					y1={entityAnchor(draft.from).y}
					x2={draft.x}
					y2={draft.y}
					stroke="#2d5da1"
					strokeWidth={2.5}
					strokeDasharray="6 4"
					pointerEvents="none"
				/>
			)}
		</svg>
	)
}
