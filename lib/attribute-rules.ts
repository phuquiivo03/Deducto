import type {
	IClue,
	IGameMetadata,
	ISuspect,
	IWeapon,
} from '@/features/game/game.schemas'

/**
 * Structured fields a creator can turn into a template clue.
 * Free-text descriptions are intentionally absent.
 */
export const SUSPECT_RULE_ATTRIBUTES = [
	'handedness',
	'height',
	'gender',
	'hairColor',
	'birthday',
] as const

export const WEAPON_RULE_ATTRIBUTES = [
	'weight',
	'type',
	'material',
] as const

export type SuspectRuleAttribute =
	(typeof SUSPECT_RULE_ATTRIBUTES)[number]
export type WeaponRuleAttribute =
	(typeof WEAPON_RULE_ATTRIBUTES)[number]

export type AttributeRuleKind =
	| 'suspect-attr'
	| 'ban-weapon'
	| 'culprit-attr'
	| 'weapon-attr'
	| 'murder-weapon-attr'

export interface AttributeRuleDraft {
	kind: AttributeRuleKind
	op: 'eq' | 'neq'
	attribute: string
	value: string
	suspectId: string
	weaponId: string
}

export interface AttributeGap {
	path: (string | number)[]
	message: string
	labelVi: string
}

const HANDEDNESS = ['LEFT', 'RIGHT']
const GENDERS = ['female', 'male', 'nonbinary']
const HAIR = [
	'black',
	'brown',
	'blonde',
	'red',
	'gray',
	'white',
	'auburn',
]
const WEIGHTS = ['LIGHT', 'MEDIUM', 'HEAVY']

export const RULE_KINDS: {
	kind: AttributeRuleKind
	label: string
}[] = [
	{
		kind: 'suspect-attr',
		label: 'Nghi phạm · thuộc tính · =/≠ · giá trị',
	},
	{
		kind: 'ban-weapon',
		label: 'Nghi phạm có thuộc tính = giá trị không dùng vũ khí',
	},
	{
		kind: 'culprit-attr',
		label: 'Hung thủ · thuộc tính · =/≠ · giá trị',
	},
	{
		kind: 'weapon-attr',
		label: 'Hung khí · thuộc tính · =/≠ · giá trị',
	},
	{
		kind: 'murder-weapon-attr',
		label: 'Hung khí gây án · thuộc tính · =/≠ · giá trị',
	},
]

export function isSuspectRuleAttribute (
	value: string,
): value is SuspectRuleAttribute {
	return (SUSPECT_RULE_ATTRIBUTES as readonly string[]).includes(
		value,
	)
}

export function isWeaponRuleAttribute (
	value: string,
): value is WeaponRuleAttribute {
	return (WEAPON_RULE_ATTRIBUTES as readonly string[]).includes(
		value,
	)
}

export function readSuspectAttribute (
	suspect: ISuspect,
	attribute: SuspectRuleAttribute,
): string | null {
	if (attribute === 'gender') {
		return text(suspect.gender)
	}
	if (attribute === 'height') {
		const height = suspect.attributes?.height
		if (typeof height !== 'number' || !Number.isFinite(height)) {
			return null
		}
		return String(height)
	}
	return text(suspect.attributes?.[attribute])
}

export function readWeaponAttribute (
	weapon: IWeapon,
	attribute: WeaponRuleAttribute,
): string | null {
	return text(weapon.attributes?.[attribute])
}

export function attributeRuleKind (
	clue: IClue,
): AttributeRuleKind | null {
	const suspectAttr = isSuspectRuleAttribute(clue.attribute)
	const weaponAttr = isWeaponRuleAttribute(clue.attribute)
	const noSuspect = !clue.suspect_id
	const noWeapon = !clue.weapon_id
	const noLocation = !clue.location_id

	if (
		clue.type === 'EXCLUSION' &&
		clue.relation === 'NOT_EQUAL' &&
		noSuspect &&
		noLocation &&
		clue.weapon_id &&
		suspectAttr
	) {
		return 'ban-weapon'
	}

	if (clue.type !== 'ATTRIBUTE' || !noLocation) {
		return null
	}

	if (
		clue.suspect_id &&
		noWeapon &&
		suspectAttr &&
		(clue.relation === 'EQUAL' || clue.relation === 'NOT_EQUAL')
	) {
		return 'suspect-attr'
	}

	if (
		clue.weapon_id &&
		noSuspect &&
		weaponAttr &&
		(clue.relation === 'EQUAL' || clue.relation === 'NOT_EQUAL')
	) {
		return 'weapon-attr'
	}

	if (
		noSuspect &&
		noWeapon &&
		(clue.relation === 'REQUIRED' || clue.relation === 'NOT_EQUAL')
	) {
		if (suspectAttr) return 'culprit-attr'
		if (weaponAttr) return 'murder-weapon-attr'
	}

	return null
}

