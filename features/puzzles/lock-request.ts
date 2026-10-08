import { z } from 'zod'

import { puzzleKindSchema } from '@/features/puzzles/registry'

/**
 * The only puzzle fields a creator may send.
 * Ciphertext, diameter, and role are server-owned.
 */
export const puzzleLockRequestSchema = z.object({
	clueId: z.string().min(1).max(80),
	kind: puzzleKindSchema,
})

export type PuzzleLockRequest = z.infer<typeof puzzleLockRequestSchema>
