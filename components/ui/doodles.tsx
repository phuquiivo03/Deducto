import { cn } from '@/lib/cn'

export function DoodleArrow({ className }: { className?: string }) {
	return (
		<svg
			className={cn('hidden md:block text-pencil', className)}
			width="120"
			height="64"
			viewBox="0 0 120 64"
			fill="none"
			aria-hidden
		>
			<path
				d="M8 40 C 30 8, 70 56, 108 20"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeDasharray="6 4"
				strokeLinecap="round"
			/>
			<path
				d="M98 14 L108 20 L102 28"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function DoodleSquiggle({ className }: { className?: string }) {
	return (
		<svg
			className={cn('hidden md:block text-pencil/50', className)}
			width="200"
			height="24"
			viewBox="0 0 200 24"
			fill="none"
			aria-hidden
		>
			<path
				d="M0 12 Q 25 0, 50 12 T 100 12 T 150 12 T 200 12"
				stroke="currentColor"
				strokeWidth="2"
				strokeDasharray="4 6"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export function DoodleCornerMarks({ className }: { className?: string }) {
	return (
		<svg
			className={cn('pointer-events-none absolute inset-0 text-pencil', className)}
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden
		>
			<path d="M4 20 L4 4 L20 4" fill="none" stroke="currentColor" strokeWidth="2" />
			<path d="M80 4 L96 4 L96 20" fill="none" stroke="currentColor" strokeWidth="2" />
			<path d="M4 80 L4 96 L20 96" fill="none" stroke="currentColor" strokeWidth="2" />
			<path d="M80 96 L96 96 L96 80" fill="none" stroke="currentColor" strokeWidth="2" />
		</svg>
	)
}

export function DoodleScribbleCircle({ className }: { className?: string }) {
	return (
		<svg
			className={cn(
				'hidden md:block animate-bounce-slow text-marker/70',
				className,
			)}
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			aria-hidden
		>
			<ellipse
				cx="24"
				cy="24"
				rx="18"
				ry="16"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeDasharray="3 5"
				transform="rotate(-8 24 24)"
			/>
		</svg>
	)
}
