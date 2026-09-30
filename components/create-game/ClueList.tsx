'use client'

import { useState } from 'react'

import type { IGameMetadata } from '@/features/game/game.schemas'
import { buildClue } from '@/lib/clue-templates'
import { clueToText } from '@/lib/clues.helper'
import {
	newClueId,
	useCreateGameStore,
} from '@/store/create-game.store'
import Card from '@/components/ui/Card'
import { buttonClassName } from '@/components/ui/button'

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
		<Card id="section-clues" className="space-y-4 mb-0">
			<div className="flex items-center justify-between gap-2">
				<h2 className="font-heading text-2xl text-pencil">Clues</h2>
				<button
					type="button"
					onClick={handleAdd}
					className={buttonClassName({
						variant: 'secondary',
						size: 'sm',
					})}
				>
					+ Add clue
				</button>
			</div>
			<ul className="space-y-3">
				{clues.map((clue, index) => {
					const open = expandedId === clue.id
					const preview = clueToText(clue, metadata)
					return (
						<li
							key={clue.id}
							className="
rounded-wobbly-sm border-2 border-pencil bg-card overflow-hidden
shadow-paper -rotate-1
"
						>
							<div className="flex items-start gap-2 px-4 py-3">
								<span className="font-heading text-pen mt-0.5">
									#{index + 1}
								</span>
								<button
									type="button"
									onClick={() =>
										setExpandedId(open ? null : clue.id)
									}
									className="flex-1 text-left text-base text-pencil"
								>
									{preview}
								</button>
								<div className="flex flex-col gap-1">
									<button
										type="button"
										disabled={index === 0}
										onClick={() => moveClue(index, index - 1)}
										className="text-sm text-pencil/60 disabled:opacity-30"
										aria-label="Move up"
									>
										↑
									</button>
									<button
										type="button"
										disabled={index === clues.length - 1}
										onClick={() => moveClue(index, index + 1)}
										className="text-sm text-pencil/60 disabled:opacity-30"
										aria-label="Move down"
									>
										↓
									</button>
								</div>
								<button
									type="button"
									onClick={() => removeClue(clue.id)}
									className="text-sm text-marker font-heading"
									aria-label="Remove clue"
								>
									×
								</button>
							</div>
							{open ? (
								<div className="px-4 pb-4 border-t-2 border-dashed border-pencil">
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
		</Card>
	)
}
