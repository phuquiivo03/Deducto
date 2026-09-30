'use client'

import type { ZodIssue } from 'zod'

import { issuePathKey, normalizePath } from '@/lib/zod-issue-path'
import { StickyTag } from '@/components/ui/sticky-tag'

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
			el.classList.add('ring-2', 'ring-marker/40')
			setTimeout(() => {
				el.classList.remove('ring-2', 'ring-marker/40')
			}, 2000)
		}
	}

	return (
		<div
			className="
border-2 border-pencil bg-postit px-4 py-4 rounded-wobbly-md shadow-hard-sm
"
			role="alert"
		>
			<StickyTag tone="marker" className="mb-3 rotate-0">
				Fix {issues.length} issue{issues.length === 1 ? '' : 's'} before
				publishing
			</StickyTag>
			<ul className="space-y-2 max-h-40 overflow-y-auto">
				{issues.slice(0, 12).map((issue, i) => (
					<li key={`${issuePathKey(issue.path)}-${i}`}>
						<button
							type="button"
							onClick={() => handleJump(issue.path)}
							className="text-left text-sm text-marker wavy-underline"
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
