import { z } from 'zod'

/**
 * How a locked clue participates in the deduction.
 *
 * `required` — the case stops being uniquely solvable without it.
 * `optional` — the case stays uniquely solvable without it.
 */
export const puzzleRoleSchema = z.enum(['required', 'optional'])

export type PuzzleRole = z.infer<typeof puzzleRoleSchema>
