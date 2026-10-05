import type {
	IAnswerAnswer,
	IClue,
	IGameMetadata,
} from '@/features/game/game.schemas'
import { detectTemplate } from '@/lib/clue-templates'

import { CaseNotSolvableError } from './game-errors'

/**
 * Murderer, weapon, crime scene, and motive.
 * Other suspects may stay partly unassigned.
 */
export interface SolutionTuple {
	murderId: string
	weaponId: string
	locationId: string
	motiveId: string
}

export type SolveStatus = 'invalid' | 'none' | 'unique' | 'ambiguous'

export interface SolveOutcome {
	status: SolveStatus
	tuple: SolutionTuple | null
	issues: string[]
}

interface Named {
	id: string
	name: string
}

interface Constraints {
	locEq: Map<string, Set<string>>
	locNeq: Map<string, Set<string>>
	wpnNeq: Map<string, Set<string>>
	motNeq: Map<string, Set<string>>
	weaponAt: Map<string, Set<string>>
	weaponNotAt: Map<string, Set<string>>
	anchorLocations: Set<string> | null
	anchorMotives: Set<string> | null
	anchorHandedness: Set<string> | null
	anchorHair: Set<string> | null
	anchorWeight: Set<string> | null
	anchorMaterial: Set<string> | null
	issues: string[]
}

const MAX_GROUP = 6

/**
 * Search the deduction model from the case-designer prompt.
 *
 * Place, weapon, and motive are bijections on the suspects. A weapon
 * is found where the suspect who holds it was. Crime-level anchors
 * (no entity id) constrain the murderer or the murder weapon. Entity
 * facts repeat a card and do not narrow the grid.
 */
export function solveCase (metadata: IGameMetadata): SolveOutcome {
	const structure = structuralIssues(metadata)
	if (structure.length > 0) {
		return { status: 'invalid', tuple: null, issues: structure }
	}

	const constraints = interpretClues(metadata)
	if (constraints.issues.length > 0) {
		return {
			status: 'invalid',
			tuple: null,
			issues: constraints.issues,
		}
	}

	const anchorIssues = anchorCoverageIssues(metadata, constraints)
	if (anchorIssues.length > 0) {
		return { status: 'none', tuple: null, issues: anchorIssues }
	}

	const tuples = searchTuples(metadata, constraints)
	if (tuples.length === 0) {
		return { status: 'none', tuple: null, issues: [] }
	}
	if (tuples.length === 1) {
		return { status: 'unique', tuple: tuples[0], issues: [] }
	}
	return { status: 'ambiguous', tuple: null, issues: [] }
}

/**
 * Reject a draft that is unreadable, unsolvable, ambiguous, or whose
 * saved answer is not the single tuple the clues force.
 */
export function assertUniquelySolvable (
	metadata: IGameMetadata,
	result: IAnswerAnswer,
): void {
	const outcome = solveCase(metadata)
	if (outcome.status === 'invalid') {
		throw new CaseNotSolvableError(
			`This case was rejected. ${formatIssues(outcome.issues)}`,
		)
	}
	if (outcome.status === 'none') {
		const detail = outcome.issues[0]
		throw new CaseNotSolvableError(
			detail
				? `This case was rejected. ${detail}`
				: 'This case was rejected because the clues have no solution.',
		)
	}
	if (outcome.status === 'ambiguous') {
		throw new CaseNotSolvableError(
			[
				'This case was rejected because the clues allow',
				'more than one solution. Change the clues until',
				'only one suspect, weapon, location, and motive fit.',
			].join(' '),
		)
	}
	const tuple = outcome.tuple
	if (
		!tuple ||
		tuple.murderId !== result.murder_id ||
		tuple.weaponId !== result.weapon_id ||
		tuple.locationId !== result.location_id ||
		tuple.motiveId !== result.motive_id
	) {
		throw new CaseNotSolvableError(
			[
				'This case was rejected because the saved answer',
				'is not the solution the clues force.',
			].join(' '),
		)
	}
}

function formatIssues (issues: string[]): string {
	const shown = issues.slice(0, 3)
	const extra = issues.length - shown.length
	const body = shown.join(' ')
	if (extra > 0) {
		return `${body} (${extra} more)`
	}
	return body
}

