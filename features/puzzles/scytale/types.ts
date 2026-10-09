import { z } from 'zod'

import { storedPuzzleHintSchema } from '@/features/puzzles/hint'
import { puzzleRoleSchema } from '@/features/puzzles/puzzle-role'

/**
 * A scytale lock on one clue.
 *
 * `columns` is the rod diameter (letters around the rod).
 * `strip` is the ciphertext, one code point per cell, same length
 * as the clue's canonical sentence. No padding characters.
 */
export const scytalePuzzleSchema = z
	.object({
		kind: z.literal('scytale'),
		role: puzzleRoleSchema,
		columns: z.number().int().min(2),
		strip: z.string().min(1),
		hint: storedPuzzleHintSchema,
	})
	.superRefine((puzzle, ctx) => {
		const length = Array.from(puzzle.strip).length
		if (puzzle.columns >= length) {
			ctx.addIssue({
				code: 'custom',
				message: 'Column count must be shorter than the strip.',
				path: ['columns'],
			})
		}
	})

export type ScytalePuzzle = z.infer<typeof scytalePuzzleSchema>

/**
 * What a player receives. The diameter and role stay on the server.
 */
export const scytalePlayerPuzzleSchema = z.object({
	kind: z.literal('scytale'),
	strip: z.string().min(1),
	hint: storedPuzzleHintSchema,
})

export type ScytalePlayerPuzzle = z.infer<
	typeof scytalePlayerPuzzleSchema
>