export function attributeChoices (
	kind: AttributeRuleKind,
): readonly string[] {
	if (kind === 'weapon-attr' || kind === 'murder-weapon-attr') {
		return WEAPON_RULE_ATTRIBUTES
	}
	return SUSPECT_RULE_ATTRIBUTES
}

export function needsSuspect (kind: AttributeRuleKind): boolean {
	return kind === 'suspect-attr'
}

export function needsWeapon (kind: AttributeRuleKind): boolean {
	return kind === 'ban-weapon' || kind === 'weapon-attr'
}

export function needsOperator (kind: AttributeRuleKind): boolean {
	return kind !== 'ban-weapon'
}

export function valueChoices (
	metadata: IGameMetadata,
	draft: AttributeRuleDraft,
): string[] {
	if (
		draft.kind === 'suspect-attr' &&
		isSuspectRuleAttribute(draft.attribute)
	) {
		const suspect = metadata.suspects.find(
			(item) => item.id === draft.suspectId,
		)
		if (!suspect) return []
		const actual = readSuspectAttribute(suspect, draft.attribute)
		if (draft.op === 'eq') return actual ? [actual] : []
		return suspectDomain(metadata, draft.attribute).filter(
			(value) => value !== actual,
		)
	}

	if (
		(draft.kind === 'ban-weapon' || draft.kind === 'culprit-attr') &&
		isSuspectRuleAttribute(draft.attribute)
	) {
		return presentSuspectValues(metadata, draft.attribute)
	}

	if (
		draft.kind === 'weapon-attr' &&
		isWeaponRuleAttribute(draft.attribute)
	) {
		const weapon = metadata.weapons.find(
			(item) => item.id === draft.weaponId,
		)
		if (!weapon) return []
		const actual = readWeaponAttribute(weapon, draft.attribute)
		if (draft.op === 'eq') return actual ? [actual] : []
		return weaponDomain(metadata, draft.attribute).filter(
			(value) => value !== actual,
		)
	}

	if (
		draft.kind === 'murder-weapon-attr' &&
		isWeaponRuleAttribute(draft.attribute)
	) {
		return presentWeaponValues(metadata, draft.attribute)
	}

	return []
}

export function withRulePatch (
	metadata: IGameMetadata,
	draft: AttributeRuleDraft,
	patch: Partial<AttributeRuleDraft>,
): AttributeRuleDraft {
	const next: AttributeRuleDraft = { ...draft, ...patch }
	const attributes = attributeChoices(next.kind)
	if (!attributes.includes(next.attribute)) {
		next.attribute = attributes[0] ?? ''
	}
	if (!needsOperator(next.kind)) {
		next.op = 'eq'
	}
	if (
		needsSuspect(next.kind) &&
		!metadata.suspects.some((item) => item.id === next.suspectId)
	) {
		next.suspectId = metadata.suspects[0]?.id ?? ''
	}
	if (
		needsWeapon(next.kind) &&
		!metadata.weapons.some((item) => item.id === next.weaponId)
	) {
		next.weaponId = metadata.weapons[0]?.id ?? ''
	}
	const values = valueChoices(metadata, next)
	if (!values.includes(next.value)) {
		next.value = values[0] ?? ''
	}
	return next
}

export function defaultRule (
	metadata: IGameMetadata,
): AttributeRuleDraft {
	return withRulePatch(
		metadata,
		{
			kind: 'suspect-attr',
			op: 'eq',
			attribute: 'handedness',
			value: '',
			suspectId: metadata.suspects[0]?.id ?? '',
			weaponId: metadata.weapons[0]?.id ?? '',
		},
		{},
	)
}

