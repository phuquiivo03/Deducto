import type { ClueAttribute, IClue, IGameMetadata } from '@/features/game/game.schemas'
import {
	WEAPON_RULE_ATTRIBUTES,
	attributeLabel,
	isSuspectRuleAttribute,
	isWeaponRuleAttribute,
	readSuspectAttribute,
	readWeaponAttribute,
	traitPhrases,
} from '@/lib/attribute-rules'
import { detectTemplate } from '@/lib/clue-templates'

export interface AttributeVeilDraft {
	clueId: string
	attributes: string[]
}

export type VeilKind = 'suspect' | 'weapon' | 'location'

export type VeilRole =
	| 'at-location'
	| 'ban-location'
	| 'ban-weapon'
	| 'ban-motive'
	| 'weapon-at'
	| 'weapon-not-at'
	| 'anchor-location'
	| 'fact'

export interface VeilFilter {
	a: string
	v: string
}

export interface VeilBody {
	v: 1
	kind: VeilKind
	role: VeilRole
	filters: VeilFilter[]
	motive?: string
	fact?: VeilFilter
}

export interface VeilPreview {
	role: string
	unique: boolean
	message: string | null
}

export type VeilExpandResult =
	| { ok: true; metadata: IGameMetadata }
	| { ok: false; message: string }

const LOCATION_KEYS = ['type', 'characteristic'] as const

const CLUE_ATTRIBUTES = new Set<string>([
	'handedness',
	'hairColor',
	'height',
	'birthday',
	'gender',
	'weight',
	'material',
	'type',
	'weapon',
	'location',
	'motive',
	'found_at',
])

const ROLES = new Set<string>([
	'at-location',
	'ban-location',
	'ban-weapon',
	'ban-motive',
	'weapon-at',
	'weapon-not-at',
	'anchor-location',
	'fact',
])

interface VeilPlan {
	kind: VeilKind
	entityId: string
	role: VeilRole
	refs: {
		weapon_id?: string
		location_id?: string
	}
	motive?: string
	fact?: VeilFilter
	keys: readonly string[]
}

export function veilClueId (clueId: string): string {
	return `${clueId}:veil`
}

export function filtersAreVisible (body: VeilBody): boolean {
	const keys =
		body.kind === 'suspect'
			? SUSPECT_KEYS
			: body.kind === 'weapon'
				? WEAPON_RULE_ATTRIBUTES
				: LOCATION_KEYS
	return body.filters.every((filter) =>
		(keys as readonly string[]).includes(filter.a),
	)
}

/** Card facts a player can see. Gender is not printed on the card. */
const SUSPECT_KEYS = [
	'handedness',
	'height',
	'hairColor',
	'birthday',
] as const

export function parseVeil (value: string): VeilBody | null {
	if (!value.startsWith('{"v":1')) return null
	try {
		const raw = JSON.parse(value) as Partial<VeilBody>
		if (raw.v !== 1) return null
		if (raw.kind !== 'suspect' &&
			raw.kind !== 'weapon' &&
			raw.kind !== 'location') {
			return null
		}
		if (!raw.role || !ROLES.has(raw.role)) return null
		if (!Array.isArray(raw.filters) || raw.filters.length === 0) {
			return null
		}
		const filters: VeilFilter[] = []
		for (const filter of raw.filters) {
			if (!filter || typeof filter.a !== 'string') return null
			if (typeof filter.v !== 'string' || !filter.v.trim()) return null
			if (!filter.a.trim()) return null
			filters.push({ a: filter.a, v: filter.v })
		}
		const body: VeilBody = {
			v: 1,
			kind: raw.kind,
			role: raw.role,
			filters,
		}
		if (typeof raw.motive === 'string' && raw.motive.trim()) {
			body.motive = raw.motive
		}
		if (
			raw.fact &&
			typeof raw.fact.a === 'string' &&
			typeof raw.fact.v === 'string' &&
			raw.fact.a.trim() &&
			raw.fact.v.trim()
		) {
			body.fact = { a: raw.fact.a, v: raw.fact.v }
		}
		return body
	} catch {
		return null
	}
}

