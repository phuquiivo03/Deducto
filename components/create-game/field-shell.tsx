'use client'

import type { ZodIssue } from 'zod'

import { cn } from '@/lib/cn'
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
		<div className="space-y-2" data-field-path={path.join('.')}>
			<label
				htmlFor={htmlFor}
				className="font-heading text-base text-pencil block"
			>
				{label}
			</label>
			{children}
			{invalid ? (
				<p className="text-sm text-marker" role="alert">
					{message}
				</p>
			) : null}
		</div>
	)
}

export function inputClass(invalid: boolean): string {
	return cn(
		'w-full border-2 border-pencil bg-card px-4 py-3',
		'rounded-wobbly-sm font-body text-lg text-pencil',
		'placeholder:text-pencil/40',
		'outline-none focus:border-pen focus:ring-2 focus:ring-pen/20',
		invalid && 'border-marker',
	)
}
