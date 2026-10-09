import { z } from 'zod'

import {
	caesarPlayerPuzzleSchema,
	caesarPuzzleSchema,
} from '@/features/puzzles/caesar/types'
import {
	scytalePlayerPuzzleSchema,
	scytalePuzzleSchema,
} from '@/features/puzzles/scytale/types'

/**
 * Presentation wrapper stored on a clue.
 * Add a kind by extending this union and the player union below.
 * `hint` is optional on every kind so older rows still parse.
 */
export const cluePuzzleSchema = z.discriminatedUnion('kind', [
	scytalePuzzleSchema,
	caesarPuzzleSchema,
])

export type CluePuzzle = z.infer<typeof cluePuzzleSchema>

/**
 * Cipher a player may see. No shift, diameter, role, or plaintext.
 * `kind` stays so the client can parse the union. The solve UI does
 * not treat that field as the tool to open.
 * Add a kind by extending this union too.
 */
export const playerCluePuzzleSchema = z.discriminatedUnion('kind', [
	scytalePlayerPuzzleSchema,
	caesarPlayerPuzzleSchema,
])

export type PlayerPuzzle = z.infer<typeof playerCluePuzzleSchema>
