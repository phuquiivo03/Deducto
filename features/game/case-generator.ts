import { randomUUID } from 'node:crypto'

import type { ClueAttribute, GameLevelStrict } from '@/features/game/game.schemas'
import type {
	IClue,
	IGameMetadata,
	IAnswerAnswer,
} from '@/features/game/game.schemas'
import { buildClue, detectTemplate } from '@/lib/clue-templates'
import type { TemplateKey } from '@/lib/clue-templates'

import { solveCase } from './case-solver'
import type { NormalizedCaseEntities } from './case-draft'
import { CaseNotSolvableError } from './game-errors'

export type Rng = () => number

interface LevelRules {
	clueMin: number
	clueMax: number
	maxPositiveRatio: number
	maxRedundant: number
	anchorEarlyForbidden: number
}

const LEVEL_RULES: Record<GameLevelStrict, LevelRules> = {
	easy: {
		clueMin: 6,
		clueMax: 9,
		maxPositiveRatio: 0.5,
		maxRedundant: 2,
		anchorEarlyForbidden: 0,
	},
	medium: {
		clueMin: 9,
		clueMax: 14,
		maxPositiveRatio: 0.4,
		maxRedundant: 1,
		anchorEarlyForbidden: 2,
	},
	hard: {
		clueMin: 12,
		clueMax: 20,
		maxPositiveRatio: 0.25,
		maxRedundant: 1,
		anchorEarlyForbidden: 3,
	},
}

interface WorldMaps {
	loc: Map<string, string>
	wpn: Map<string, string>
	mot: Map<string, string>
	murdererId: string
}

interface CandidateClue {
	clue: IClue
	positive: boolean
	kind: 'suspect_location' | 'weapon_location' | 'suspect_motive' | 'other'
}

const POSITIVE_KEYS = new Set<TemplateKey>(['L1', 'L3', 'R1', 'R3'])

function shuffle<T>(items: T[], rng: Rng): T[] {
	const next = [...items]
	for (let i = next.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rng() * (i + 1))
		;[next[i], next[j]] = [next[j], next[i]]
	}
	return next
}

function randomPermutation<T>(items: T[], rng: Rng): T[] {
	return shuffle([...items], rng)
}

function invertMap(map: Map<string, string>): Map<string, string> {
	const inv = new Map<string, string>()
	for (const [key, value] of map) {
		inv.set(value, key)
	}
	return inv
}

function weaponAtLocation(
	world: WorldMaps,
	weaponId: string,
): string {
	const owner = invertMap(world.wpn).get(weaponId)
	if (!owner) {
		return ''
	}
	return world.loc.get(owner) ?? ''
}

function resultFromWorld(world: WorldMaps): IAnswerAnswer {
	const k = world.murdererId
	return {
		murder_id: k,
		weapon_id: world.wpn.get(k)!,
		location_id: world.loc.get(k)!,
		motive_id: world.mot.get(k)!,
	}
}

function metadataFromEntities(
	entities: NormalizedCaseEntities,
	clues: IClue[],
): IGameMetadata {
	return {
		id: randomUUID(),
		suspects: entities.suspects,
		locations: entities.locations,
		weapons: entities.weapons,
		motives: entities.motives,
		clues,
	}
}

function isPositiveClue(clue: IClue): boolean {
	const key = detectTemplate(clue)
	return key !== 'custom' && POSITIVE_KEYS.has(key)
}

function clueTouchesTuple(
	clue: IClue,
	result: IAnswerAnswer,
	entities: NormalizedCaseEntities,
): boolean {
	if (clue.suspect_id === result.murder_id) {
		return true
	}
	if (clue.weapon_id === result.weapon_id) {
		return true
	}
	if (clue.location_id === result.location_id) {
		return true
	}
	const motive = entities.motives.find((m) => m.id === result.motive_id)
	if (
		clue.attribute === 'motive' &&
		motive &&
		clue.value === motive.name
	) {
		return true
	}
	return false
}

