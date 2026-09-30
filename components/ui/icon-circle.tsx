import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface IconCircleProps {
	icon: LucideIcon
	className?: string
	iconClassName?: string
	label?: string
}

export function IconCircle({
	icon: Icon,
	className,
	iconClassName,
	label,
}: IconCircleProps) {
	return (
		<span
			className={cn(
				'inline-flex h-10 w-10 items-center justify-center',
				'rounded-wobbly-sm border-2 border-pencil bg-card',
				'shadow-hard-sm',
				className,
			)}
			aria-hidden={label ? undefined : true}
			aria-label={label}
		>
			<Icon className={cn('h-5 w-5 text-pencil', iconClassName)} strokeWidth={2.5} />
		</span>
	)
}
