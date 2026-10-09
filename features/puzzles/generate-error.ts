/**
 * Thrown when a kind cannot wrap a sentence.
 * The create API turns this into a 400. It is not an AI error.
 */
export class PuzzleGenerateError extends Error {
	constructor (message: string) {
		super(message)
		this.name = 'PuzzleGenerateError'
	}
}