export function clueFromRule (
	id: string,
	draft: AttributeRuleDraft,
): IClue | null {
	if (!draft.value.trim()) return null

	if (
		draft.kind === 'suspect-attr' &&
		draft.suspectId &&
		isSuspectRuleAttribute(draft.attribute)
	) {
		return {
			id,
			type: 'ATTRIBUTE',
			attribute: draft.attribute,
			relation: draft.op === 'eq' ? 'EQUAL' : 'NOT_EQUAL',
			value: draft.value,
			suspect_id: draft.suspectId,
		}
	}

	if (
		draft.kind === 'ban-weapon' &&
		draft.weaponId &&
		isSuspectRuleAttribute(draft.attribute)
	) {
		return {
			id,
			type: 'EXCLUSION',
			attribute: draft.attribute,
			relation: 'NOT_EQUAL',
			value: draft.value,
			weapon_id: draft.weaponId,
		}
	}

	if (
		draft.kind === 'culprit-attr' &&
		isSuspectRuleAttribute(draft.attribute)
	) {
		return {
			id,
			type: 'ATTRIBUTE',
			attribute: draft.attribute,
			relation: draft.op === 'eq' ? 'REQUIRED' : 'NOT_EQUAL',
			value: draft.value,
		}
	}

	if (
		draft.kind === 'weapon-attr' &&
		draft.weaponId &&
		isWeaponRuleAttribute(draft.attribute)
	) {
		return {
			id,
			type: 'ATTRIBUTE',
			attribute: draft.attribute,
			relation: draft.op === 'eq' ? 'EQUAL' : 'NOT_EQUAL',
			value: draft.value,
			weapon_id: draft.weaponId,
		}
	}

	if (
		draft.kind === 'murder-weapon-attr' &&
		isWeaponRuleAttribute(draft.attribute)
	) {
		return {
			id,
			type: 'ATTRIBUTE',
			attribute: draft.attribute,
			relation: draft.op === 'eq' ? 'REQUIRED' : 'NOT_EQUAL',
			value: draft.value,
		}
	}

	return null
}

export function ruleFromClue (clue: IClue): AttributeRuleDraft | null {
	const kind = attributeRuleKind(clue)
	if (!kind) return null
	return {
		kind,
		op: clue.relation === 'NOT_EQUAL' ? 'neq' : 'eq',
		attribute: clue.attribute,
		value: clue.value,
		suspectId: clue.suspect_id ?? '',
		weaponId: clue.weapon_id ?? '',
	}
}

export function attributeLabel (attribute: string): string {
	switch (attribute) {
		case 'handedness':
			return 'Tay thuận'
		case 'height':
			return 'Chiều cao'
		case 'gender':
			return 'Giới tính'
		case 'hairColor':
			return 'Màu tóc'
		case 'birthday':
			return 'Ngày sinh'
		case 'weight':
			return 'Cân nặng'
		case 'type':
			return 'Loại'
		case 'material':
			return 'Vật liệu'
		default:
			return attribute
	}
}

export function valueLabel (attribute: string, value: string): string {
	return traitPhrases(attribute, value).yes
}

export function traitPhrases (
	attribute: string,
	value: string,
): { yes: string; no: string } {
	switch (attribute) {
		case 'handedness': {
			const word = handPhrase(value)
			return { yes: word, no: `không ${word}` }
		}
		case 'height':
			return {
				yes: `cao ${value} cm`,
				no: `không cao ${value} cm`,
			}
		case 'gender':
			return genderPhrase(value)
		case 'hairColor': {
			const color = hairPhrase(value)
			return {
				yes: `có tóc ${color}`,
				no: `không có tóc ${color}`,
			}
		}
		case 'birthday':
			return {
				yes: `sinh ngày ${value}`,
				no: `không sinh ngày ${value}`,
			}
		case 'weight':
			return weightPhrase(value)
		case 'material':
			return {
				yes: `làm bằng ${value}`,
				no: `không làm bằng ${value}`,
			}
		case 'type':
			return {
				yes: `thuộc loại ${value}`,
				no: `không thuộc loại ${value}`,
			}
		default:
			return {
				yes: `${attribute} ${value}`,
				no: `không ${attribute} ${value}`,
			}
	}
}

export function attributeRuleText (
	clue: IClue,
	metadata: IGameMetadata,
): string | null {
	const kind = attributeRuleKind(clue)
	if (!kind) return null
	const phrase = traitPhrases(clue.attribute, clue.value)
	const pole = clue.relation === 'NOT_EQUAL' ? phrase.no : phrase.yes

	if (kind === 'suspect-attr') {
		const name =
			metadata.suspects.find((item) => item.id === clue.suspect_id)
				?.name ?? 'Nghi phạm'
		return `${name} ${pole}.`
	}
	if (kind === 'weapon-attr') {
		const name =
			metadata.weapons.find((item) => item.id === clue.weapon_id)
				?.name ?? 'Hung khí'
		return `${name} ${pole}.`
	}
	if (kind === 'culprit-attr') {
		return `Hung thủ ${pole}.`
	}
	if (kind === 'murder-weapon-attr') {
		return `Hung khí gây án ${pole}.`
	}
	const weapon =
		metadata.weapons.find((item) => item.id === clue.weapon_id)
			?.name ?? 'vũ khí'
	return `Nghi phạm ${phrase.yes} không sử dụng ${weapon}.`
}

