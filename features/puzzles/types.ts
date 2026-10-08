export type { PuzzleRole } from '@/features/puzzles/puzzle-role'
export type { CluePuzzle, PlayerPuzzle } from '@/features/puzzles/schema'
export type { ScytalePuzzle } from '@/features/puzzles/scytale/types'

export interface PuzzleShapeCheck {
	ok: boolean
	decoded: string
	decodeMatches: boolean
	uniqueKey: boolean
	messages: string[]
}
