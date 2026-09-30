import { cn } from '@/lib/cn'

const fieldBase = cn(
	'w-full border-2 border-pencil bg-card px-4 py-3',
	'rounded-wobbly-sm font-body text-lg text-pencil',
	'placeholder:text-pencil/40',
	'outline-none focus:border-pen focus:ring-2 focus:ring-pen/20',
)

export function Input({
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(fieldBase, className)} {...props} />
}

export function Textarea({
	className,
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(fieldBase, 'min-h-[120px] resize-y', className)}
			{...props}
		/>
	)
}

export function Select({
	className,
	children,
	...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select className={cn(fieldBase, className)} {...props}>
			{children}
		</select>
	)
}
