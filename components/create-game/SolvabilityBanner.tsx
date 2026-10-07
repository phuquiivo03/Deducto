'use client'

import { SOLVABILITY_OK_VI } from '@/features/game/draft-solvability-messages'
import type { DraftSolvabilityUiStatus } from '@/hooks/use-draft-solvability'
import { StickyTag } from '@/components/ui/sticky-tag'

export default function SolvabilityBanner({
	status,
	messageVi,
	isChecking,
}: {
	status: DraftSolvabilityUiStatus
	messageVi: string | null
	isChecking: boolean
}) {
	if (status === 'unknown' && !isChecking) {
		return null
	}

	if (isChecking) {
		return (
			<div
				className="
border-2 border-dashed border-pencil bg-erased/40 px-4 py-3 rounded-wobbly-md
"
				role="status"
				aria-live="polite"
			>
				<p className="text-sm text-pencil/70">Đang kiểm tra logic…</p>
			</div>
		)
	}

	if (status === 'valid') {
		return (
			<div
				className="
border-2 border-pencil bg-card px-4 py-3 rounded-wobbly-md shadow-hard-sm
"
				role="status"
				aria-live="polite"
			>
				<StickyTag tone="pen" className="rotate-0 mb-0">
					{SOLVABILITY_OK_VI}
				</StickyTag>
			</div>
		)
	}

	return (
		<div
			className="
border-2 border-pencil bg-postit px-4 py-3 rounded-wobbly-md shadow-hard-sm
"
			role="alert"
			aria-live="polite"
		>
			<StickyTag tone="marker" className="rotate-0 mb-2">
				Chưa thể tạo vụ án
			</StickyTag>
			<p className="text-sm text-pencil">{messageVi}</p>
		</div>
	)
}