export function readVeilAttribute (
	metadata: IGameMetadata,
	kind: VeilKind,
	id: string,
	attribute: string,
): string | null {
	if (kind === 'suspect' && isSuspectRuleAttribute(attribute)) {
		const suspect = metadata.suspects.find((item) => item.id === id)
		return suspect ? readSuspectAttribute(suspect, attribute) : null
	}
	if (kind === 'weapon' && isWeaponRuleAttribute(attribute)) {
		const weapon = metadata.weapons.find((item) => item.id === id)
		return weapon ? readWeaponAttribute(weapon, attribute) : null
	}
	if (kind === 'location' && isLocationKey(attribute)) {
		const location = metadata.locations.find((item) => item.id === id)
		return text(location?.attributes?.[attribute])
	}
	return null
}

export function matchingIds (
	metadata: IGameMetadata,
	kind: VeilKind,
	filters: readonly VeilFilter[],
): string[] {
	const items =
		kind === 'suspect'
			? metadata.suspects
			: kind === 'weapon'
				? metadata.weapons
				: metadata.locations
	return items
		.filter((item) =>
			filters.every(
				(filter) =>
					readVeilAttribute(
						metadata,
						kind,
						item.id,
						filter.a,
					) === filter.v,
			),
		)
		.map((item) => item.id)
}

export function suggestVeilAttributes (
	metadata: IGameMetadata,
	clue: IClue,
): string[] | null {
	const plan = planOf(metadata, clue)
	if (!plan) return null
	return minimalUnique(metadata, plan)
}

export function veilBlockReason (
	metadata: IGameMetadata,
	clue: IClue,
): string | null {
	const plan = planOf(metadata, clue)
	if (!plan) {
		return 'Manh mối này không che được bằng thuộc tính.'
	}
	if (!minimalUnique(metadata, plan)) {
		return 'Không có bộ thuộc tính nào chỉ đúng một thẻ.'
	}
	return null
}

export function veilAttributeOptions (
	metadata: IGameMetadata,
	clue: IClue,
): { key: string; label: string }[] {
	const plan = planOf(metadata, clue)
	if (!plan) return []
	return plan.keys
		.filter((key) =>
			readVeilAttribute(metadata, plan.kind, plan.entityId, key),
		)
		.map((key) => ({ key, label: attributeLabel(key) }))
}

export function veilPreview (
	metadata: IGameMetadata,
	clue: IClue,
	attributes: readonly string[],
): VeilPreview | null {
	const plan = planOf(metadata, clue)
	if (!plan) return null
	const built = filtersFor(metadata, plan, attributes)
	if (!built.filters) {
		return {
			role: '',
			unique: false,
			message: built.message,
		}
	}
	return {
		role: roleSentence(metadata, plan, built.filters),
		unique: built.unique,
		message: built.unique ? null : built.message,
	}
}

export function expandAttributeVeils (
	metadata: IGameMetadata,
	veils: readonly AttributeVeilDraft[],
): VeilExpandResult {
	if (veils.length === 0) return { ok: true, metadata }
	const seen = new Set<string>()
	const taken = new Set(metadata.clues.map((clue) => clue.id))
	const replacements = new Map<string, IClue[]>()
	for (const veil of veils) {
		if (seen.has(veil.clueId)) {
			return { ok: false, message: 'Mỗi manh mối chỉ che một lần.' }
		}
		seen.add(veil.clueId)
		const roleId = veilClueId(veil.clueId)
		if (taken.has(roleId)) {
			return { ok: false, message: 'Mã manh mối che bị trùng.' }
		}
		const clue = metadata.clues.find((item) => item.id === veil.clueId)
		if (!clue) {
			return {
				ok: false,
				message: 'Manh mối cần che không có trong vụ án.',
			}
		}
		const built = buildVeilClues(metadata, clue, veil.attributes)
		if (!built.ok) return built
		replacements.set(clue.id, built.clues)
	}
	const clues: IClue[] = []
	for (const clue of metadata.clues) {
		const next = replacements.get(clue.id)
		if (next) clues.push(...next)
		else clues.push(clue)
	}
	return { ok: true, metadata: { ...metadata, clues } }
}

