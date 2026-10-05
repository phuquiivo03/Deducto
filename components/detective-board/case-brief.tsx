'use client'

import type { IGame } from '@/features/game/game.schemas'
import { caseFileFromGame } from '@/lib/case-file'

interface CaseBriefProps {
	game: Pick<IGame, 'title' | 'description' | 'level'>
}

/**
 * Pinned case premise for the detective board.
 * The text comes from the loaded game, so each case shows its own file.
 */
export default function CaseBrief({ game }: CaseBriefProps) {
	const { description } = caseFileFromGame(game)

	return (
		<section
			aria-label="Case file"
			className="
shrink-0 border-b-2 border-dashed border-erased
bg-postit/50 px-5 py-2
"
		>
			<p className="text-base leading-relaxed text-pencil">
				<span className="mr-2 font-heading text-pen">Case file</span>
				{description}
			</p>
		</section>
	)
}
