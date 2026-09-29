export const STORE_TABS = ['public', 'solved', 'my'] as const

export type StoreTab = (typeof STORE_TABS)[number]

export function parseStoreTab(value: string | undefined): StoreTab {
	if (value === 'solved' || value === 'my') {
		return value
	}
	return 'public'
}
