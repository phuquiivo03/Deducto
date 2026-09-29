'use client'

import { useCreateGameStore } from '@/store/create-game.store'

import CaseInfoForm from './CaseInfoForm'
import ClueList from './ClueList'
import EntityEditors from './EntityEditors'
import SolutionPicker from './SolutionPicker'
import ValidationSummary from './ValidationSummary'

const NAV = [
	{ id: 'section-overview', label: 'Overview' },
	{ id: 'section-suspects', label: 'Suspects' },
	{ id: 'section-weapons', label: 'Weapons' },
	{ id: 'section-locations', label: 'Locations' },
	{ id: 'section-motives', label: 'Motives' },
	{ id: 'section-clues', label: 'Clues' },
	{ id: 'section-solution', label: 'Solution' },
]

export default function CaseEditor({
	onCreate,
	onRegenerate,
	isSubmitting,
}: {
	onCreate: () => void
	onRegenerate: () => void
	isSubmitting: boolean
}) {
	const draft = useCreateGameStore((s) => s.draft)
	const issues = useCreateGameStore((s) => s.issues)

	if (!draft) {
		return null
	}

	const scrollTo = (id: string) => {
		document.getElementById(id)?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		})
	}

	return (
		<div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-6 items-start">
			<nav
				className="hidden lg:block sticky top-4 space-y-1 rounded-card border border-line bg-card p-3 shadow-card"
				aria-label="Case sections"
			>
				{NAV.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => scrollTo(item.id)}
						className="block w-full text-left text-sm px-2 py-1.5 rounded-lg text-soft hover:bg-paper hover:text-ink"
					>
						{item.label}
					</button>
				))}
			</nav>

			<div className="space-y-4 min-w-0">
				<ValidationSummary issues={issues} />
				<div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
					{NAV.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => scrollTo(item.id)}
							className="shrink-0 text-xs rounded-full border border-line px-3 py-1"
						>
							{item.label}
						</button>
					))}
				</div>
				<CaseInfoForm />
				<EntityEditors metadata={draft.gameMetadata} />
				<ClueList metadata={draft.gameMetadata} />
				<SolutionPicker metadata={draft.gameMetadata} />

				<div className="sticky bottom-0 z-10 -mx-1 px-1 py-3 bg-paper/95 backdrop-blur border-t border-line flex flex-col sm:flex-row gap-2">
					<button
						type="button"
						onClick={onRegenerate}
						disabled={isSubmitting}
						className="flex-1 rounded-xl border border-line bg-white py-3 font-semibold text-sm disabled:opacity-50"
					>
						Regenerate
					</button>
					<button
						type="button"
						onClick={onCreate}
						disabled={isSubmitting}
						className="flex-1 rounded-xl bg-ink text-paper py-3 font-bold disabled:opacity-50"
					>
						{isSubmitting ? 'Creating…' : 'Create case'}
					</button>
				</div>
			</div>
		</div>
	)
}
