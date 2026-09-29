'use client'

import type { IGameMetadata } from '@/features/game/game.schemas'
import { useCreateGameStore } from '@/store/create-game.store'

import { FieldShell, inputClass } from './field-shell'

function resultChanged(
	a: Record<string, string> | null,
	b: Record<string, string> | null,
): boolean {
	if (!a || !b) {
		return false
	}
	return (
		a.murder_id !== b.murder_id ||
		a.weapon_id !== b.weapon_id ||
		a.location_id !== b.location_id ||
		a.motive_id !== b.motive_id
	)
}

export default function SolutionPicker({
	metadata,
}: {
	metadata: IGameMetadata
}) {
	const result = useCreateGameStore((s) => s.result)
	const originalResult = useCreateGameStore((s) => s.originalResult)
	const issues = useCreateGameStore((s) => s.issues)
	const setResult = useCreateGameStore((s) => s.setResult)
	const restoreOriginalResult = useCreateGameStore(
		(s) => s.restoreOriginalResult,
	)

	if (!result) {
		return null
	}

	const changed = resultChanged(result, originalResult)

	return (
		<section
			id="section-solution"
			className="rounded-card border border-line bg-card p-5 shadow-card space-y-4"
		>
			<h2 className="font-serif text-lg text-ink">Solution</h2>
			{changed ? (
				<div className="rounded-lg bg-goldBg border border-gold/30 px-3 py-2 text-xs text-ink">
					Clues were generated for the original solution. Changing
					who-dunnit may make the case inconsistent.
					<button
						type="button"
						onClick={restoreOriginalResult}
						className="ml-2 underline font-semibold"
					>
						Restore original
					</button>
				</div>
			) : null}
			<FieldShell
				label="Murderer"
				path={['result', 'murder_id']}
				issues={issues}
			>
				<select
					value={result.murder_id}
					onChange={(e) => setResult('murder_id', e.target.value)}
					className={inputClass(false)}
				>
					{metadata.suspects.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</select>
			</FieldShell>
			<FieldShell
				label="Weapon"
				path={['result', 'weapon_id']}
				issues={issues}
			>
				<select
					value={result.weapon_id}
					onChange={(e) => setResult('weapon_id', e.target.value)}
					className={inputClass(false)}
				>
					{metadata.weapons.map((w) => (
						<option key={w.id} value={w.id}>
							{w.name}
						</option>
					))}
				</select>
			</FieldShell>
			<FieldShell
				label="Location"
				path={['result', 'location_id']}
				issues={issues}
			>
				<select
					value={result.location_id}
					onChange={(e) => setResult('location_id', e.target.value)}
					className={inputClass(false)}
				>
					{metadata.locations.map((l) => (
						<option key={l.id} value={l.id}>
							{l.name}
						</option>
					))}
				</select>
			</FieldShell>
			<FieldShell
				label="Motive"
				path={['result', 'motive_id']}
				issues={issues}
			>
				<select
					value={result.motive_id}
					onChange={(e) => setResult('motive_id', e.target.value)}
					className={inputClass(false)}
				>
					{metadata.motives.map((m) => (
						<option key={m.id} value={m.id}>
							{m.name}
						</option>
					))}
				</select>
			</FieldShell>
		</section>
	)
}
