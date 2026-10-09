import { z } from 'zod'

/** Stored and accepted hint length, after trim and tag stripping. */
export const PUZZLE_HINT_MAX = 200

/**
 * Plain-text hint. Tags and brackets are removed so the board can
 * render the string as text. Length is checked by the caller.
 */
export function sanitizePuzzleHint (value: string): string {
	return value
		.replace(/<[^>]*>/g, '')
		.replace(/[<>]/g, '')
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
		.trim()
}

/**
 * Optional on a stored puzzle so older rows without a hint still parse.
 */
export const storedPuzzleHintSchema = z
	.string()
	.max(PUZZLE_HINT_MAX)
	.optional()

/**
 * Required on a new lock. The wizard may hold a blank draft; the
 * create API rejects it.
 */
export const puzzleLockHintSchema = z
	.string()
	.transform((value) => sanitizePuzzleHint(value))
	.pipe(
		z.string().min(1, 'Hãy nhập gợi ý ngắn cho manh mối bị khóa.').max(
			PUZZLE_HINT_MAX,
			`Gợi ý tối đa ${PUZZLE_HINT_MAX} ký tự.`,
		),
	)
