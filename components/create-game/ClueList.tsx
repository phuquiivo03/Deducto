'use client'

import { useState } from 'react'

import type { IGameMetadata } from '@/features/game/game.schemas'
import { buildClue } from '@/lib/clue-templates'
import { clueToText } from '@/lib/clues.helper'
import {
	newClueId,
	useCreateGameStore,
} from '@/store/create-game.store'

import ClueEditor from './ClueEditor'

export default function ClueList({ metadata }: { metadata: IGameMetadata }) {
	const clues = metadata.clues
	const moveClue = useCreateGameStore((s) => s.moveClue)
	const removeClue = useCreateGameStore((s) => s.removeClue)
	const addClue = useCreateGameStore((s) => s.addClue)
	const [expandedId, setExpandedId] = useState<string | null>(null)

	const handleAdd = () => {
		const id = newClueId()
		const firstSuspect = metadata.suspects[0]?.id
		const firstWeapon = metadata.weapons[0]?.id
		addClue(
			buildClue(
				id,
				'E1',
				{ suspect_id: firstSuspect, weapon_id: firstWeapon },
				metadata.weapons[0]?.name ?? '',
			),
		)
		setExpandedId(id)
	}

	return (
		<section
			id="section-clues"
			className="rounded-card border border-line bg-card p-5 shadow-card space-y-3"
		>
			<div className="flex items-center justify-between gap-2">
				<h2 className="font-serif text-lg text-ink">Clues</h2>
				<button
					type="button"
					onClick={handleAdd}
					className="text-xs font-semibold rounded-full border border-line px-3 py-1 hover:border-gold"
				>
					+ Add clue
				</button>
			</div>
			<ul className="space-y-2">
				{clues.map((clue, index) => {
					const open = expandedId === clue.id
					const preview = clueToText(clue, metadata)
					return (
						<li
							key={clue.id}
							className="rounded-xl border border-line bg-white overflow-hidden"
						>
							<div className="flex items-start gap-2 px-3 py-2">
								<span className="text-xs font-bold text-gold mt-1">
									#{index + 1}
								</span>
								<button
									type="button"
									onClick={() =>
										setExpandedId(open ? null : clue.id)
									}
									className="flex-1 text-left text-sm text-ink"
								>
									{preview}
								</button>
								<div className="flex flex-col gap-1">
									<button
										type="button"
										disabled={index === 0}
										onClick={() => moveClue(index, index - 1)}
										className="text-xs text-soft disabled:opacity-30"
										aria-label="Move up"
									>
										↑
									</button>
									<button
										type="button"
										disabled={index === clues.length - 1}
										onClick={() => moveClue(index, index + 1)}
										className="text-xs text-soft disabled:opacity-30"
										aria-label="Move down"
									>
										↓
									</button>
								</div>
								<button
									type="button"
									onClick={() => removeClue(clue.id)}
									className="text-xs text-red"
									aria-label="Remove clue"
								>
									×
								</button>
							</div>
							{open ? (
								<div className="px-3 pb-3 border-t border-line">
									<ClueEditor
										clue={clue}
										index={index}
										metadata={metadata}
									/>
								</div>
							) : null}
						</li>
					)
				})}
			</ul>
		</section>
	)
}