function structuralIssues (metadata: IGameMetadata): string[] {
	const issues: string[] = []
	const counts = [
		metadata.suspects.length,
		metadata.weapons.length,
		metadata.locations.length,
		metadata.motives.length,
	]
	if (counts[0] === 0 || new Set(counts).size !== 1) {
		issues.push(
			'Suspects, weapons, locations, and motives must be the same size and not empty.',
		)
	} else if (counts[0] > MAX_GROUP) {
		issues.push(
			`Cases with more than ${MAX_GROUP} suspects cannot be checked.`,
		)
	}

	pushDuplicate(issues, metadata.suspects, 'suspects')
	pushDuplicate(issues, metadata.weapons, 'weapons')
	pushDuplicate(issues, metadata.locations, 'locations')
	pushDuplicate(issues, metadata.motives, 'motives')
	return issues
}

function pushDuplicate (
	issues: string[],
	items: Named[],
	label: string,
): void {
	const seen = new Set<string>()
	for (const item of items) {
		if (seen.has(item.id)) {
			issues.push(`Two ${label} share the same id.`)
			return
		}
		seen.add(item.id)
	}
}

function emptyConstraints (): Constraints {
	return {
		locEq: new Map(),
		locNeq: new Map(),
		wpnNeq: new Map(),
		motNeq: new Map(),
		weaponAt: new Map(),
		weaponNotAt: new Map(),
		anchorLocations: null,
		anchorMotives: null,
		anchorHandedness: null,
		anchorHair: null,
		anchorWeight: null,
		anchorMaterial: null,
		issues: [],
	}
}

function addPair (
	map: Map<string, Set<string>>,
	key: string,
	value: string,
): void {
	const set = map.get(key) ?? new Set<string>()
	set.add(value)
	map.set(key, set)
}

function tighten (
	current: Set<string> | null,
	incoming: readonly string[],
): Set<string> {
	if (current === null) {
		return new Set(incoming)
	}
	const next = new Set<string>()
	for (const value of incoming) {
		if (current.has(value)) {
			next.add(value)
		}
	}
	return next
}

function idsNamed (items: Named[], name: string): string[] {
	return items.filter((item) => item.name === name).map((item) => item.id)
}

function interpretClues (metadata: IGameMetadata): Constraints {
	const constraints = emptyConstraints()
	const suspectIds = new Set(metadata.suspects.map((item) => item.id))
	const weaponIds = new Set(metadata.weapons.map((item) => item.id))
	const locationIds = new Set(metadata.locations.map((item) => item.id))

	metadata.clues.forEach((clue, index) => {
		applyClue(
			constraints,
			clue,
			index,
			metadata,
			suspectIds,
			weaponIds,
			locationIds,
		)
	})
	return constraints
}

function applyClue (
	constraints: Constraints,
	clue: IClue,
	index: number,
	metadata: IGameMetadata,
	suspectIds: Set<string>,
	weaponIds: Set<string>,
	locationIds: Set<string>,
): void {
	const label = `Clue ${index + 1}`
	const template = detectTemplate(clue)
	const suspect = () =>
		knownId(constraints, label, clue.suspect_id, suspectIds, 'suspect')
	const weapon = () =>
		knownId(constraints, label, clue.weapon_id, weaponIds, 'weapon')
	const location = () =>
		knownId(constraints, label, clue.location_id, locationIds, 'location')

	switch (template) {
		case 'E1': {
			const suspectId = suspect()
			const weaponId = weapon()
			if (suspectId && weaponId) {
				addPair(constraints.wpnNeq, suspectId, weaponId)
			}
			return
		}
		case 'E2':
		case 'L2':
		case 'R2': {
			const suspectId = suspect()
			const locationId = location()
			if (suspectId && locationId) {
				addPair(constraints.locNeq, suspectId, locationId)
			}
			return
		}
		case 'E3': {
			const suspectId = suspect()
			const motiveIds = idsNamed(metadata.motives, clue.value)
			if (!suspectId) {
				return
			}
			if (motiveIds.length === 0) {
				constraints.issues.push(
					`${label} names a motive that is not in this case.`,
				)
				return
			}
			for (const motiveId of motiveIds) {
				addPair(constraints.motNeq, suspectId, motiveId)
			}
			return
		}
		case 'E4':
		case 'L4':
		case 'R4': {
			const weaponId = weapon()
			const locationId = location()
			if (weaponId && locationId) {
				addPair(constraints.weaponNotAt, weaponId, locationId)
			}
			return
		}
		case 'L1':
		case 'R1': {
			const suspectId = suspect()
			const locationId = location()
			if (suspectId && locationId) {
				addPair(constraints.locEq, suspectId, locationId)
			}
			return
		}
		case 'L3':
		case 'R3': {
			const weaponId = weapon()
			const locationId = location()
			if (weaponId && locationId) {
				addPair(constraints.weaponAt, weaponId, locationId)
			}
			return
		}
		case 'A1':
			applyAnchor(constraints, clue, label, metadata)
			return
		case 'A2':
			checkEntityFact(constraints, clue, label, metadata)
			return
		default:
			constraints.issues.push(
				`${label} is not a supported deduction rule.`,
			)
	}
}

