import { randomUUID } from 'node:crypto'

import type {
	GameLevelStrict,
	IAiCaseDraft,
	ILocation,
	IMotive,
	ISuspect,
	IWeapon,
} from '@/features/game/game.schemas'

export interface NormalizedCaseEntities {
	title: string
	description: string
	banner: string
	suspects: ISuspect[]
	weapons: IWeapon[]
	locations: ILocation[]
	motives: IMotive[]
}

const HAIR_COLORS = [
	'black',
	'brown',
	'blonde',
	'red',
	'gray',
	'auburn',
] as const

const WEIGHTS = ['LIGHT', 'MEDIUM', 'HEAVY'] as const

function remapIds(draft: IAiCaseDraft): Map<string, string> {
	const map = new Map<string, string>()
	const all = [
		...draft.suspects,
		...draft.weapons,
		...draft.locations,
		...draft.motives,
	]
	for (const item of all) {
		map.set(item.id, randomUUID())
	}
	return map
}

function distinctHeights(suspects: ISuspect[]): ISuspect[] {
	const used = new Set<number>()
	return suspects.map((s, index) => {
		let height = s.attributes?.height ?? 160 + index
		while (used.has(height)) {
			height += 1
		}
		if (height > 200) {
			height = 150 + index
			while (used.has(height)) {
				height += 1
			}
		}
		used.add(height)
		return {
			...s,
			attributes: {
				...s.attributes,
				height,
				hairColor: s.attributes?.hairColor ?? 'black',
				handedness: s.attributes?.handedness ?? 'RIGHT',
				birthday: s.attributes?.birthday ?? '1990-01-01',
			},
		}
	})
}

function ensureHandednessMix(suspects: ISuspect[]): ISuspect[] {
	const next = [...suspects]
	const allLeft = next.every(
		(s) => s.attributes?.handedness === 'LEFT',
	)
	const allRight = next.every(
		(s) => s.attributes?.handedness === 'RIGHT',
	)
	if (!allLeft && !allRight) {
		return next
	}
	const flip = allLeft ? 'RIGHT' : 'LEFT'
	const target = next[0]
	if (!target.attributes) {
		return next
	}
	next[0] = {
		...target,
		attributes: { ...target.attributes, handedness: flip },
	}
	return next
}

function ensureHairColorMix(suspects: ISuspect[]): ISuspect[] {
	const colors = new Set(
		suspects.map((s) => s.attributes?.hairColor ?? ''),
	)
	if (colors.size >= 2) {
		return suspects
	}
	const next = [...suspects]
	const second = HAIR_COLORS.find(
		(c) => c !== next[0].attributes?.hairColor,
	)
	if (second && next[1]?.attributes) {
		next[1] = {
			...next[1],
			attributes: { ...next[1].attributes!, hairColor: second },
		}
	}
	return next
}

function ensureWeaponAttributeMix(weapons: IWeapon[]): IWeapon[] {
	const next = weapons.map((w) => ({
		...w,
		attributes: {
			weight: w.attributes?.weight ?? 'MEDIUM',
			material: w.attributes?.material ?? 'thép',
			type: w.attributes?.type ?? 'vật',
			...w.attributes,
		},
	}))
	const weights = new Set(next.map((w) => w.attributes?.weight))
	if (weights.size < 2 && next.length >= 2) {
		const alt = WEIGHTS.find((w) => w !== next[0].attributes?.weight)
		if (alt) {
			next[1] = {
				...next[1],
				attributes: { ...next[1].attributes!, weight: alt },
			}
		}
	}
	const materials = new Set(next.map((w) => w.attributes?.material))
	if (materials.size < 2 && next.length >= 2) {
		next[2] = next[2] ?? next[1]
		const idx = Math.min(2, next.length - 1)
		next[idx] = {
			...next[idx],
			attributes: {
				...next[idx].attributes!,
				material:
					next[idx].attributes?.material === 'thép'
						? 'đồng'
						: 'thép',
			},
		}
	}
	return next
}

function spreadForHardAnchors(
	suspects: ISuspect[],
	weapons: IWeapon[],
	level: GameLevelStrict,
): { suspects: ISuspect[]; weapons: IWeapon[] } {
	if (level !== 'hard') {
		return { suspects, weapons }
	}
	let s = [...suspects]
	let w = [...weapons]
	const n = s.length
	const targetMin = 2
	const targetMax = n - 1

	const hairTarget = HAIR_COLORS[0]
	let count = 0
	s = s.map((item, index) => {
		const use = index < targetMin
		if (use) {
			count += 1
		}
		return {
			...item,
			attributes: {
				...item.attributes!,
				hairColor: use ? hairTarget : HAIR_COLORS[1],
				handedness:
					index < targetMin ? 'LEFT' : 'RIGHT',
			},
		}
	})
	if (count < targetMin || count > targetMax) {
		s[0] = {
			...s[0],
			attributes: {
				...s[0].attributes!,
				hairColor: hairTarget,
				handedness: 'LEFT',
			},
		}
	}

	w = w.map((item, index) => ({
		...item,
		attributes: {
			...item.attributes!,
			weight: index < targetMin ? 'HEAVY' : 'LIGHT',
			material: index < targetMin ? 'sắt' : 'gỗ',
		},
	}))
	return { suspects: s, weapons: w }
}

export function normalizeDraft(
	draft: IAiCaseDraft,
	level: GameLevelStrict,
): NormalizedCaseEntities {
	const idMap = remapIds(draft)

	const mapSuspect = (s: ISuspect): ISuspect => ({
		...s,
		id: idMap.get(s.id) ?? randomUUID(),
	})

	let suspects = draft.suspects.map(mapSuspect)
	suspects = distinctHeights(suspects)
	suspects = ensureHandednessMix(suspects)
	suspects = ensureHairColorMix(suspects)

	let weapons = draft.weapons.map((w) => ({
		...w,
		id: idMap.get(w.id) ?? randomUUID(),
	}))
	weapons = ensureWeaponAttributeMix(weapons)

	const hardSpread = spreadForHardAnchors(suspects, weapons, level)
	suspects = hardSpread.suspects
	weapons = hardSpread.weapons

	return {
		title: draft.title,
		description: draft.description,
		banner: draft.banner,
		suspects,
		weapons: weapons,
		locations: draft.locations.map((l) => ({
			...l,
			id: idMap.get(l.id) ?? randomUUID(),
		})),
		motives: draft.motives.map((m) => ({
			...m,
			id: idMap.get(m.id) ?? randomUUID(),
		})),
	}
}
