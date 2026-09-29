'use client'

import type { GameLevelStrict } from '@/features/game/game.schemas'
import { useCreateGameStore } from '@/store/create-game.store'

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
		<div className="rounded-card border border-line bg-card p-6 shadow-card space-y-5">
			<div>
				<h1 className="font-serif text-2xl text-ink">Design a new case</h1>
				<p className="text-sm text-soft mt-1">
					Describe the setting, victim, and tone. AI builds a full
					deduction puzzle you can edit before publishing.
				</p>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="case-prompt"
					className="text-xs font-semibold uppercase tracking-wide text-soft"
				>
					Your prompt
				</label>
				<textarea
					id="case-prompt"
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					rows={5}
					maxLength={1000}
					placeholder="A cozy mystery at a seaside inn…"
					className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-gold/40"
				/>
				<p className="text-xs text-soft text-right">
					{prompt.length}/1000
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{EXAMPLES.map((ex) => (
					<button
						key={ex}
						type="button"
						onClick={() => setPrompt(ex)}
						className="text-xs rounded-full border border-line px-3 py-1 text-soft hover:border-gold hover:text-ink transition-colors"
					>
						{ex.slice(0, 42)}…
					</button>
				))}
			</div>

			<fieldset className="space-y-2">
				<legend className="text-xs font-semibold uppercase tracking-wide text-soft">
					Difficulty
				</legend>
				<div className="grid grid-cols-3 gap-2">
					{LEVELS.map((item) => (
						<button
							key={item.level}
							type="button"
							onClick={() => setLevel(item.level)}
							className={[
								'rounded-xl border py-3 text-sm font-semibold transition-colors',
								level === item.level
									? 'border-gold bg-goldBg text-ink'
									: 'border-line bg-white text-soft hover:border-gold/50',
							].join(' ')}
						>
							{item.label}
							<span className="block text-xs font-normal text-soft mt-0.5">
								{item.hint}
							</span>
						</button>
					))}
				</div>
			</fieldset>

			<button
				type="button"
				onClick={onGenerate}
				disabled={disabled || prompt.trim().length < 10}
				className="w-full rounded-xl bg-ink text-paper py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Generate case
			</button>
		</div>
	)
}