function positiveRatioOk(
	clues: IClue[],
	maxRatio: number,
): boolean {
	if (clues.length === 0) {
		return true
	}
	const positive = clues.filter(isPositiveClue).length
	return positive / clues.length <= maxRatio + 1e-9
}

function solveMatches(
	entities: NormalizedCaseEntities,
	clues: IClue[],
	expected: IAnswerAnswer,
): boolean {
	const meta = metadataFromEntities(entities, clues)
	const outcome = solveCase(meta)
	if (outcome.status !== 'unique' || !outcome.tuple) {
		return false
	}
	return (
		outcome.tuple.murderId === expected.murder_id &&
		outcome.tuple.weaponId === expected.weapon_id &&
		outcome.tuple.locationId === expected.location_id &&
		outcome.tuple.motiveId === expected.motive_id
	)
}

function pickLocTemplate(rng: Rng): TemplateKey {
	const options: TemplateKey[] = ['E2', 'L2', 'R2']
	return options[Math.floor(rng() * options.length)]!
}

function pickWpnLocTemplate(rng: Rng): TemplateKey {
	const options: TemplateKey[] = ['E4', 'L4', 'R4']
	return options[Math.floor(rng() * options.length)]!
}

function pickPosLocTemplate(rng: Rng): TemplateKey {
	const options: TemplateKey[] = ['L1', 'R1']
	return options[Math.floor(rng() * options.length)]!
}

function pickPosWpnTemplate(rng: Rng): TemplateKey {
	const options: TemplateKey[] = ['L3', 'R3']
	return options[Math.floor(rng() * options.length)]!
}

function makeClue(
	template: TemplateKey,
	refs: {
		suspect_id?: string
		weapon_id?: string
		location_id?: string
	},
	value: string,
	attribute?: ClueAttribute,
): IClue {
	return buildClue(randomUUID(), template, refs, value, attribute)
}

function buildAnchors(
	level: GameLevelStrict,
	world: WorldMaps,
	entities: NormalizedCaseEntities,
	rng: Rng,
): IClue[] {
	const result = resultFromWorld(world)
	const k = world.murdererId
	const murderWeapon = entities.weapons.find(
		(w) => w.id === result.weapon_id,
	)
	const murderLoc = entities.locations.find(
		(l) => l.id === result.location_id,
	)
	const murderMotive = entities.motives.find(
		(m) => m.id === result.motive_id,
	)
	const murderSuspect = entities.suspects.find((s) => s.id === k)

	if (!murderWeapon || !murderLoc || !murderMotive || !murderSuspect) {
		return []
	}

	if (level === 'easy') {
		return [
			makeClue('A1', {}, murderLoc.name, 'location'),
		]
	}

	if (level === 'medium') {
		const options: IClue[] = [
			makeClue('A1', {}, murderLoc.name, 'location'),
			makeClue('A1', {}, murderMotive.name, 'motive'),
			makeClue(
				'A1',
				{},
				murderWeapon.attributes?.weight ?? 'MEDIUM',
				'weight',
			),
			makeClue(
				'A1',
				{},
				murderWeapon.attributes?.material ?? 'thép',
				'material',
			),
		]
		return [options[Math.floor(rng() * options.length)]!]
	}

	const hair = murderSuspect.attributes?.hairColor ?? 'black'
	const hand = murderSuspect.attributes?.handedness ?? 'LEFT'
	return [
		makeClue('A1', {}, hair, 'hairColor'),
		makeClue('A1', {}, hand, 'handedness'),
		makeClue(
			'A1',
			{},
			murderWeapon.attributes?.weight ?? 'MEDIUM',
			'weight',
		),
		makeClue(
			'A1',
			{},
			murderWeapon.attributes?.material ?? 'thép',
			'material',
		),
	]
}

function suspectMatchesAnchorQuad(
	suspect: NormalizedCaseEntities['suspects'][number],
	weapon: NormalizedCaseEntities['weapons'][number],
	hair: string,
	hand: string,
	weight: string,
	material: string,
): boolean {
	return (
		suspect.attributes?.hairColor === hair &&
		suspect.attributes?.handedness === hand &&
		weapon.attributes?.weight === weight &&
		weapon.attributes?.material === material
	)
}

