import Image from 'next/image'
import Link from 'next/link'

import type { IShortGame } from '@/features/game/game.schemas'

function formatLevel(level: string): string {
	if (level === 'easy') return 'Easy'
	if (level === 'medium') return 'Medium'
	if (level === 'hard') return 'Hard'
	return level
}

interface CaseCardProps {
	game: IShortGame
}

export function CaseCard({ game }: CaseCardProps) {
	const banner = game.banner?.trim()
	const description =
		game.description.length > 120
			? `${game.description.slice(0, 117)}…`
			: game.description

	return (
		<Link
			href={`/case/${game.id}`}
			className="
group flex flex-col overflow-hidden
rounded-card border border-line bg-card shadow-card
transition-transform active:scale-[0.99]
hover:border-gold/40
"
		>
			<div className="relative aspect-[16/10] w-full bg-paper border-b border-line">
				{banner ? (
					<Image
						src={banner}
						alt=""
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
						className="object-cover"
					/>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<div className="flex items-start justify-between gap-2">
					<h2
						className="
font-display text-lg text-ink leading-snug
group-hover:text-gold transition-colors
"
					>
						{game.title}
					</h2>
					<span className="shrink-0 text-xs font-semibold text-soft">
						{formatLevel(String(game.level))}
					</span>
				</div>
				<p className="text-sm text-soft leading-relaxed line-clamp-2">
					{description}
				</p>
				<p className="mt-auto pt-2 text-xs text-soft">
					By {String(game.creator)}
				</p>
			</div>
		</Link>
	)
}
