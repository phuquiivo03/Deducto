import type { Note } from '@/types/detective'

const NOTE_ORIGIN = 48
const NOTE_STAGGER = 28

/**
 * Blank sticky note placed near the top-left of the board.
 * Later notes step down so they do not sit on the previous card.
 */
export function createBoardNote(
	existingCount: number,
	id: string = crypto.randomUUID(),
): Note {
	const step = existingCount * NOTE_STAGGER
	return {
		id,
		x: NOTE_ORIGIN + step,
		y: NOTE_ORIGIN + step,
		rot: existingCount % 2 === 0 ? -1.4 : 1.1,
		text: '',
	}
}