function buildWorldForLevel(
	entities: NormalizedCaseEntities,
	level: GameLevelStrict,
	rng: Rng,
): WorldMaps | null {
	const suspectIds = entities.suspects.map((s) => s.id)
	const locationIds = entities.locations.map((l) => l.id)
	const weaponIds = entities.weapons.map((w) => w.id)
	const motiveIds = entities.motives.map((m) => m.id)

	const locOrder = randomPermutation(locationIds, rng)
	const motOrder = randomPermutation(motiveIds, rng)
	const loc = new Map<string, string>()
	const mot = new Map<string, string>()
	suspectIds.forEach((id, index) => {
		loc.set(id, locOrder[index]!)
		mot.set(id, motOrder[index]!)
	})

	if (level !== 'hard') {
		const wpnOrder = randomPermutation(weaponIds, rng)
		const wpn = new Map<string, string>()
		suspectIds.forEach((id, index) => {
			wpn.set(id, wpnOrder[index]!)
		})
		const murdererId =
			suspectIds[Math.floor(rng() * suspectIds.length)]!
		return { loc, wpn, mot, murdererId }
	}

	const murdererId =
		suspectIds[Math.floor(rng() * suspectIds.length)]!
	const murderSuspect = entities.suspects.find((s) => s.id === murdererId)
	if (!murderSuspect) {
		return null
	}
	const hair = murderSuspect.attributes?.hairColor ?? 'black'
	const hand = murderSuspect.attributes?.handedness ?? 'LEFT'

	const murderWeapon =
		shuffle(entities.weapons, rng)[0] ?? entities.weapons[0]
	if (!murderWeapon) {
		return null
	}
	const weight = murderWeapon.attributes?.weight ?? 'MEDIUM'
	const material = murderWeapon.attributes?.material ?? 'thép'

	const wpn = new Map<string, string>()
	wpn.set(murdererId, murderWeapon.id)
	const remainingWeapons = weaponIds.filter((id) => id !== murderWeapon.id)
	const others = suspectIds.filter((id) => id !== murdererId)
	const usedWeapons = new Set<string>([murderWeapon.id])

	for (const suspectId of others) {
		const suspect = entities.suspects.find((s) => s.id === suspectId)
		if (!suspect) {
			return null
		}
		let assigned: string | null = null
		for (const weaponId of randomPermutation(remainingWeapons, rng)) {
			if (usedWeapons.has(weaponId)) {
				continue
			}
			const weapon = entities.weapons.find((w) => w.id === weaponId)
			if (!weapon) {
				continue
			}
			if (
				suspectMatchesAnchorQuad(
					suspect,
					weapon,
					hair,
					hand,
					weight,
					material,
				)
			) {
				continue
			}
			assigned = weaponId
			break
		}
		if (!assigned) {
			return null
		}
		wpn.set(suspectId, assigned)
		usedWeapons.add(assigned)
	}

	let matchCount = 0
	for (const s of entities.suspects) {
		const w = entities.weapons.find(
			(item) => item.id === wpn.get(s.id),
		)
		if (
			w &&
			suspectMatchesAnchorQuad(s, w, hair, hand, weight, material)
		) {
			matchCount += 1
		}
	}
	if (matchCount !== 1) {
		return null
	}

	return { loc, wpn, mot, murdererId }
}

