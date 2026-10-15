import type {
	IClue,
	IGameMetadata,
	ISuspect,
	IWeapon,
} from '@/features/game/game.schemas'

/**
 * Structured fields read by attribute clues and attribute veils.
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

export interface AttributeGap {
	path: (string | number)[]
	message: string
	labelVi: string
}

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
	if (clue.value.startsWith('{"v":1')) return null
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
		case 'characteristic':
			return 'Đặc điểm'
		case 'material':
			return 'Vật liệu'
		default:
			return attribute
	}
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
		case 'characteristic':
			return {
				yes: `có đặc điểm ${value}`,
				no: `không có đặc điểm ${value}`,
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
