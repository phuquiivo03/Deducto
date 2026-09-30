'use client'

import { cn } from '@/lib/cn'

export interface ModalShellProps {
	open: boolean
	onClose?: () => void
	title?: string
	children: React.ReactNode
	className?: string
	panelClassName?: string
}

export function ModalShell({
	open,
	onClose,
	title,
	children,
	className,
	panelClassName,
}: ModalShellProps) {
	if (!open) return null

	return (
		<div
			className={cn(
				'fixed inset-0 z-[100] flex items-center justify-center p-4',
				className,
			)}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-shell-title' : undefined}
		>
			<button
				type="button"
				className="absolute inset-0 bg-pencil/30"
				aria-label="Close dialog"
				onClick={onClose}
			/>
			<div
				className={cn(
					'relative z-10 max-h-[90dvh] w-full max-w-lg overflow-auto',
					'border-[3px] border-pencil bg-card p-6',
					'rounded-wobbly-md shadow-hard-lg',
					panelClassName,
				)}
			>
				{title ? (
					<h2
						id="modal-shell-title"
						className="font-heading text-2xl text-pencil mb-4"
					>
						{title}
					</h2>
				) : null}
				{children}
			</div>
		</div>
	)
}