export function veilClueText (
	clue: IClue,
	metadata: IGameMetadata,
): string | null {
	const body = parseVeil(clue.value)
	if (!body) return null
	const phrase = phraseOf(body.kind, body.filters)
	const location =
		metadata.locations.find((item) => item.id === clue.location_id)
			?.name ?? 'địa điểm'
	const weapon =
		metadata.weapons.find((item) => item.id === clue.weapon_id)
			?.name ?? 'vũ khí'
	return roleLine(body, phrase, location, weapon)
}

function buildVeilClues (
	metadata: IGameMetadata,
	clue: IClue,
	attributes: readonly string[],
): { ok: true; clues: IClue[] } | { ok: false; message: string } {
	const plan = planOf(metadata, clue)
	if (!plan) {
		return {
			ok: false,
			message: 'Manh mối này không che được bằng thuộc tính.',
		}
	}
	const built = filtersFor(metadata, plan, attributes)
	if (!built.filters || !built.unique) {
		return {
			ok: false,
			message:
				built.message ??
				'Chưa xác định duy nhất người này.',
		}
	}
	const filters = built.filters
	const attribute = filters[0]?.a ?? 'type'
	const roleBody: VeilBody = {
		v: 1,
		kind: plan.kind,
		role: plan.role,
		filters,
	}
	if (plan.motive) roleBody.motive = plan.motive
	if (plan.fact) roleBody.fact = plan.fact
	return {
		ok: true,
		clues: [
			makeClue(
				veilClueId(clue.id),
				attribute,
				encode(roleBody),
				plan.refs,
			),
		],
	}
}

function filtersFor (
	metadata: IGameMetadata,
	plan: VeilPlan,
	attributes: readonly string[],
): {
	filters: VeilFilter[] | null
	unique: boolean
	message: string | null
} {
	if (attributes.length === 0) {
		return {
			filters: null,
			unique: false,
			message: 'Hãy chọn ít nhất một thuộc tính.',
		}
	}
	const filters: VeilFilter[] = []
	for (const key of attributes) {
		if (!plan.keys.includes(key)) {
			return {
				filters: null,
				unique: false,
				message: 'Thuộc tính không thuộc thẻ này.',
			}
		}
		const value = readVeilAttribute(
			metadata,
			plan.kind,
			plan.entityId,
			key,
		)
		if (!value) {
			return {
				filters: null,
				unique: false,
				message: 'Thuộc tính đã chọn chưa được điền.',
			}
		}
		filters.push({ a: key, v: value })
	}
	const ids = matchingIds(metadata, plan.kind, filters)
	const unique = ids.length === 1 && ids[0] === plan.entityId
	return {
		filters,
		unique,
		message: unique ? null : uniqueMessage(plan.kind),
	}
}

