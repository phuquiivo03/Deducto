import { create } from 'zustand'
import type { ZodIssue } from 'zod'

import type {
	GameLevelStrict,
	IAnswerAnswer,
	IGameMetadata,
	IGeneratedCase,
} from '@/features/game/game.schemas'
import { prepareMetadataForSolver } from '@/features/game/prepare-metadata-for-solver'
import type { PuzzleLockDraft } from '@/features/puzzles/lock-request'
import { suggestPuzzleLock } from '@/features/puzzles/suggest-lock'
import {
	expandAttributeVeils,
	veilOnlyId,
	veilRoleId,
	type AttributeVeilDraft,
} from '@/lib/attribute-veil'
export type CreatePhase = 'prompt' | 'generating' | 'editing' | 'submitting'

export interface CreateGameDraft {
	title: string
	description: string
	banner: string
	level: GameLevelStrict
	gameMetadata: IGameMetadata
}

export interface CreateGameStore {
	phase: CreatePhase
	prompt: string
	level: GameLevelStrict
	draft: CreateGameDraft | null
	result: IAnswerAnswer | null
	originalResult: IAnswerAnswer | null
	issues: ZodIssue[]
	locks: PuzzleLockDraft[]
	veils: AttributeVeilDraft[]
	setPrompt: (prompt: string) => void
	setLevel: (level: GameLevelStrict) => void
	setPhase: (phase: CreatePhase) => void
	setCase: (generated: IGeneratedCase) => void
	updateInfo: (patch: Partial<Omit<CreateGameDraft, 'gameMetadata'>>) => void
	updateEntity: (
		kind: 'suspects' | 'weapons' | 'locations' | 'motives',
		id: string,
		patch: Record<string, unknown>,
	) => void
	updateAttributes: (
		kind: 'suspects' | 'weapons' | 'locations',
		id: string,
		patch: Record<string, unknown>,
	) => void
	addClue: (clue: IGameMetadata['clues'][number]) => void
	updateClue: (id: string, clue: IGameMetadata['clues'][number]) => void
	removeClue: (id: string) => void
	moveClue: (fromIndex: number, toIndex: number) => void
	setLock: (
		clueId: string,
		kind: PuzzleLockDraft['kind'] | null,
		hint?: string,
	) => void
	suggestLock: () => string | null
	setVeil: (clueId: string, attributes: string[] | null) => void
	setResult: (key: keyof IAnswerAnswer, id: string) => void
	restoreOriginalResult: () => void
	setIssues: (issues: ZodIssue[]) => void
	reset: () => void
}

const initialState = {
	phase: 'prompt' as CreatePhase,
	prompt: '',
	level: 'medium' as GameLevelStrict,
	draft: null,
	result: null,
	originalResult: null,
	issues: [] as ZodIssue[],
	locks: [] as PuzzleLockDraft[],
	veils: [] as AttributeVeilDraft[],
}

