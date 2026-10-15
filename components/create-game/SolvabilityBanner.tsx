'use client'

import { SOLVABILITY_OK_VI } from '@/features/game/draft-solvability-messages'
import type { DraftSolvabilityView } from '@/hooks/use-draft-solvability'
import { StickyTag } from '@/components/ui/sticky-tag'

export default function SolvabilityBanner ({
	view,
}: {
	view: DraftSolvabilityView
}) {
	if (
		view.status === 'unknown' &&
		!view.isChecking &&
		view.attributeGaps.length === 0
	) {
		return null
	}

	const isZero = view.countLabel === 'Còn 0 khả năng'
	const tone = isZero || view.conflicts.length > 0 ? 'bad' : 'ok'

	return (
		<div
			className={
				tone === 'bad'
					? `
border-2 border-marker bg-postit px-4 py-3
rounded-wobbly-md shadow-hard-sm space-y-2
`
					: `
border-2 border-pencil bg-card px-4 py-3
rounded-wobbly-md shadow-hard-sm space-y-2
`
			}
			role={tone === 'bad' ? 'alert' : 'status'}
			aria-live="polite"
		>
			{view.isChecking ? (
				<p className="text-sm text-pencil/70">Đang kiểm tra logic…</p>
			) : null}

			{view.countLabel ? (
				<p className="font-heading text-2xl text-pencil">
					{view.countLabel}
				</p>
			) : null}

			{view.status === 'valid' && view.attributeGaps.length === 0 ? (
				<StickyTag tone="pen" className="rotate-0 mb-0">
					{SOLVABILITY_OK_VI}
				</StickyTag>
			) : null}

			{view.possibilities.length > 0 ? (
				<ul className="space-y-1 text-base text-pencil">
					{view.possibilities.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			) : null}

			{view.suggestion ? (
				<p className="text-base text-pen">{view.suggestion}</p>
			) : null}

			{view.conflicts.length > 0 ? (
				<ul className="space-y-1 text-base text-marker">
					{view.conflicts.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			) : null}

			{view.attributeGaps.length > 0 ? (
				<ul className="space-y-1 text-base text-marker">
					{view.attributeGaps.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			) : null}

			{view.messageVi && view.conflicts.length === 0 ? (
				<p className="text-sm text-pencil">{view.messageVi}</p>
			) : null}
		</div>
	)
}
