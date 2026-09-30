import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'default' | 'sm' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
	primary: cn(
		'bg-card text-pencil border-pencil',
		'hover:bg-marker hover:text-card hover:border-pencil',
	),
	secondary: cn(
		'bg-erased text-pencil border-pencil',
		'hover:bg-pen hover:text-card hover:border-pencil',
	),
	ghost: cn(
		'bg-transparent text-pencil border-transparent shadow-none',
		'hover:bg-erased/60 hover:shadow-hard-sm',
	),
}

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'min-h-10 px-4 text-base md:text-lg',
	default: 'min-h-12 px-6 text-lg md:text-xl',
	lg: 'min-h-14 px-8 text-xl md:text-2xl',
}

export function buttonClassName(options?: {
	variant?: ButtonVariant
	size?: ButtonSize
	className?: string
	disabled?: boolean
}) {
	const variant = options?.variant ?? 'primary'
	const size = options?.size ?? 'default'
	return cn(
		'inline-flex items-center justify-center gap-2',
		'border-[3px] border-solid',
		'rounded-wobbly shadow-hard',
		'font-body font-normal',
		'transition-transform duration-100',
		'hover:shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5',
		'active:shadow-none active:translate-x-1 active:translate-y-1',
		'disabled:opacity-50 disabled:pointer-events-none',
		variantClasses[variant],
		sizeClasses[size],
		options?.className,
	)
}

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
}

export function Button({
	variant = 'primary',
	size = 'default',
	className,
	type = 'button',
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={buttonClassName({ variant, size, className })}
			{...props}
		/>
	)
}