export const useCreateGameStore = create<CreateGameStore>((set, get) => ({
	...initialState,
	setPrompt: (prompt) => set({ prompt }),
	setLevel: (level) => set({ level }),
	setPhase: (phase) => set({ phase }),
	setCase: (generated) => {
		const { game, result } = generated
		const meta = game.gameMetadata
		set({
			phase: 'editing',
			draft: {
				title: game.title,
				description: game.description,
				banner: game.banner,
				level:
					game.level === 'easy' ||
					game.level === 'medium' ||
					game.level === 'hard'
						? game.level
						: 'medium',
				gameMetadata: meta,
			},
			result: { ...result },
			originalResult: { ...result },
			issues: [],
			locks: [],
			veils: [],
		})
	},
	updateInfo: (patch) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		set({ draft: { ...draft, ...patch }, issues: [] })
	},
	updateEntity: (kind, id, patch) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		const list = draft.gameMetadata[kind].map((item) =>
			item.id === id ? { ...item, ...patch } : item,
		)
		set({
			draft: {
				...draft,
				gameMetadata: { ...draft.gameMetadata, [kind]: list },
			},
			issues: [],
		})
	},
	updateAttributes: (kind, id, patch) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		const list = draft.gameMetadata[kind].map((item) => {
			if (item.id !== id) {
				return item
			}
			return {
				...item,
				attributes: { ...(item.attributes ?? {}), ...patch },
			}
		})
		set({
			draft: {
				...draft,
				gameMetadata: { ...draft.gameMetadata, [kind]: list },
			},
			issues: [],
		})
	},
	addClue: (clue) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		set({
			draft: {
				...draft,
				gameMetadata: {
					...draft.gameMetadata,
					clues: [...draft.gameMetadata.clues, clue],
				},
			},
			issues: [],
		})
	},
	updateClue: (id, clue) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		const clues = draft.gameMetadata.clues.map((c) =>
			c.id === id ? clue : c,
		)
		set({
			draft: {
				...draft,
				gameMetadata: { ...draft.gameMetadata, clues },
			},
			issues: [],
		})
	},
	removeClue: (id) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		set({
			draft: {
				...draft,
				gameMetadata: {
					...draft.gameMetadata,
					clues: draft.gameMetadata.clues.filter((c) => c.id !== id),
				},
			},
			locks: get().locks.filter(
				(lock) => !isClueLock(lock.clueId, id),
			),
			veils: get().veils.filter((veil) => veil.clueId !== id),
			issues: [],
		})
	},
	moveClue: (fromIndex, toIndex) => {
		const draft = get().draft
		if (!draft) {
			return
		}
		const clues = [...draft.gameMetadata.clues]
		if (
			fromIndex < 0 ||
			toIndex < 0 ||
			fromIndex >= clues.length ||
			toIndex >= clues.length
		) {
			return
		}
		const [item] = clues.splice(fromIndex, 1)
		clues.splice(toIndex, 0, item)
		set({
			draft: {
				...draft,
				gameMetadata: { ...draft.gameMetadata, clues },
			},
			issues: [],
		})
	},
	setLock: (clueId, kind, hint) => {
		const current = get().locks.find((lock) => lock.clueId === clueId)
		const locks = get().locks.filter((lock) => lock.clueId !== clueId)
		if (kind) {
			locks.push({
				clueId,
				kind,
				hint: hint ?? current?.hint ?? '',
			})
		}
		set({ locks, issues: [] })
	},
	setVeil: (clueId, attributes) => {
		const veils = get().veils.filter((veil) => veil.clueId !== clueId)
		let locks = get().locks
		if (attributes === null) {
			locks = locks.filter((lock) => !isVeilLock(lock.clueId, clueId))
			set({ veils, locks, issues: [] })
			return
		}
		const turningOn = !get().veils.some((veil) => veil.clueId === clueId)
		if (turningOn) {
			locks = locks.filter((lock) => lock.clueId !== clueId)
		}
		veils.push({ clueId, attributes })
		set({ veils, locks, issues: [] })
	},
	suggestLock: () => {
		const { draft, result, locks, veils } = get()
		if (!draft || !result) return null
		const prepared = prepareMetadataForSolver(draft.gameMetadata)
		const expanded = expandAttributeVeils(prepared, veils)
		const metadata = expanded.ok ? expanded.metadata : prepared
		const suggestion = suggestPuzzleLock(
			metadata,
			result,
			locks.map((lock) => lock.clueId),
		)
		if (!suggestion) return null
		set({ locks: [...locks, suggestion], issues: [] })
		return suggestion.clueId
	},
	setResult: (key, id) => {
		const result = get().result
		if (!result) {
			return
		}
		set({ result: { ...result, [key]: id }, issues: [] })
	},
	restoreOriginalResult: () => {
		const original = get().originalResult
		if (!original) {
			return
		}
		set({ result: { ...original }, issues: [] })
	},
	setIssues: (issues) => set({ issues }),
	reset: () => set({ ...initialState }),
}))

export function newClueId(): string {
	return globalThis.crypto.randomUUID()
}

function isVeilLock (lockId: string, clueId: string): boolean {
	return lockId === veilRoleId(clueId) || lockId === veilOnlyId(clueId)
}

function isClueLock (lockId: string, clueId: string): boolean {
	return lockId === clueId || isVeilLock(lockId, clueId)
}
