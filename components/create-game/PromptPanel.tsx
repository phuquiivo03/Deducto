'use client'

import type { GameLevelStrict } from '@/features/game/game.schemas'
import { useCreateGameStore } from '@/store/create-game.store'
import Card from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { cn } from '@/lib/cn'

const EXAMPLES = [
	'Victorian manor during a thunderstorm, six guests, jealous heir',
	'Art gallery opening night, stolen masterpiece, four suspects',
	'Luxury cruise ship, captain found dead, five passengers',
]

const LEVELS: {
	level: GameLevelStrict
	label: string
	hint: string
}[] = [
	{ level: 'easy', label: 'Easy', hint: '3 suspects' },
	{ level: 'medium', label: 'Medium', hint: '4 suspects' },
	{ level: 'hard', label: 'Hard', hint: '5 suspects' },
]

export default function PromptPanel({
	onGenerate,
	disabled,
}: {
	onGenerate: () => void
	disabled?: boolean
}) {
	const prompt = useCreateGameStore((s) => s.prompt)
	const level = useCreateGameStore((s) => s.level)
	const setPrompt = useCreateGameStore((s) => s.setPrompt)
	const setLevel = useCreateGameStore((s) => s.setLevel)

	return (
		<Card decoration="tack" className="space-y-6 mb-0">
			<div>
				<h1 className="font-heading text-3xl text-pencil">
					Design a new case
				</h1>
				<p className="text-base text-pencil/80 mt-2">
					Describe the setting, victim, and tone. AI builds a full
					deduction puzzle you can edit before publishing.
				</p>
			</div>

			<div className="space-y-2 border-b-2 border-dashed border-pencil pb-6">
				<label htmlFor="case-prompt" className="font-heading text-lg">
					Your prompt
				</label>
				<Textarea
					id="case-prompt"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					rows={5}
					maxLength={1000}
					placeholder="A cozy mystery at a seaside inn…"
				/>
				<p className="text-sm text-pencil/60 text-right">
					{prompt.length}/1000
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{EXAMPLES.map((ex) => (
					<button
						key={ex}
						type="button"
						onClick={() => setPrompt(ex)}
						className="
text-sm border-2 border-pencil px-3 py-1 rounded-wobbly-sm
text-pencil/70 hover:bg-postit hover:text-pencil transition-colors
"
					>
						{ex.slice(0, 42)}…
					</button>
				))}
			</div>

			<fieldset className="space-y-3">
				<legend className="font-heading text-lg text-pencil">
					Difficulty
				</legend>
				<div className="grid grid-cols-3 gap-3">
					{LEVELS.map((item) => (
						<button
							key={item.level}
							type="button"
							onClick={() => setLevel(item.level)}
							className={cn(
								'border-2 py-3 text-base rounded-wobbly-sm shadow-paper',
								'transition-transform duration-100',
								level === item.level
									? 'border-pencil bg-postit -rotate-1 shadow-hard-sm'
									: 'border-pencil bg-card text-pencil/70 hover:-rotate-1',
							)}
						>
							{item.label}
							<span className="block text-sm text-pencil/60 mt-0.5">
								{item.hint}
							</span>
						</button>
					))}
				</div>
			</fieldset>

			<Button
				type="button"
				onClick={onGenerate}
				disabled={disabled || prompt.trim().length < 10}
				className="w-full"
			>
				Generate case
			</Button>
		</Card>
	)
}
