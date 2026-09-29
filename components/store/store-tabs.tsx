import Link from 'next/link'

import type { StoreTab } from '@/lib/store-constants'

const TAB_LABELS: Record<StoreTab, string> = {
	public: 'Public',
	solved: 'Solved',
	my: 'My cases',
}

interface StoreTabsProps {
	activeTab: StoreTab
	query?: string
}

export function StoreTabs({ activeTab, query }: StoreTabsProps) {
	return (
		<div
			className="
flex flex-wrap gap-2
p-1 rounded-xl bg-paper border border-line
"
			role="tablist"
			aria-label="Case collections"
		>
			{(Object.keys(TAB_LABELS) as StoreTab[]).map((tab) => {
				const isActive = tab === activeTab
				const params = new URLSearchParams({ tab })
				if (query?.trim()) {
					params.set('q', query.trim())
				}
				return (
					<Link
						key={tab}
						href={`/store?${params.toString()}`}
						role="tab"
						aria-selected={isActive}
						className={`
rounded-lg px-4 py-2 text-sm font-semibold
transition-colors
${
	isActive
		? 'bg-ink text-paper'
		: 'text-ink hover:bg-goldBg'
}
`}
					>
						{TAB_LABELS[tab]}
					</Link>
				)
			})}
		</div>
	)
}