export function attributeSeen (
	metadata: IGameMetadata,
	attribute: string,
	value: string,
): boolean {
	if (isSuspectRuleAttribute(attribute)) {
		return metadata.suspects.some(
			(suspect) =>
				readSuspectAttribute(suspect, attribute) === value,
		)
	}
	if (isWeaponRuleAttribute(attribute)) {
		return metadata.weapons.some(
			(weapon) => readWeaponAttribute(weapon, attribute) === value,
		)
	}
	return false
}

export function attributeGaps (
	metadata: IGameMetadata,
): AttributeGap[] {
	const gaps: AttributeGap[] = []

	metadata.suspects.forEach((suspect, index) => {
		const name = suspect.name.trim() || 'Nghi phạm'
		const base = ['gameMetadata', 'suspects', index] as const
		pushGap(
			gaps,
			[...base, 'gender'],
			!text(suspect.gender),
			'gender',
			`${name}: thiếu giới tính.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'height'],
			!readSuspectAttribute(suspect, 'height'),
			'height',
			`${name}: thiếu chiều cao.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'hairColor'],
			!readSuspectAttribute(suspect, 'hairColor'),
			'hair color',
			`${name}: thiếu màu tóc.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'handedness'],
			!readSuspectAttribute(suspect, 'handedness'),
			'handedness',
			`${name}: thiếu tay thuận.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'birthday'],
			!readSuspectAttribute(suspect, 'birthday'),
			'birthday',
			`${name}: thiếu ngày sinh.`,
		)
	})

	metadata.weapons.forEach((weapon, index) => {
		const name = weapon.name.trim() || 'Hung khí'
		const base = ['gameMetadata', 'weapons', index] as const
		pushGap(
			gaps,
			[...base, 'attributes', 'weight'],
			!readWeaponAttribute(weapon, 'weight'),
			'weight',
			`${name}: thiếu cân nặng.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'type'],
			!readWeaponAttribute(weapon, 'type'),
			'type',
			`${name}: thiếu loại.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'material'],
			!readWeaponAttribute(weapon, 'material'),
			'material',
			`${name}: thiếu vật liệu.`,
		)
	})

	metadata.locations.forEach((location, index) => {
		const name = location.name.trim() || 'Địa điểm'
		const base = ['gameMetadata', 'locations', index] as const
		pushGap(
			gaps,
			[...base, 'attributes', 'type'],
			!text(location.attributes?.type),
			'type',
			`${name}: thiếu loại.`,
		)
		pushGap(
			gaps,
			[...base, 'attributes', 'characteristic'],
			!text(location.attributes?.characteristic),
			'characteristic',
			`${name}: thiếu đặc điểm.`,
		)
	})

	return gaps
}

export function suggestDistinction (
	metadata: IGameMetadata,
	tuples: { murderId: string; weaponId: string }[],
): string | null {
	if (tuples.length < 2) return null
	const murderIds = new Set(tuples.map((tuple) => tuple.murderId))
	const suspectHit = uniqueTrait(
		metadata.suspects
			.filter((suspect) => murderIds.has(suspect.id))
			.map((suspect) => ({
				name: suspect.name,
				values: Object.fromEntries(
					SUSPECT_RULE_ATTRIBUTES.map((attribute) => [
						attribute,
						readSuspectAttribute(suspect, attribute),
					]),
				),
			})),
		SUSPECT_RULE_ATTRIBUTES,
	)
	if (suspectHit) {
		return `Chỉ có ${suspectHit.name} ${suspectHit.phrase}.`
	}

	const weaponIds = new Set(tuples.map((tuple) => tuple.weaponId))
	const weaponHit = uniqueTrait(
		metadata.weapons
			.filter((weapon) => weaponIds.has(weapon.id))
			.map((weapon) => ({
				name: weapon.name,
				values: Object.fromEntries(
					WEAPON_RULE_ATTRIBUTES.map((attribute) => [
						attribute,
						readWeaponAttribute(weapon, attribute),
					]),
				),
			})),
		WEAPON_RULE_ATTRIBUTES,
	)
	if (weaponHit) {
		return `Chỉ có ${weaponHit.name} ${weaponHit.phrase}.`
	}
	return null
}

