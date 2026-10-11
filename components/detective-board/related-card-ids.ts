import type { Relationship } from '@/types/detective'

/**
 * Card ids joined to `cardId` by a relationship the player drew.
 * Empty links are hidden on the board, so they do not count.
 */
export function relatedCardIds(
	relationships: readonly Relationship[],
	cardId: string,
): Set<string> {
	const related = new Set<string>()

	for (const relationship of relationships) {
		if (relationship.status === 'empty') continue
		if (relationship.a === cardId) related.add(relationship.b)
		else if (relationship.b === cardId) related.add(relationship.a)
	}

	return related
}
