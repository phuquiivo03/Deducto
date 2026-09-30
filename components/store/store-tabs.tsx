import Link from 'next/link'

import type { StoreTab } from '@/lib/store-constants'
import { cn } from '@/lib/cn'

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
flex flex-wrap gap-3 p-2
border-2 border-dashed border-pencil rounded-wobbly-md bg-erased/40
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
						className={cn(
							'rounded-wobbly px-5 py-2 text-lg border-2 border-pencil',
							'transition-transform duration-100',
							isActive
								? 'bg-marker text-card shadow-hard-sm -rotate-1'
								: 'bg-card text-pencil hover:bg-pen hover:text-card hover:-rotate-1',
						)}
					>
						{TAB_LABELS[tab]}
					</Link>
				)
			})}
		</div>
	)
}
