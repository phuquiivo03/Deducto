interface Toast {
	id: number
	text: string
}

export default function ToastStack({ items }: { items: Toast[] }) {
	return (
		<div className="fixed bottom-5 right-5 space-y-2 z-50">
			{items.map((t) => (
				<div
					key={t.id}
					className="
bg-pencil text-card px-4 py-2 rounded-wobbly-sm text-base
border-2 border-pencil shadow-hard
"
				>
					{t.text}
				</div>
			))}
		</div>
	)
}
