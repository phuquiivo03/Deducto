'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
	'Reading the crime scene…',
	'Interviewing suspects…',
	'Planting fair clues…',
	'Checking the logic grid…',
	'Polishing the story…',
]

export default function GeneratingState({
	onCancel,
}: {
	onCancel: () => void
}) {
	const [index, setIndex] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((i) => (i + 1) % MESSAGES.length)
		}, 4500)
		return () => clearInterval(timer)
	}, [])

	return (
		<div className="rounded-card border border-line bg-card p-8 shadow-card text-center space-y-6">
			<div className="mx-auto h-12 w-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
			<div>
				<h2 className="font-serif text-xl text-ink">Generating your case</h2>
				<p className="text-sm text-soft mt-2 min-h-[1.25rem]">
					{MESSAGES[index]}
				</p>
				<p className="text-xs text-soft mt-3">
					This can take up to a minute.
				</p>
			</div>
			<button
				type="button"
				onClick={onCancel}
				className="text-sm text-soft underline"
			>
				Cancel
			</button>
		</div>
	)
}
