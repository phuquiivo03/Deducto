export default function StoreLoading() {
	return (
		<div className="min-h-dvh bg-paper text-pencil animate-pulse">
			<div className="h-16 border-b-2 border-dashed border-pencil bg-paper" />
			<div className="max-w-5xl mx-auto px-6 py-20 space-y-8">
				<div className="space-y-3">
					<div className="h-10 w-48 rounded-wobbly bg-erased" />
					<div className="h-5 w-full max-w-md rounded-wobbly-sm bg-erased" />
				</div>
				<div className="h-12 w-full max-w-lg rounded-wobbly bg-erased" />
				<ul
					className="
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8
list-none p-0 m-0
"
				>
					{Array.from({ length: 6 }).map((_, i) => (
						<li
							key={i}
							className="
rounded-wobbly-md border-2 border-pencil bg-card overflow-hidden
"
						>
							<div className="aspect-[16/10] bg-erased" />
							<div className="p-5 space-y-3">
								<div className="h-6 w-3/4 rounded-wobbly-sm bg-erased" />
								<div className="h-5 w-full rounded-wobbly-sm bg-erased" />
								<div className="h-4 w-1/3 rounded-wobbly-sm bg-erased" />
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
