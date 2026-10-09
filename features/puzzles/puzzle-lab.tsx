'use client'

import { useMemo, useState } from 'react'

import CluePanel from '@/components/detective-board/CluePanel'
import Card from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StickyTag } from '@/components/ui/sticky-tag'
import { sampleGame, sampleResult } from '@/data/sample-be'
import type {
	IClue,
	IGame,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { clueToText, gameToClues } from '@/lib/clues.helper'
import { cn } from '@/lib/cn'

import type { PuzzleRole } from './puzzle-role'
import { PuzzleGenerateError } from './scytale/scytale'
import { generatePuzzle } from './registry'
import { PuzzleSolveModal } from './registry-ui'
import { validateCasePuzzles } from './validate-case-puzzles'

function sampleMetadata (): IGameMetadata {
	if (typeof sampleGame.gameMetadata === 'string') {
		throw new Error('sample metadata must be an object')
	}
	return sampleGame.gameMetadata
}

function CheckRow ({
	label,
	ok,
	detail,
}: {
	label: string
	ok: boolean
	detail: string
}) {
	return (
		<li className="border-b border-dashed border-erased py-2 last:border-b-0">
			<p className="font-heading text-lg text-pencil">
				<span className={ok ? 'text-pen' : 'text-marker'}>
					{ok ? 'Pass' : 'Fail'}
				</span>
				<span className="ml-2">{label}</span>
			</p>
			<p className="text-base text-pencil/80">{detail}</p>
		</li>
	)
}

export default function PuzzleLab () {
	const base = useMemo(() => sampleMetadata(), [])
	const [clues, setClues] = useState<IClue[]>(base.clues)
	const [selectedId, setSelectedId] = useState(base.clues[0]?.id ?? '')
	const [role, setRole] = useState<PuzzleRole>(
		base.clues[0]?.puzzle?.role ?? 'required',
	)
	const [error, setError] = useState<string | null>(null)
	const [solvedIds, setSolvedIds] = useState<string[]>([])
	const [openId, setOpenId] = useState<string | null>(null)

	const metadata = useMemo<IGameMetadata>(
		() => ({ ...base, clues }),
		[base, clues],
	)
	const report = useMemo(
		() => validateCasePuzzles(metadata, sampleResult.answer),
		[metadata],
	)
	const selected = clues.find((clue) => clue.id === selectedId) ?? null
	const sentence = selected ? clueToText(selected, metadata) : ''
	const selectedReport = report.clues.find(
		(item) => item.clueId === selectedId,
	)
	const previewGame = useMemo<IGame>(
		() => ({ ...sampleGame, gameMetadata: metadata }),
		[metadata],
	)
	const previewClues = useMemo(
		() => gameToClues(previewGame),
		[previewGame],
	)
	const openClue = previewClues.find((clue) => clue.id === openId) ?? null

	const selectClue = (id: string) => {
		setSelectedId(id)
		const clue = clues.find((item) => item.id === id)
		if (clue?.puzzle) setRole(clue.puzzle.role)
		setError(null)
	}

	const setLockedRole = (next: PuzzleRole) => {
		setRole(next)
		setClues((prev) =>
			prev.map((clue) => {
				if (clue.id !== selectedId || !clue.puzzle) return clue
				return { ...clue, puzzle: { ...clue.puzzle, role: next } }
			}),
		)
	}

	const wrapSelected = () => {
		if (!selected) return
		try {
			const puzzle = generatePuzzle('scytale', sentence, role)
			setClues((prev) =>
				prev.map((clue) =>
					clue.id === selected.id ? { ...clue, puzzle } : clue,
				),
			)
			setSolvedIds((prev) => prev.filter((id) => id !== selected.id))
			setError(null)
		} catch (err) {
			setError(
				err instanceof PuzzleGenerateError
					? err.message
					: 'Could not wrap this clue.',
			)
		}
	}

	const clearSelected = () => {
		setClues((prev) =>
			prev.map((clue) =>
				clue.id === selectedId ? { ...clue, puzzle: undefined } : clue,
			),
		)
		setSolvedIds((prev) => prev.filter((id) => id !== selectedId))
		setError(null)
	}

	const markSolved = (id: string) => {
		setSolvedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
		setOpenId(null)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="font-heading text-4xl text-pencil">
					Puzzle lab
				</h1>
				<StickyTag tone="marker" className="rotate-0">
					Dev only
				</StickyTag>
			</div>
			<p className="max-w-3xl text-lg text-pencil/80">
				Uses the seeded case in data/sample-be.ts. Nothing here calls
				Bedrock or POST /api/generate. Wrap a clue, read the checks,
				then solve the same modal the board opens.
			</p>

			<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
				<Card className="mb-0 space-y-3">
					<h2 className="font-heading text-2xl text-pencil">
						Sample clues
					</h2>
					<ul className="space-y-2">
						{clues.map((clue, index) => {
							const active = clue.id === selectedId
							const text = clueToText(clue, metadata)
							return (
								<li key={clue.id}>
									<button
										type="button"
										onClick={() => selectClue(clue.id)}
										className={cn(
											'w-full border-2 border-pencil px-3 py-2 text-left',
											'rounded-wobbly-sm',
											active ? 'bg-postit' : 'bg-card',
										)}
										aria-pressed={active}
									>
										<span className="font-heading text-pen">
											#{index + 1}
											{clue.puzzle
												? ` · ${clue.puzzle.kind} · ${clue.puzzle.role}`
												: ''}
										</span>
										<span className="mt-1 block text-base text-pencil">
											{text}
										</span>
									</button>
								</li>
							)
						})}
					</ul>
				</Card>

				<div className="space-y-6">
					<Card className="mb-0 space-y-4">
						<h2 className="font-heading text-2xl text-pencil">
							Wrap with Scytale
						</h2>
						{selected ? (
							<p className="text-base text-pencil">
								Canonical sentence: {sentence}
							</p>
						) : null}
						<fieldset className="space-y-2">
							<legend className="font-heading text-lg text-pencil">
								Lock role
							</legend>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="puzzle-role"
									checked={role === 'required'}
									onChange={() => setLockedRole('required')}
								/>
								Required — the case needs this clue
							</label>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="puzzle-role"
									checked={role === 'optional'}
									onChange={() => setLockedRole('optional')}
								/>
								Optional — the case still solves without it
							</label>
						</fieldset>
						<div className="flex flex-wrap gap-3">
							<Button type="button" onClick={wrapSelected}>
								Wrap clue
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={clearSelected}
								disabled={!selected?.puzzle}
							>
								Clear puzzle
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									if (selected?.puzzle) setOpenId(selected.id)
								}}
								disabled={!selected?.puzzle}
							>
								Try puzzle
							</Button>
						</div>
						{error ? (
							<StickyTag tone="marker" className="rotate-0">
								{error}
							</StickyTag>
						) : null}
						{selected?.puzzle?.kind === 'scytale' ? (
							<p className="text-base text-pencil/80">
								Intended diameter: {selected.puzzle.columns}{' '}
								columns. Strip length:{' '}
								{Array.from(selected.puzzle.strip).length}.
							</p>
						) : (
							<p className="text-base text-pencil/80">
								This clue is not locked.
							</p>
						)}
					</Card>

					<Card className="mb-0">
						<h2 className="font-heading text-2xl text-pencil">
							Validation
						</h2>
						<p className="mt-1 text-base text-pencil/80">
							Case gate:{' '}
							<span className="font-heading">
								{report.ok ? 'Pass' : 'Fail'}
							</span>
						</p>
						{selectedReport ? (
							<ul className="mt-2">
								<CheckRow
									label="Decodes to the sentence"
									ok={selectedReport.decodeMatches}
									detail={
										selectedReport.decodeMatches
											? 'The stored diameter restores the canonical sentence.'
											: `Decoded: ${selectedReport.decoded}`
									}
								/>
								<CheckRow
									label="Only one diameter works"
									ok={selectedReport.uniqueKey}
									detail={
										selectedReport.uniqueKey
											? 'Every other diameter in 2..length-1 misses the sentence.'
											: 'Another diameter also spells this sentence.'
									}
								/>
								<CheckRow
									label={
										selectedReport.role === 'required'
											? 'Required for a unique solution'
											: 'Optional: still unique without it'
									}
									ok={selectedReport.roleOk}
									detail={
										selectedReport.messages.find((message) =>
											message.startsWith('Optional') ||
											message.startsWith('Required'),
										) ??
										(selectedReport.roleOk
											? 'The solver agrees with this role.'
											: 'The solver rejected this role.')
									}
								/>
							</ul>
						) : (
							<p className="mt-3 text-base text-pencil/80">
								Wrap the selected clue to run the puzzle checks.
							</p>
						)}
						{report.issues.length > 0 ? (
							<ul className="mt-3 space-y-1 text-base text-marker">
								{report.issues.map((issue) => (
									<li key={issue}>{issue}</li>
								))}
							</ul>
						) : null}
					</Card>
				</div>
			</div>

			<Card className="mb-0">
				<h2 className="font-heading text-2xl text-pencil">
					Board clue panel
				</h2>
				<p className="mt-1 mb-4 text-base text-pencil/80">
					This is the panel from the detective board. A locked clue
					stays sealed until the cipher is solved.
				</p>
				<div className="flex h-[32rem] overflow-hidden border-2 border-dashed border-pencil">
					<CluePanel
						clues={previewClues}
						solvedPuzzleIds={solvedIds}
						onOpenPuzzle={setOpenId}
						onSelect={() => {}}
					/>
				</div>
			</Card>

			{openClue?.puzzle ? (
				<PuzzleSolveModal
					puzzle={openClue.puzzle}
					sentence={openClue.text}
					onClose={() => setOpenId(null)}
					onSolved={() => markSolved(openClue.id)}
				/>
			) : null}
		</div>
	)
}