function planOf (
	metadata: IGameMetadata,
	clue: IClue,
): VeilPlan | null {
	const template = detectTemplate(clue)
	const suspectId = clue.suspect_id
	const weaponId = clue.weapon_id
	const locationId = clue.location_id
	if (template === 'E1' && suspectId && weaponId) {
		return suspectPlan(suspectId, 'ban-weapon', { weapon_id: weaponId })
	}
	if (
		(template === 'E2' || template === 'L2' || template === 'R2') &&
		suspectId &&
		locationId
	) {
		return suspectPlan(suspectId, 'ban-location', {
			location_id: locationId,
		})
	}
	if (template === 'E3' && suspectId) {
		return {
			...suspectPlan(suspectId, 'ban-motive', {}),
			motive: clue.value,
		}
	}
	if (
		(template === 'L1' || template === 'R1') &&
		suspectId &&
		locationId
	) {
		return suspectPlan(suspectId, 'at-location', {
			location_id: locationId,
		})
	}
	if (
		(template === 'E4' || template === 'L4' || template === 'R4') &&
		weaponId &&
		locationId
	) {
		return weaponPlan(weaponId, 'weapon-not-at', {
			location_id: locationId,
		})
	}
	if (
		(template === 'L3' || template === 'R3') &&
		weaponId &&
		locationId
	) {
		return weaponPlan(weaponId, 'weapon-at', {
			location_id: locationId,
		})
	}
	if (template === 'A1' && clue.attribute === 'location') {
		const location = metadata.locations.find(
			(item) => item.name === clue.value,
		)
		if (!location) return null
		return {
			kind: 'location',
			entityId: location.id,
			role: 'anchor-location',
			refs: {},
			keys: LOCATION_KEYS,
		}
	}
	if (template === 'A2') {
		if (suspectId) {
			return factPlan(
				'suspect',
				suspectId,
				clue,
				SUSPECT_KEYS,
			)
		}
		if (weaponId) {
			return factPlan(
				'weapon',
				weaponId,
				clue,
				WEAPON_RULE_ATTRIBUTES,
			)
		}
		if (locationId) {
			return factPlan('location', locationId, clue, LOCATION_KEYS)
		}
	}
	return null
}

function suspectPlan (
	entityId: string,
	role: VeilPlan['role'],
	refs: VeilPlan['refs'],
): VeilPlan {
	return {
		kind: 'suspect',
		entityId,
		role,
		refs,
		keys: SUSPECT_KEYS,
	}
}

function weaponPlan (
	entityId: string,
	role: VeilPlan['role'],
	refs: VeilPlan['refs'],
): VeilPlan {
	return {
		kind: 'weapon',
		entityId,
		role,
		refs,
		keys: WEAPON_RULE_ATTRIBUTES,
	}
}

function factPlan (
	kind: VeilKind,
	entityId: string,
	clue: IClue,
	keys: readonly string[],
): VeilPlan {
	return {
		kind,
		entityId,
		role: 'fact',
		refs: {},
		fact: { a: clue.attribute, v: clue.value },
		keys: keys.filter((key) => key !== clue.attribute),
	}
}

function minimalUnique (
	metadata: IGameMetadata,
	plan: VeilPlan,
): string[] | null {
	const usable = plan.keys.filter((key) =>
		readVeilAttribute(metadata, plan.kind, plan.entityId, key),
	)
	for (let size = 1; size <= usable.length; size++) {
		for (const subset of combinations(usable, size)) {
			const filters = subset.map((key) => ({
				a: key,
				v:
					readVeilAttribute(
						metadata,
						plan.kind,
						plan.entityId,
						key,
					) ?? '',
			}))
			const ids = matchingIds(metadata, plan.kind, filters)
			if (ids.length === 1 && ids[0] === plan.entityId) {
				return subset
			}
		}
	}
	return null
}

function combinations (items: string[], size: number): string[][] {
	const out: string[][] = []
	const walk = (start: number, acc: string[]) => {
		if (acc.length === size) {
			out.push([...acc])
			return
		}
		for (let index = start; index < items.length; index++) {
			const item = items[index]
			if (!item) continue
			acc.push(item)
			walk(index + 1, acc)
			acc.pop()
		}
	}
	walk(0, [])
	return out
}

function roleSentence (
	metadata: IGameMetadata,
	plan: VeilPlan,
	filters: readonly VeilFilter[],
): string {
	const phrase = phraseOf(plan.kind, filters)
	const location =
		metadata.locations.find((item) => item.id === plan.refs.location_id)
			?.name ?? 'địa điểm'
	const weapon =
		metadata.weapons.find((item) => item.id === plan.refs.weapon_id)
			?.name ?? 'vũ khí'
	const body: VeilBody = {
		v: 1,
		kind: plan.kind,
		role: plan.role,
		filters: [...filters],
		motive: plan.motive,
		fact: plan.fact,
	}
	return roleLine(body, phrase, location, weapon)
}