function knownId (
	constraints: Constraints,
	label: string,
	id: string | undefined,
	allowed: Set<string>,
	kind: string,
): string | null {
	if (!id || !allowed.has(id)) {
		constraints.issues.push(
			`${label} references a ${kind} that is not in this case.`,
		)
		return null
	}
	return id
}

function applyAnchor (
	constraints: Constraints,
	clue: IClue,
	label: string,
	metadata: IGameMetadata,
): void {
	switch (clue.attribute) {
		case 'location': {
			const ids = idsNamed(metadata.locations, clue.value)
			if (ids.length === 0) {
				constraints.issues.push(
					`${label} names a location that is not in this case.`,
				)
				return
			}
			constraints.anchorLocations = tighten(
				constraints.anchorLocations,
				ids,
			)
			return
		}
		case 'motive': {
			const ids = idsNamed(metadata.motives, clue.value)
			if (ids.length === 0) {
				constraints.issues.push(
					`${label} names a motive that is not in this case.`,
				)
				return
			}
			constraints.anchorMotives = tighten(constraints.anchorMotives, ids)
			return
		}
		case 'handedness':
			if (clue.value !== 'LEFT' && clue.value !== 'RIGHT') {
				constraints.issues.push(
					`${label} must use handedness LEFT or RIGHT.`,
				)
				return
			}
			constraints.anchorHandedness = tighten(
				constraints.anchorHandedness,
				[clue.value],
			)
			return
		case 'hairColor':
			constraints.anchorHair = tighten(constraints.anchorHair, [
				clue.value,
			])
			return
		case 'weight':
			if (
				clue.value !== 'LIGHT' &&
				clue.value !== 'MEDIUM' &&
				clue.value !== 'HEAVY'
			) {
				constraints.issues.push(
					`${label} must use weight LIGHT, MEDIUM, or HEAVY.`,
				)
				return
			}
			constraints.anchorWeight = tighten(constraints.anchorWeight, [
				clue.value,
			])
			return
		case 'material':
			constraints.anchorMaterial = tighten(constraints.anchorMaterial, [
				clue.value,
			])
			return
		default:
			constraints.issues.push(
				`${label} is not a supported deduction rule.`,
			)
	}
}

function checkEntityFact (
	constraints: Constraints,
	clue: IClue,
	label: string,
	metadata: IGameMetadata,
): void {
	if (clue.suspect_id) {
		const suspect = metadata.suspects.find(
			(item) => item.id === clue.suspect_id,
		)
		if (!suspect) {
			constraints.issues.push(
				`${label} references a suspect that is not in this case.`,
			)
			return
		}
		if (clue.attribute === 'handedness') {
			if (suspect.attributes?.handedness !== clue.value) {
				constraints.issues.push(
					`${label} disagrees with ${suspect.name}'s handedness.`,
				)
			}
			return
		}
		if (clue.attribute === 'height') {
			const height = suspect.attributes?.height
			if (height === undefined || String(height) !== clue.value) {
				constraints.issues.push(
					`${label} disagrees with ${suspect.name}'s height.`,
				)
			}
			return
		}
		constraints.issues.push(
			`${label} is not a supported deduction rule.`,
		)
		return
	}

	if (clue.weapon_id) {
		const weapon = metadata.weapons.find(
			(item) => item.id === clue.weapon_id,
		)
		if (!weapon) {
			constraints.issues.push(
				`${label} references a weapon that is not in this case.`,
			)
			return
		}
		if (clue.attribute === 'weight') {
			if (weapon.attributes?.weight !== clue.value) {
				constraints.issues.push(
					`${label} disagrees with the ${weapon.name}'s weight.`,
				)
			}
			return
		}
		if (clue.attribute === 'material') {
			if (weapon.attributes?.material !== clue.value) {
				constraints.issues.push(
					`${label} disagrees with the ${weapon.name}'s material.`,
				)
			}
			return
		}
		constraints.issues.push(
			`${label} is not a supported deduction rule.`,
		)
		return
	}

	constraints.issues.push(`${label} is not a supported deduction rule.`)
}

