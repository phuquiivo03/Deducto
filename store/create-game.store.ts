import { create } from 'zustand'
import type { ZodIssue } from 'zod'

import type {
	GameLevelStrict,
	IAnswerAnswer,
	IGameMetadata,
	IGeneratedCase,
} from '@/features/game/game.schemas'
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