function buildCandidates(
	world: WorldMaps,
	entities: NormalizedCaseEntities,
	rng: Rng,
): CandidateClue[] {
	const out: CandidateClue[] = []
	const { suspects, weapons, locations, motives } = entities

	for (const s of suspects) {
		const sLoc = world.loc.get(s.id)!
		for (const l of locations) {
			if (l.id === sLoc) {
				const t = pickPosLocTemplate(rng)
				out.push({
					clue: makeClue(
						t,
						{ suspect_id: s.id, location_id: l.id },
						l.name,
					),
					positive: true,
					kind: 'suspect_location',
				})
			} else {
				const t = pickLocTemplate(rng)
				out.push({
					clue: makeClue(
						t,
						{ suspect_id: s.id, location_id: l.id },
						l.name,
					),
					positive: false,
					kind: 'suspect_location',
				})
			}
		}
	}

	for (const w of weapons) {
		const at = weaponAtLocation(world, w.id)
		for (const l of locations) {
			if (l.id === at) {
				const t = pickPosWpnTemplate(rng)
				out.push({
					clue: makeClue(
						t,
						{ weapon_id: w.id, location_id: l.id },
						l.name,
					),
					positive: true,
					kind: 'weapon_location',
				})
			} else {
				const t = pickWpnLocTemplate(rng)
				out.push({
					clue: makeClue(
						t,
						{ weapon_id: w.id, location_id: l.id },
						l.name,
					),
					positive: false,
					kind: 'weapon_location',
				})
			}
		}
	}

	for (const s of suspects) {
		const sMot = world.mot.get(s.id)!
		for (const m of motives) {
			if (m.id === sMot) {
				continue
			}
			out.push({
				clue: makeClue(
					'E3',
					{ suspect_id: s.id },
					m.name,
				),
				positive: false,
				kind: 'suspect_motive',
			})
		}
	}

	for (const s of suspects) {
		const sWpn = world.wpn.get(s.id)!
		for (const w of weapons) {
			if (w.id === sWpn) {
				continue
			}
			out.push({
				clue: makeClue(
					'E1',
					{ suspect_id: s.id, weapon_id: w.id },
					w.name,
				),
				positive: false,
				kind: 'other',
			})
		}
	}

	return out
}

function clueKey(clue: IClue): string {
	return [
		detectTemplate(clue),
		clue.suspect_id ?? '',
		clue.weapon_id ?? '',
		clue.location_id ?? '',
		clue.attribute,
		clue.value,
	].join('|')
}

function canAddCandidate(
	candidate: CandidateClue,
	clues: IClue[],
	level: GameLevelStrict,
	result: IAnswerAnswer,
	entities: NormalizedCaseEntities,
	rules: LevelRules,
): boolean {
	if (clues.some((c) => clueKey(c) === clueKey(candidate.clue))) {
		return false
	}
	if (!candidate.positive) {
		return true
	}
	const next = [...clues, candidate.clue]
	if (!positiveRatioOk(next, rules.maxPositiveRatio)) {
		return false
	}
	if (level === 'medium' && candidate.clue.suspect_id === result.murder_id) {
		return false
	}
	if (level === 'hard' && clueTouchesTuple(candidate.clue, result, entities)) {
		return false
	}
	if (level === 'easy') {
		const positivesOnT = next.filter(
			(c) => isPositiveClue(c) && clueTouchesTuple(c, result, entities),
		).length
		if (positivesOnT > 1) {
			return false
		}
	}
	return true
}

function hasKind(
	clues: IClue[],
	kind: CandidateClue['kind'],
): boolean {
	for (const clue of clues) {
		const key = detectTemplate(clue)
		if (kind === 'suspect_location') {
			if (
				key === 'E2' ||
				key === 'L1' ||
				key === 'L2' ||
				key === 'R1' ||
				key === 'R2'
			) {
				return true
			}
		}
		if (kind === 'weapon_location') {
			if (
				key === 'E4' ||
				key === 'L3' ||
				key === 'L4' ||
				key === 'R3' ||
				key === 'R4'
			) {
				return true
			}
		}
		if (kind === 'suspect_motive' && key === 'E3') {
			return true
		}
	}
	return false
}

function entityReferenced(
	clue: IClue,
	entityId: string,
	motiveName?: string,
): boolean {
	if (
		clue.suspect_id === entityId ||
		clue.weapon_id === entityId ||
		clue.location_id === entityId
	) {
		return true
	}
	if (motiveName && clue.value === motiveName) {
		return true
	}
	return false
}

