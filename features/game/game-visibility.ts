import { z } from 'zod'

export const gameVisibilitySchema = z.enum(['private', 'public'])

export type GameVisibility = z.infer<typeof gameVisibilitySchema>

export const NEW_GAME_VISIBILITY: GameVisibility = 'private'

export const updateGameVisibilitySchema = z.object({
	visibility: gameVisibilitySchema,
})

export function readVisibility (value: unknown): GameVisibility {
	return value === 'public' ? 'public' : 'private'
}

/**
 * Public cases are readable by anyone. A private case is readable by
 * its creator and by players who have already solved it.
 */
export function canReadGame (input: {
	visibility: GameVisibility
	creatorId: string
	viewerId: string | null
	hasSolved: boolean
}): boolean {
	if (input.visibility === 'public') return true
	if (!input.viewerId) return false
	if (input.viewerId.toLowerCase() === input.creatorId.toLowerCase()) {
		return true
	}
	return input.hasSolved
}

export function publicCatalog<T extends { visibility: GameVisibility }> (
	games: T[],
): T[] {
	return games.filter((game) => game.visibility === 'public')
}
