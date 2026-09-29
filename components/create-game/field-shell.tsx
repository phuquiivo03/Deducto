'use client'

import type { ZodIssue } from 'zod'

import { firstIssueMessage } from '@/lib/zod-issue-path'

export function FieldShell({
	label,
	htmlFor,
	path,
	issues,
	children,
}: {
	label: string
	htmlFor?: string
	path: (string | number)[]
	issues: ZodIssue[]
	children: React.ReactNode
}) {
	const message = firstIssueMessage(issues, path)
	const invalid = Boolean(message)

	return (
		<div
			className="space-y-1"
			data-field-path={path.join('.')}
		>
			<label
				htmlFor={htmlFor}
				className="text-xs font-semibold uppercase tracking-wide text-soft"
			>
				{label}
			</label>
			{children}
			{invalid ? (
				<p className="text-xs text-red" role="alert">
					{message}
				</p>
			) : null}
		</div>
	)
}

export function inputClass(invalid: boolean): string {
	return [
		'w-full rounded-xl border bg-white px-3 py-2 text-sm text-ink',
		'focus:outline-none focus:ring-2 focus:ring-gold/40',
		invalid ? 'border-red' : 'border-line',
	].join(' ')
}
