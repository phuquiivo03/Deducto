import { cn } from '@/lib/cn'

export interface StickyTagProps {
	children: React.ReactNode
	tone?: 'postit' | 'marker' | 'pen'
	className?: string
}

export function StickyTag({
	children,
	tone = 'postit',
	className,
}: StickyTagProps) {
	return (
		<span
			className={cn(
				'inline-block border-2 border-pencil px-3 py-1',
				'rounded-wobbly-sm text-base shadow-hard-sm',
				'-rotate-1',
				tone === 'postit' && 'bg-postit text-pencil',
				tone === 'marker' && 'bg-marker text-card',
				tone === 'pen' && 'bg-pen text-card',
				className,
			)}
		>
			{children}
		</span>
	)
}
