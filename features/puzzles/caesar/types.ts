import { z } from 'zod'

import { storedPuzzleHintSchema } from '@/features/puzzles/hint'
import { puzzleRoleSchema } from '@/features/puzzles/puzzle-role'

/**
 * A Caesar lock on one clue.
 *
 * `shift` is the encode offset in 1..25. Zero is the identity and
 * is not stored. `cipher` is the normalized sentence shifted by
 * that amount. The hint is optional so older rows still parse.
 */
export const caesarPuzzleSchema = z.object({
	kind: z.literal('caesar'),
	role: puzzleRoleSchema,
	shift: z.number().int().min(1).max(25),
	cipher: z.string().min(1),
	hint: storedPuzzleHintSchema,
})

export type CaesarPuzzle = z.infer<typeof caesarPuzzleSchema>

/**
 * What a player receives. The shift stays on the server.
 */
export const caesarPlayerPuzzleSchema = z.object({
	kind: z.literal('caesar'),
	cipher: z.string().min(1),
	hint: storedPuzzleHintSchema,
})

export type CaesarPlayerPuzzle = z.infer<
	typeof caesarPlayerPuzzleSchema
>
