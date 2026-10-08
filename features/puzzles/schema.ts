import { z } from 'zod'

import {
	scytalePlayerPuzzleSchema,
	scytalePuzzleSchema,
} from '@/features/puzzles/scytale/types'

/**
 * Presentation wrapper stored on a clue.
 * Add a kind by extending this union and the player union below.
 */
export const cluePuzzleSchema = z.discriminatedUnion('kind', [
	scytalePuzzleSchema,
])

export type CluePuzzle = z.infer<typeof cluePuzzleSchema>

/**
 * Cipher a player may see. No diameter, role, or plaintext.
 * Add a kind by extending this union too.
 */
export const playerCluePuzzleSchema = z.discriminatedUnion('kind', [
	scytalePlayerPuzzleSchema,
])

export type PlayerPuzzle = z.infer<typeof playerCluePuzzleSchema>