function anchorCoverageIssues (
	metadata: IGameMetadata,
	constraints: Constraints,
): string[] {
	const issues: string[] = []
	disagree(issues, constraints.anchorLocations, 'location')
	disagree(issues, constraints.anchorMotives, 'motive')
	disagree(issues, constraints.anchorHandedness, 'handedness')
	disagree(issues, constraints.anchorHair, 'hair color')
	disagree(issues, constraints.anchorWeight, 'weight')
	disagree(issues, constraints.anchorMaterial, 'material')
	if (issues.length > 0) {
		return issues
	}

	const hand = only(constraints.anchorHandedness)
	if (
		hand &&
		!metadata.suspects.some(
			(suspect) => suspect.attributes?.handedness === hand,
		)
	) {
		issues.push(`No suspect is ${hand}-handed.`)
	}

	const hair = only(constraints.anchorHair)
	if (
		hair &&
		!metadata.suspects.some(
			(suspect) => suspect.attributes?.hairColor === hair,
		)
	) {
		issues.push(`No suspect has hair color ${hair}.`)
	}

	const weight = only(constraints.anchorWeight)
	if (
		weight &&
		!metadata.weapons.some(
			(weapon) => weapon.attributes?.weight === weight,
		)
	) {
		issues.push(`No weapon has weight ${weight}.`)
	}

	const material = only(constraints.anchorMaterial)
	if (
		material &&
		!metadata.weapons.some(
			(weapon) => weapon.attributes?.material === material,
		)
	) {
		issues.push(`No weapon is made of ${material}.`)
	}
	return issues
}

function disagree (
	issues: string[],
	values: Set<string> | null,
	label: string,
): void {
	if (values && values.size === 0) {
		issues.push(`The ${label} anchors disagree.`)
	}
}

function only (values: Set<string> | null): string | null {
	if (!values || values.size !== 1) {
		return null
	}
	return [...values][0]
}

