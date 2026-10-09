import { z } from 'zod'

import { puzzleLockHintSchema } from '@/features/puzzles/hint'
import { puzzleKindSchema, type PuzzleKind } from '@/features/puzzles/registry'

/**
 * The only puzzle fields a creator may send.
 * Ciphertext, shift, diameter, and role are server-owned.
 * `hint` is required for a new lock and stored on the puzzle jsonb.
 */
export const puzzleLockRequestSchema = z.object({
	clueId: z.string().min(1).max(80),
	kind: puzzleKindSchema,
	hint: puzzleLockHintSchema,
})

export type PuzzleLockRequest = z.infer<typeof puzzleLockRequestSchema>

/**
 * Wizard draft. The hint may still be blank; the create API rejects
 * that draft.
 */
export interface PuzzleLockDraft {
	clueId: string
	kind: PuzzleKind
	hint: string
}
