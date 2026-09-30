'use client'

import type { GameLevelStrict } from '@/features/game/game.schemas'
import { useCreateGameStore } from '@/store/create-game.store'
import Card from '@/components/ui/Card'
import { IconCircle } from '@/components/ui/icon-circle'
import { FileText } from 'lucide-react'

import { FieldShell, inputClass } from './field-shell'

export default function CaseInfoForm() {
	const draft = useCreateGameStore((s) => s.draft)
	const issues = useCreateGameStore((s) => s.issues)
	const updateInfo = useCreateGameStore((s) => s.updateInfo)

	if (!draft) {
		return null
	}

	const titleInvalid = Boolean(
		issues.find((i) => i.path[0] === 'title'),
	)

	return (
		<Card
			id="section-overview"
			decoration="tape"
			className="space-y-4 mb-0"
		>
			<div className="flex items-center gap-3">
				<IconCircle icon={FileText} />
				<h2 className="font-heading text-2xl text-pencil">Overview</h2>
			</div>
			<FieldShell
				label="Title"
				htmlFor="case-title"
				path={['title']}
				issues={issues}
			>
				<input
					id="case-title"
					value={draft.title}
					onChange={(e) => updateInfo({ title: e.target.value })}
					className={inputClass(titleInvalid)}
					aria-invalid={titleInvalid}
				/>
			</FieldShell>
			<FieldShell
				label="Description"
				htmlFor="case-description"
				path={['description']}
				issues={issues}
			>
				<textarea
					id="case-description"
					value={draft.description}
					onChange={(e) => updateInfo({ description: e.target.value })}
					rows={3}
					className={inputClass(false)}
				/>
			</FieldShell>
			<FieldShell
				label="Banner path"
				htmlFor="case-banner"
				path={['banner']}
				issues={issues}
			>
				<input
					id="case-banner"
					value={draft.banner}
					onChange={(e) => updateInfo({ banner: e.target.value })}
					className={inputClass(false)}
				/>
			</FieldShell>
			<FieldShell
				label="Level"
				htmlFor="case-level"
				path={['level']}
				issues={issues}
			>
				<select
					id="case-level"
					value={draft.level}
					onChange={(e) =>
						updateInfo({ level: e.target.value as GameLevelStrict })
					}
					className={inputClass(false)}
				>
					<option value="easy">Easy</option>
					<option value="medium">Medium</option>
					<option value="hard">Hard</option>
				</select>
			</FieldShell>
		</Card>
	)
}
