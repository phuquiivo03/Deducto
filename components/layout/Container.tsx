export default function Container({ children }: { children: React.ReactNode }) {
	return (
		<div className="w-full max-w-5xl mx-auto px-6 pt-8 pb-16">{children}</div>
	)
}