function ensureCoverage(
	clues: IClue[],
	pool: CandidateClue[],
	result: IAnswerAnswer,
	entities: NormalizedCaseEntities,
	level: GameLevelStrict,
	rules: LevelRules,
	rng: Rng,
): IClue[] {
	let next = [...clues]
	const tupleIds = new Set([
		result.murder_id,
		result.weapon_id,
		result.location_id,
		result.motive_id,
	])

	const addFromPool = (filter: (c: CandidateClue) => boolean) => {
		const options = shuffle(pool.filter(filter), rng)
		for (const cand of options) {
			if (!canAddCandidate(cand, next, level, result, entities, rules)) {
				continue
			}
			next.push(cand.clue)
			return
		}
	}

	for (const s of entities.suspects) {
		if (tupleIds.has(s.id)) {
			continue
		}
		if (next.some((c) => c.suspect_id === s.id)) {
			continue
		}
		addFromPool((c) => c.clue.suspect_id === s.id)
	}
	for (const w of entities.weapons) {
		if (tupleIds.has(w.id)) {
			continue
		}
		if (next.some((c) => c.weapon_id === w.id)) {
			continue
		}
		addFromPool((c) => c.clue.weapon_id === w.id)
	}
	for (const l of entities.locations) {
		if (tupleIds.has(l.id)) {
			continue
		}
		if (next.some((c) => c.location_id === l.id)) {
			continue
		}
		addFromPool((c) => c.clue.location_id === l.id)
	}
	for (const m of entities.motives) {
		if (tupleIds.has(m.id)) {
			continue
		}
		if (next.some((c) => entityReferenced(c, m.id, m.name))) {
			continue
		}
		addFromPool(
			(c) =>
				c.clue.attribute === 'motive' && c.clue.value === m.name,
		)
	}

	if (!hasKind(next, 'suspect_location')) {
		addFromPool((c) => c.kind === 'suspect_location')
	}
	if (!hasKind(next, 'weapon_location')) {
		addFromPool((c) => c.kind === 'weapon_location')
	}
	if (!hasKind(next, 'suspect_motive')) {
		addFromPool((c) => c.kind === 'suspect_motive')
	}

	return next
}

function orderClues(
	clues: IClue[],
	level: GameLevelStrict,
	rules: LevelRules,
	rng: Rng,
): IClue[] {
	const anchors = clues.filter((c) => detectTemplate(c) === 'A1')
	const rest = clues.filter((c) => detectTemplate(c) !== 'A1')
	const shuffledRest = shuffle(rest, rng)
	const shuffledAnchors = shuffle(anchors, rng)

	if (level === 'easy') {
		return [...shuffledRest, ...shuffledAnchors]
	}

	const merged = shuffle([...shuffledRest, ...shuffledAnchors], rng)
	const anchorIds = new Set(anchors.map((a) => a.id))
	let guard = 0
	while (guard < 40) {
		guard += 1
		let bad = false
		for (let i = 0; i < rules.anchorEarlyForbidden; i += 1) {
			if (merged[i] && anchorIds.has(merged[i]!.id)) {
				bad = true
				break
			}
		}
		if (!bad) {
			break
		}
		const idx = merged.findIndex((c) => anchorIds.has(c.id))
		if (idx < 0) {
			break
		}
		const [anchor] = merged.splice(idx, 1)
		merged.push(anchor!)
	}
	return merged
}

function countRedundant(
	entities: NormalizedCaseEntities,
	clues: IClue[],
	expected: IAnswerAnswer,
): number {
	let redundant = 0
	for (const clue of clues) {
		if (detectTemplate(clue) === 'A1') {
			continue
		}
		const trimmed = clues.filter((c) => c.id !== clue.id)
		if (solveMatches(entities, trimmed, expected)) {
			redundant += 1
		}
	}
	return redundant
}

