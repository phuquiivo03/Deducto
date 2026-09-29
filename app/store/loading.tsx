export default function StoreLoading() {
	return (
		<div className="min-h-dvh bg-paper text-ink animate-pulse">
			<div className="h-16 border-b border-line bg-paper/90" />
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
				<div className="space-y-3">
					<div className="h-9 w-48 rounded-lg bg-line" />
					<div className="h-4 w-full max-w-md rounded bg-line" />
				</div>
				<div className="h-11 w-full max-w-lg rounded-xl bg-line" />
				<ul
					className="
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
list-none p-0 m-0
"
				>
					{Array.from({ length: 6 }).map((_, i) => (
						<li
							key={i}
							className="
rounded-card border border-line bg-card overflow-hidden
"
						>
							<div className="aspect-[16/10] bg-line" />
							<div className="p-4 space-y-2">
								<div className="h-5 w-3/4 rounded bg-line" />
								<div className="h-4 w-full rounded bg-line" />
								<div className="h-3 w-1/3 rounded bg-line" />
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