function uniqueTrait (
	items: { name: string; values: Record<string, string | null> }[],
	keys: readonly string[],
): { name: string; phrase: string } | null {
	if (items.length < 2) return null
	for (const key of keys) {
		const groups = new Map<string, string[]>()
		let complete = true
		for (const item of items) {
			const value = item.values[key]
			if (!value) {
				complete = false
				break
			}
			const names = groups.get(value) ?? []
			names.push(item.name)
			groups.set(value, names)
		}
		if (!complete) continue
		for (const [value, names] of groups) {
			if (names.length === 1 && names[0]) {
				return {
					name: names[0],
					phrase: traitPhrases(key, value).yes,
				}
			}
		}
	}
	return null
}

function presentSuspectValues (
	metadata: IGameMetadata,
	attribute: SuspectRuleAttribute,
): string[] {
	const values = new Set<string>()
	for (const suspect of metadata.suspects) {
		const value = readSuspectAttribute(suspect, attribute)
		if (value) values.add(value)
	}
	return [...values]
}

function presentWeaponValues (
	metadata: IGameMetadata,
	attribute: WeaponRuleAttribute,
): string[] {
	const values = new Set<string>()
	for (const weapon of metadata.weapons) {
		const value = readWeaponAttribute(weapon, attribute)
		if (value) values.add(value)
	}
	return [...values]
}

function suspectDomain (
	metadata: IGameMetadata,
	attribute: SuspectRuleAttribute,
): string[] {
	const present = presentSuspectValues(metadata, attribute)
	if (attribute === 'handedness') return merge(HANDEDNESS, present)
	if (attribute === 'gender') return merge(GENDERS, present)
	if (attribute === 'hairColor') return merge(HAIR, present)
	return present
}

function weaponDomain (
	metadata: IGameMetadata,
	attribute: WeaponRuleAttribute,
): string[] {
	const present = presentWeaponValues(metadata, attribute)
	if (attribute === 'weight') return merge(WEIGHTS, present)
	return present
}

function merge (base: readonly string[], extra: string[]): string[] {
	return [...new Set([...base, ...extra])]
}

function pushGap (
	gaps: AttributeGap[],
	path: (string | number)[],
	missing: boolean,
	field: string,
	labelVi: string,
): void {
	if (!missing) return
	gaps.push({
		path,
		message: `Fill in ${field}.`,
		labelVi,
	})
}

function text (value: unknown): string | null {
	if (typeof value !== 'string') return null
	const trimmed = value.trim()
	return trimmed ? trimmed : null
}

function handPhrase (value: string): string {
	const key = value.toUpperCase()
	if (key === 'LEFT' || value.toLowerCase() === 'trái') {
		return 'thuận tay trái'
	}
	if (key === 'RIGHT' || value.toLowerCase() === 'phải') {
		return 'thuận tay phải'
	}
	return `thuận tay ${value}`
}

function genderPhrase (value: string): { yes: string; no: string } {
	const key = value.toLowerCase()
	const word =
		key === 'female' || key === 'nữ'
			? 'nữ'
			: key === 'male' || key === 'nam'
				? 'nam'
				: key === 'nonbinary'
					? 'phi nhị nguyên'
					: value
	return { yes: `là ${word}`, no: `không là ${word}` }
}

function hairPhrase (value: string): string {
	const colors: Record<string, string> = {
		black: 'đen',
		brown: 'nâu',
		blonde: 'vàng',
		red: 'đỏ',
		gray: 'xám',
		grey: 'xám',
		white: 'trắng',
		auburn: 'nâu đỏ',
	}
	return colors[value.toLowerCase()] ?? value
}

function weightPhrase (value: string): { yes: string; no: string } {
	const key = value.toUpperCase()
	const folded = value.toLowerCase()
	if (key === 'LIGHT' || folded === 'nhẹ') {
		return { yes: 'nhẹ', no: 'không nhẹ' }
	}
	if (key === 'HEAVY' || folded === 'nặng') {
		return { yes: 'nặng', no: 'không nặng' }
	}
	if (
		key === 'MEDIUM' ||
		folded === 'trung bình' ||
		folded === 'vừa'
	) {
		return {
			yes: 'có cân nặng vừa',
			no: 'không có cân nặng vừa',
		}
	}
	return {
		yes: `có cân nặng ${value}`,
		no: `không có cân nặng ${value}`,
	}
}