function searchTuples (
	metadata: IGameMetadata,
	constraints: Constraints,
): SolutionTuple[] {
	const suspectIds = metadata.suspects.map((item) => item.id)
	const weaponIds = metadata.weapons.map((item) => item.id)
	const locationIds = metadata.locations.map((item) => item.id)
	const motiveIds = metadata.motives.map((item) => item.id)
	const suspectById = new Map(
		metadata.suspects.map((item) => [item.id, item]),
	)
	const weaponById = new Map(metadata.weapons.map((item) => [item.id, item]))
	const motiveOptions = new Map<string, string[]>()
	for (const suspectId of suspectIds) {
		motiveOptions.set(
			suspectId,
			motivesOpenTo(suspectId, suspectIds, motiveIds, constraints.motNeq),
		)
	}

	const found: SolutionTuple[] = []
	const seen = new Set<string>()
	const locOf = new Array<string>(suspectIds.length)
	const wpnOf = new Array<string>(suspectIds.length)
	const usedLoc = new Set<string>()
	const usedWpn = new Set<string>()

	const addTuple = (tuple: SolutionTuple) => {
		const key = [
			tuple.murderId,
			tuple.weaponId,
			tuple.locationId,
			tuple.motiveId,
		].join('\0')
		if (seen.has(key)) {
			return
		}
		seen.add(key)
		found.push(tuple)
	}

	const matchesAnchors = (
		suspectId: string,
		weaponId: string,
		locationId: string,
	): boolean => {
		if (
			constraints.anchorLocations &&
			!constraints.anchorLocations.has(locationId)
		) {
			return false
		}
		const suspect = suspectById.get(suspectId)
		const weapon = weaponById.get(weaponId)
		if (
			constraints.anchorHandedness &&
			!constraints.anchorHandedness.has(
				suspect?.attributes?.handedness ?? '',
			)
		) {
			return false
		}
		if (
			constraints.anchorHair &&
			!constraints.anchorHair.has(suspect?.attributes?.hairColor ?? '')
		) {
			return false
		}
		if (
			constraints.anchorWeight &&
			!constraints.anchorWeight.has(
				readAttr(weapon?.attributes?.weight),
			)
		) {
			return false
		}
		if (
			constraints.anchorMaterial &&
			!constraints.anchorMaterial.has(
				readAttr(weapon?.attributes?.material),
			)
		) {
			return false
		}
		return true
	}

	const considerWorld = () => {
		if (seen.size >= 2) {
			return
		}
		for (let index = 0; index < suspectIds.length; index++) {
			const suspectId = suspectIds[index]
			const locationId = locOf[index]
			const weaponId = wpnOf[index]
			if (!matchesAnchors(suspectId, weaponId, locationId)) {
				continue
			}
			const options = motiveOptions.get(suspectId) ?? []
			for (const motiveId of options) {
				if (
					constraints.anchorMotives &&
					!constraints.anchorMotives.has(motiveId)
				) {
					continue
				}
				addTuple({
					murderId: suspectId,
					weaponId,
					locationId,
					motiveId,
				})
				if (seen.size >= 2) {
					return
				}
			}
		}
	}

	const assignWeapons = (index: number) => {
		if (seen.size >= 2) {
			return
		}
		if (index === suspectIds.length) {
			considerWorld()
			return
		}
		const suspectId = suspectIds[index]
		const locationId = locOf[index]
		const banned = constraints.wpnNeq.get(suspectId)
		for (const weaponId of weaponIds) {
			if (usedWpn.has(weaponId) || banned?.has(weaponId)) {
				continue
			}
			const must = constraints.weaponAt.get(weaponId)
			if (must && (must.size !== 1 || !must.has(locationId))) {
				continue
			}
			if (constraints.weaponNotAt.get(weaponId)?.has(locationId)) {
				continue
			}
			wpnOf[index] = weaponId
			usedWpn.add(weaponId)
			assignWeapons(index + 1)
			usedWpn.delete(weaponId)
			if (seen.size >= 2) {
				return
			}
		}
	}

	const assignLocations = (index: number) => {
		if (seen.size >= 2) {
			return
		}
		if (index === suspectIds.length) {
			assignWeapons(0)
			return
		}
		const suspectId = suspectIds[index]
		const required = constraints.locEq.get(suspectId)
		const banned = constraints.locNeq.get(suspectId)
		for (const locationId of locationIds) {
			if (usedLoc.has(locationId) || banned?.has(locationId)) {
				continue
			}
			if (
				required &&
				(required.size !== 1 || !required.has(locationId))
			) {
				continue
			}
			locOf[index] = locationId
			usedLoc.add(locationId)
			assignLocations(index + 1)
			usedLoc.delete(locationId)
			if (seen.size >= 2) {
				return
			}
		}
	}

	assignLocations(0)
	return found
}

function motivesOpenTo (
	suspectId: string,
	suspectIds: string[],
	motiveIds: string[],
	banned: Map<string, Set<string>>,
): string[] {
	const options: string[] = []
	for (const motiveId of motiveIds) {
		if (banned.get(suspectId)?.has(motiveId)) {
			continue
		}
		const people = suspectIds.filter((id) => id !== suspectId)
		const motives = motiveIds.filter((id) => id !== motiveId)
		if (canMatch(people, motives, banned)) {
			options.push(motiveId)
		}
	}
	return options
}

function canMatch (
	people: string[],
	motives: string[],
	banned: Map<string, Set<string>>,
): boolean {
	const assigned = new Array<number>(motives.length).fill(-1)

	const visit = (personIndex: number, seen: boolean[]): boolean => {
		const block = banned.get(people[personIndex])
		for (let motiveIndex = 0; motiveIndex < motives.length; motiveIndex++) {
			if (block?.has(motives[motiveIndex]) || seen[motiveIndex]) {
				continue
			}
			seen[motiveIndex] = true
			const owner = assigned[motiveIndex]
			if (owner === -1 || visit(owner, seen)) {
				assigned[motiveIndex] = personIndex
				return true
			}
		}
		return false
	}

	for (let personIndex = 0; personIndex < people.length; personIndex++) {
		const seen = new Array<boolean>(motives.length).fill(false)
		if (!visit(personIndex, seen)) {
			return false
		}
	}
	return true
}

function readAttr (value: unknown): string {
	return typeof value === 'string' ? value : ''
}
