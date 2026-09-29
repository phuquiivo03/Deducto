'use client'

import type { ZodIssue } from 'zod'

import { issuePathKey, normalizePath } from '@/lib/zod-issue-path'

export default function ValidationSummary({
	issues,
}: {
	issues: ZodIssue[]
}) {
	if (issues.length === 0) {
		return null
	}

	const handleJump = (path: ZodIssue['path']) => {
		const key = issuePathKey(path)
		const el = document.querySelector(`[data-field-path="${key}"]`)
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			el.classList.add('ring-2', 'ring-red/40')
			setTimeout(() => {
				el.classList.remove('ring-2', 'ring-red/40')
			}, 2000)
		}
	}

	return (
		<div
			className="rounded-xl border border-red/30 bg-redBg px-4 py-3 text-sm"
			role="alert"
		>
			<p className="font-semibold text-ink mb-2">
				Fix {issues.length} issue{issues.length === 1 ? '' : 's'} before
				publishing
			</p>
			<ul className="space-y-1 max-h-40 overflow-y-auto">
				{issues.slice(0, 12).map((issue, i) => (
					<li key={`${issuePathKey(issue.path)}-${i}`}>
						<button
							type="button"
							onClick={() => handleJump(issue.path)}
							className="text-left text-xs text-red underline"
						>
							{normalizePath(issue.path).length > 0
								? `${normalizePath(issue.path).join(' → ')}: `
								: ''}
							{issue.message}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}
