'use client'

import type { ComponentType } from 'react'

import { CaesarTool } from './caesar/caesar-wheel'
import type { PuzzleKind } from './registry'
import { ScytaleTool } from './scytale/scytale-tool'
import {
	PuzzleToolkit,
	type PuzzleSolveModalProps,
	type PuzzleToolProps,
} from './toolkit'

export type { PuzzleSolveModalProps }

/**
 * Kind → solve tool. The popup itself only reads this map.
 * Register a component here when a kind is added.
 */
const puzzleTools: Record<
	PuzzleKind,
	ComponentType<PuzzleToolProps>
> = {
	scytale: ScytaleTool,
	caesar: CaesarTool,
}

export function PuzzleSolveModal (props: PuzzleSolveModalProps) {
	return <PuzzleToolkit {...props} tools={puzzleTools} />
}
