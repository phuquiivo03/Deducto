interface BoardClue {
	text: string
	puzzle?: { hint?: string }
}

/**
 * Unsolved locks show the creator hint instead of the clue sentence.
 * A lock saved before hints existed stays sealed with a plain line.
 * Solved clues show the sentence. The string is plain text.
 */
export function clueBoardText (
	clue: BoardClue,
	solved: boolean,
): string {
	if (!clue.puzzle || solved) return clue.text
	const hint = clue.puzzle.hint?.trim() ?? ''
	if (!hint) return 'Manh mối này đang bị khóa.'
	return hint
}
