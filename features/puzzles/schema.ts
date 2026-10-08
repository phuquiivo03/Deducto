import { z } from 'zod'

import { scytalePuzzleSchema } from '@/features/puzzles/scytale/types'

/**
 * Presentation wrapper stored on a clue.
 * Add a kind by extending this union and registering the folder.
 */
export const cluePuzzleSchema = z.discriminatedUnion('kind', [
	scytalePuzzleSchema,
])

export type CluePuzzle = z.infer<typeof cluePuzzleSchema>
