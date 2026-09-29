'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { IShortGame } from '@/features/game/game.schemas'
import type { StoreTab } from '@/lib/store-constants'

import { CaseCard } from './case-card'

interface StoreShelfProps {
	games: IShortGame[]
	initialQuery: string
	tab: StoreTab
}

function matchesQuery(game: IShortGame, query: string): boolean {
	const needle = query.trim().toLowerCase()
	if (!needle) return true
	const haystack = [
		game.title,
		game.description,
		String(game.creator),
	].join(' ').toLowerCase()
	return haystack.includes(needle)
}

const EMPTY_BY_TAB: Record<StoreTab, string> = {
	public: 'No public cases yet. Check back soon or create one.',
	solved: 'You have not solved any cases yet. Open a case and accuse the killer.',
	my: 'You have not created any cases yet.',
}

export function StoreShelf({ games, initialQuery, tab }: StoreShelfProps) {
	const router = useRouter()
	const [query, setQuery] = useState(initialQuery)
	const [priceFreeOnly, setPriceFreeOnly] = useState(false)
	const [priceMin, setPriceMin] = useState('')
	const [priceMax, setPriceMax] = useState('')

	const syncQueryToUrl = useCallback(
		(nextQuery: string) => {
			const params = new URLSearchParams({ tab })
			const trimmed = nextQuery.trim()
			if (trimmed) {
				params.set('q', trimmed)
			}
			router.replace(`/store?${params.toString()}`, { scroll: false })
		},
		[router, tab],
	)

	const filtered = useMemo(
		() => games.filter((game) => matchesQuery(game, query)),
		[games, query],
	)

	const handleQueryChange = (value: string) => {
		setQuery(value)
		syncQueryToUrl(value)
	}

	if (games.length === 0) {
		return (
			<p className="text-center text-sm text-soft py-16 max-w-md mx-auto">
				{EMPTY_BY_TAB[tab]}
			</p>
		)
	}

	return (
		<div className="space-y-8">
			<div
				className="
grid gap-6 md:grid-cols-[1fr_auto]
md:items-end
"
			>
				<div className="flex flex-col gap-2">
					<label htmlFor="store-search" className="text-sm font-semibold text-ink">
						Search
					</label>
					<input
						id="store-search"
						type="search"
						value={query}
						onChange={(e) => handleQueryChange(e.target.value)}
						placeholder="Title, description, or creator"
						className="
w-full rounded-xl border border-line bg-card
px-4 py-2.5 text-sm text-ink placeholder:text-soft
focus:outline-none focus:ring-2 focus:ring-gold/40
"
					/>
				</div>

				<fieldset className="flex flex-col gap-2 min-w-0 md:min-w-[280px]">
					<legend className="text-sm font-semibold text-ink mb-1">
						Price
					</legend>
					<label className="flex items-center gap-2 text-sm text-ink">
						<input
							type="checkbox"
							checked={priceFreeOnly}
							onChange={(e) => setPriceFreeOnly(e.target.checked)}
							className="rounded border-line"
						/>
						Free only
					</label>
					<div className="flex gap-2">
						<input
							type="number"
							min={0}
							placeholder="Min"
							value={priceMin}
							onChange={(e) => setPriceMin(e.target.value)}
							className="
flex-1 rounded-xl border border-line bg-card
px-3 py-2 text-sm text-ink placeholder:text-soft
focus:outline-none focus:ring-2 focus:ring-gold/40
"
							aria-label="Minimum price"
						/>
						<input
							type="number"
							min={0}
							placeholder="Max"
							value={priceMax}
							onChange={(e) => setPriceMax(e.target.value)}
							className="
flex-1 rounded-xl border border-line bg-card
px-3 py-2 text-sm text-ink placeholder:text-soft
focus:outline-none focus:ring-2 focus:ring-gold/40
"
							aria-label="Maximum price"
						/>
					</div>
					<p className="text-xs text-soft leading-relaxed">
						Price filtering will apply when cases list a price in the
						catalog.
					</p>
				</fieldset>
			</div>

			{filtered.length === 0 ? (
				<p className="text-center text-sm text-soft py-12">
					No cases match your search. Try different words or clear the
					search field.
				</p>
			) : (
				<ul
					className="
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
list-none p-0 m-0
"
				>
					{filtered.map((game) => (
						<li key={game.id}>
							<CaseCard game={game} />
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