function roleLine (
	body: VeilBody,
	phrase: string,
	location: string,
	weapon: string,
): string {
	switch (body.role) {
		case 'at-location':
			return `Người có mặt ở ${location} ${phrase}.`
		case 'ban-location':
			return `Người không có mặt ở ${location} ${phrase}.`
		case 'ban-weapon':
			return `Người không sử dụng ${weapon} ${phrase}.`
		case 'ban-motive':
			return `Người không có động cơ là ${body.motive} ${phrase}.`
		case 'weapon-at':
			return `Hung khí được tìm thấy ở ${location} ${phrase}.`
		case 'weapon-not-at':
			return `Hung khí không được tìm thấy ở ${location} ${phrase}.`
		case 'anchor-location':
			return `Hiện trường gây án ${phrase}.`
		case 'fact': {
			const fact = body.fact
			const factPhrase = fact
				? statedPhrase(body.kind, fact.a, fact.v)
				: ''
			const who =
				body.kind === 'weapon'
					? 'Hung khí'
					: body.kind === 'location'
						? 'Địa điểm'
						: 'Người'
			return `${who} ${phrase} ${factPhrase}.`
		}
		default:
			return phrase
	}
}

function phraseOf (
	kind: VeilKind,
	filters: readonly VeilFilter[],
): string {
	return joinVi(
		filters.map((filter) => statedPhrase(kind, filter.a, filter.v)),
	)
}

function statedPhrase (
	kind: VeilKind,
	attribute: string,
	value: string,
): string {
	if (kind === 'location') return locationPhrase(attribute, value)
	return traitPhrases(attribute, value).yes
}

function locationPhrase (attribute: string, value: string): string {
	if (attribute === 'type') return `có loại ${value}`
	if (attribute === 'characteristic') return `có đặc điểm ${value}`
	return traitPhrases(attribute, value).yes
}

function joinVi (parts: string[]): string {
	if (parts.length <= 1) return parts[0] ?? ''
	if (parts.length === 2) return `${parts[0]} và ${parts[1]}`
	return `${parts.slice(0, -1).join(', ')} và ${parts[parts.length - 1]}`
}

function makeClue (
	id: string,
	attribute: string,
	value: string,
	refs: {
		suspect_id?: string
		weapon_id?: string
		location_id?: string
	},
): IClue {
	const clue: IClue = {
		id,
		type: 'ATTRIBUTE',
		attribute: clueAttribute(attribute),
		relation: 'EQUAL',
		value,
	}
	if (refs.suspect_id) clue.suspect_id = refs.suspect_id
	if (refs.weapon_id) clue.weapon_id = refs.weapon_id
	if (refs.location_id) clue.location_id = refs.location_id
	return clue
}

function encode (body: VeilBody): string {
	const payload: Record<string, unknown> = {
		v: 1,
		kind: body.kind,
		role: body.role,
		filters: body.filters,
	}
	if (body.motive) payload.motive = body.motive
	if (body.fact) payload.fact = body.fact
	return JSON.stringify(payload)
}

function clueAttribute (attribute: string): ClueAttribute {
	if (CLUE_ATTRIBUTES.has(attribute)) return attribute as ClueAttribute
	return 'type'
}

function uniqueMessage (kind: VeilKind): string {
	if (kind === 'weapon') return 'Chưa xác định duy nhất hung khí này.'
	if (kind === 'location') {
		return 'Chưa xác định duy nhất địa điểm này.'
	}
	return 'Chưa xác định duy nhất người này.'
}

function isLocationKey (
	value: string,
): value is (typeof LOCATION_KEYS)[number] {
	return (LOCATION_KEYS as readonly string[]).includes(value)
}

function text (value: unknown): string | null {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	return trimmed ? trimmed : null
}
