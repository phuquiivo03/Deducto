'use client'

import { useCreateGameStore } from '@/store/create-game.store'
import { Button, buttonClassName } from '@/components/ui/button'

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
		<div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8 items-start">
			<nav
				className="
hidden lg:block sticky top-4 space-y-1
border-2 border-dashed border-pencil bg-erased/40 p-3 rounded-wobbly-md
"
				aria-label="Case sections"
			>
				{NAV.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => scrollTo(item.id)}
						className="
block w-full text-left text-base px-2 py-2 rounded-wobbly-sm
text-pencil/70 hover:bg-postit hover:text-pencil
"
					>
						{item.label}
					</button>
				))}
			</nav>

			<div className="space-y-8 min-w-0">
				<ValidationSummary issues={issues} />
				<div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
					{NAV.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => scrollTo(item.id)}
							className="
shrink-0 text-sm border-2 border-pencil px-3 py-1 rounded-wobbly-sm bg-card
"
						>
							{item.label}
						</button>
					))}
				</div>
				<CaseInfoForm />
				<EntityEditors metadata={draft.gameMetadata} />
				<ClueList metadata={draft.gameMetadata} />
				<SolutionPicker metadata={draft.gameMetadata} />

				<div
					className="
sticky bottom-0 z-10 -mx-1 px-1 py-4 bg-paper
border-t-2 border-dashed border-pencil flex flex-col sm:flex-row gap-3
"
				>
					<button
						type="button"
						onClick={onRegenerate}
						disabled={isSubmitting}
						className={buttonClassName({
							variant: 'secondary',
							className: 'flex-1',
						})}
					>
						Regenerate
					</button>
					<Button
						type="button"
						onClick={onCreate}
						disabled={isSubmitting}
						className="flex-1"
					>
						{isSubmitting ? 'Creating…' : 'Create case'}
					</Button>
				</div>
			</div>
		</div>
	)
}