function tryGenerateOnce(
	entities: NormalizedCaseEntities,
	level: GameLevelStrict,
	rng: Rng,
): { clues: IClue[]; result: IAnswerAnswer } | null {
	const rules = LEVEL_RULES[level]
	const world = buildWorldForLevel(entities, level, rng)
	if (!world) {
		return null
	}

	const result = resultFromWorld(world)
	const anchors = buildAnchors(level, world, entities, rng)
	if (anchors.length === 0) {
		return null
	}

	const pool = buildCandidates(world, entities, rng)
	let clues = [...anchors]

	const negatives = shuffle(
		pool.filter((c) => !c.positive),
		rng,
	)
	const positives = shuffle(
		pool.filter((c) => c.positive),
		rng,
	)

	const tryAdd = (cand: CandidateClue) => {
		if (!canAddCandidate(cand, clues, level, result, entities, rules)) {
			return
		}
		const trial = [...clues, cand.clue]
		if (solveMatches(entities, trial, result)) {
			clues = trial
			return
		}
		clues.push(cand.clue)
	}

	for (const cand of negatives) {
		if (solveMatches(entities, clues, result)) {
			break
		}
		tryAdd(cand)
	}
	for (const cand of positives) {
		if (solveMatches(entities, clues, result)) {
			break
		}
		tryAdd(cand)
	}

	let guard = 0
	while (!solveMatches(entities, clues, result) && guard < 200) {
		guard += 1
		const remaining = shuffle(pool, rng).filter(
			(c) => !clues.some((cl) => clueKey(cl) === clueKey(c.clue)),
		)
		let added = false
		for (const cand of remaining) {
			if (!canAddCandidate(cand, clues, level, result, entities, rules)) {
				continue
			}
			clues.push(cand.clue)
			added = true
			if (solveMatches(entities, clues, result)) {
				break
			}
		}
		if (!added) {
			break
		}
	}

	if (!solveMatches(entities, clues, result)) {
		return null
	}

	const nonAnchors = shuffle(
		clues.filter((c) => detectTemplate(c) !== 'A1'),
		rng,
	)
	for (const clue of nonAnchors) {
		const trimmed = clues.filter((c) => c.id !== clue.id)
		if (solveMatches(entities, trimmed, result)) {
			clues = trimmed
		}
	}

	clues = ensureCoverage(clues, pool, result, entities, level, rules, rng)

	while (clues.length < rules.clueMin) {
		const extra = shuffle(pool, rng).find(
			(c) =>
				!clues.some((cl) => clueKey(cl) === clueKey(c.clue)) &&
				canAddCandidate(c, clues, level, result, entities, rules),
		)
		if (!extra) {
			break
		}
		clues.push(extra.clue)
	}

	if (clues.length > rules.clueMax) {
		const droppable = shuffle(
			clues.filter((c) => detectTemplate(c) !== 'A1'),
			rng,
		)
		for (const clue of droppable) {
			if (clues.length <= rules.clueMax) {
				break
			}
			const trimmed = clues.filter((c) => c.id !== clue.id)
			if (solveMatches(entities, trimmed, result)) {
				clues = trimmed
			}
		}
	}

	if (
		clues.length < rules.clueMin ||
		clues.length > rules.clueMax ||
		!positiveRatioOk(clues, rules.maxPositiveRatio)
	) {
		return null
	}

	if (countRedundant(entities, clues, result) > rules.maxRedundant) {
		const tightened = [...clues]
		const droppable = shuffle(
			tightened.filter((c) => detectTemplate(c) !== 'A1'),
			rng,
		)
		for (const clue of droppable) {
			if (countRedundant(entities, tightened, result) <= rules.maxRedundant) {
				break
			}
			const trimmed = tightened.filter((c) => c.id !== clue.id)
			if (solveMatches(entities, trimmed, result)) {
				clues = trimmed
				tightened.splice(
					tightened.findIndex((c) => c.id === clue.id),
					1,
				)
			}
		}
		if (countRedundant(entities, clues, result) > rules.maxRedundant) {
			return null
		}
	}

	clues = orderClues(clues, level, rules, rng)
	return { clues, result }
}

export function generateCaseLogic(
	entities: NormalizedCaseEntities,
	level: GameLevelStrict,
	rng: Rng = Math.random,
): { clues: IClue[]; result: IAnswerAnswer } {
	const maxAttempts = level === 'hard' ? 120 : 50
	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const built = tryGenerateOnce(entities, level, rng)
		if (built) {
			return built
		}
	}
	throw new CaseNotSolvableError(
		'Could not generate a uniquely solvable clue set for these entities.',
	)
}
