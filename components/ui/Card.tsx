import { cn } from '@/lib/cn'

export interface CardProps {
	children: React.ReactNode
	className?: string
	id?: string
	decoration?: 'tape' | 'tack' | 'none'
	tone?: 'white' | 'postit'
	tilt?: 'none' | 'left' | 'right'
}

export default function Card({
	children,
	className,
	id,
	decoration = 'none',
	tone = 'white',
	tilt = 'none',
}: CardProps) {
	const tiltClass =
		tilt === 'left'
			? '-rotate-1'
			: tilt === 'right'
				? 'rotate-1'
				: ''

	return (
		<div
			id={id}
			className={cn(
				'relative mb-4 border-2 border-pencil p-5',
				'rounded-wobbly-md shadow-paper',
				'transition-transform duration-100',
				tone === 'postit' ? 'bg-postit' : 'bg-card',
				tiltClass,
				className,
			)}
		>
			{decoration === 'tape' ? (
				<div
					className="
pointer-events-none absolute left-1/2 top-0 z-10
h-6 w-24 -translate-x-1/2 -translate-y-1/2
rotate-1 border border-pencil/20 bg-erased/80
"
					aria-hidden
				/>
			) : null}
			{decoration === 'tack' ? (
				<div
					className="
pointer-events-none absolute left-1/2 top-0 z-10
h-4 w-4 -translate-x-1/2 -translate-y-1/2
rounded-full border-2 border-pencil bg-marker
shadow-hard-sm
"
					aria-hidden
				/>
			) : null}
			{children}
		</div>
	)
}
