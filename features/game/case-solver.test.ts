import assert from 'node:assert/strict'
import test from 'node:test'

import type {
	IClue,
	IGameMetadata,
	ILocation,
	IMotive,
	ISuspect,
	IWeapon,
} from '@/features/game/game.schemas'

import { assertUniquelySolvable, solveCase } from './case-solver'
import { CaseNotSolvableError } from './game-errors'

function suspect (
	id: string,
	name: string,
	handedness: 'LEFT' | 'RIGHT',
): ISuspect {
	return {
		id,
		name,
		avatar: '🙂',
		age: 40,
		gender: 'female',
		description: 'A guest.',
		attributes: {
			height: 160,
			hairColor: handedness === 'LEFT' ? 'red' : 'brown',
			handedness,
			birthday: '1990-01-01',
		},
	}
}

function weapon (
	id: string,
	name: string,
	weight: 'LIGHT' | 'MEDIUM' | 'HEAVY',
): IWeapon {
	return {
		id,
		name,
		icon: '🔪',
		description: 'An object.',
		attributes: {
			weight,
			material: 'steel',
			type: name.toLowerCase(),
		},
	}
}

function location (id: string, name: string): ILocation {
	return {
		id,
		name,
		icon: '🚪',
		description: 'A room.',
		attributes: { type: 'indoor', characteristic: 'door' },
	}
}

function motive (id: string, name: string): IMotive {
	return {
		id,
		name,
		icon: '💰',
		description: 'A reason.',
	}
}

function grid (clues: IClue[]): IGameMetadata {
	return {
		id: 'meta',
		suspects: [
			suspect('a', 'Ann', 'LEFT'),
			suspect('b', 'Bea', 'RIGHT'),
			suspect('c', 'Cy', 'RIGHT'),
		],
		weapons: [
			weapon('knife', 'Knife', 'LIGHT'),
			weapon('rope', 'Rope', 'HEAVY'),
			weapon('pipe', 'Pipe', 'MEDIUM'),
		],
		locations: [
			location('hall', 'Hall'),
			location('library', 'Library'),
			location('garden', 'Garden'),
		],
		motives: [
			motive('greed', 'Greed'),
			motive('revenge', 'Revenge'),
			motive('jealousy', 'Jealousy'),
		],
		clues,
	}
}

const solved: IClue[] = [
	{
		id: 'c1',
		type: 'RELATION',
		attribute: 'location',
		value: 'Library',
		relation: 'AT',
		suspect_id: 'b',
		location_id: 'library',
	},
	{
		id: 'c2',
		type: 'LOCATION',
		attribute: 'location',
		value: 'Garden',
		relation: 'EQUAL',
		suspect_id: 'c',
		location_id: 'garden',
	},
	{
		id: 'c3',
		type: 'RELATION',
		attribute: 'found_at',
		value: 'Library',
		relation: 'FOUND_AT',
		weapon_id: 'rope',
		location_id: 'library',
	},
	{
		id: 'c4',
		type: 'EXCLUSION',
		attribute: 'found_at',
		value: 'Hall',
		relation: 'NOT_EQUAL',
		weapon_id: 'pipe',
		location_id: 'hall',
	},
	{
		id: 'c5',
		type: 'RELATION',
		attribute: 'location',
		value: 'Hall',
		relation: 'NOT_AT',
		suspect_id: 'b',
		location_id: 'hall',
	},
	{
		id: 'c6',
		type: 'RELATION',
		attribute: 'found_at',
		value: 'Library',
		relation: 'NOT_FOUND_AT',
		weapon_id: 'knife',
		location_id: 'library',
	},
	{
		id: 'c7',
		type: 'EXCLUSION',
		attribute: 'motive',
		value: 'Revenge',
		relation: 'NOT_EQUAL',
		suspect_id: 'a',
	},
	{
		id: 'c8',
		type: 'EXCLUSION',
		attribute: 'motive',
		value: 'Jealousy',
		relation: 'NOT_EQUAL',
		suspect_id: 'a',
	},
	{
		id: 'c9',
		type: 'ATTRIBUTE',
		attribute: 'location',
		value: 'Hall',
		relation: 'REQUIRED',
	},
]

const ann = {
	murderId: 'a',
	weaponId: 'knife',
	locationId: 'hall',
	motiveId: 'greed',
}

test('no solution when a clue contradicts another', () => {
	const clues: IClue[] = [
		...solved,
		{
			id: 'nope',
			type: 'EXCLUSION',
			attribute: 'location',
			value: 'Library',
			relation: 'NOT_EQUAL',
			suspect_id: 'b',
			location_id: 'library',
		},
	]
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'none')
	assert.equal(outcome.tuple, null)
})

test('one solution tuple when other motives can still swap', () => {
	const outcome = solveCase(grid(solved))
	assert.equal(outcome.status, 'unique')
	assert.deepEqual(outcome.tuple, ann)
})

test('more than one solution when the motive is not pinned', () => {
	const clues = solved.filter((clue) => clue.id !== 'c8')
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'ambiguous')
	assert.equal(outcome.tuple, null)
})

test('more than one solution when the murder weapon is not pinned', () => {
	const clues = solved.filter((clue) => clue.id !== 'c4')
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'ambiguous')
})

test('a handedness anchor selects the murderer', () => {
	const clues = solved.map((clue) =>
		clue.id === 'c9'
			? {
					...clue,
					attribute: 'handedness' as const,
					value: 'LEFT',
				}
			: clue,
	)
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'unique')
	assert.deepEqual(outcome.tuple, ann)
})

test('a motive anchor selects the murderer', () => {
	const clues = solved.map((clue) =>
		clue.id === 'c9'
			? {
					...clue,
					attribute: 'motive' as const,
					value: 'Greed',
				}
			: clue,
	)
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'unique')
	assert.deepEqual(outcome.tuple, ann)
})

test('a weight anchor selects who holds the murder weapon', () => {
	const clues = solved.map((clue) =>
		clue.id === 'c9'
			? {
					...clue,
					attribute: 'weight' as const,
					value: 'LIGHT',
				}
			: clue,
	)
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'unique')
	assert.deepEqual(outcome.tuple, ann)
})

test('a card fact does not change the solution', () => {
	const clues: IClue[] = [
		...solved,
		{
			id: 'fact',
			type: 'ATTRIBUTE',
			attribute: 'handedness',
			value: 'LEFT',
			relation: 'EQUAL',
			suspect_id: 'a',
		},
	]
	assert.equal(solveCase(grid(clues)).status, 'unique')
})

test('a card fact that disagrees with the card is rejected', () => {
	const clues: IClue[] = [
		...solved,
		{
			id: 'fact',
			type: 'ATTRIBUTE',
			attribute: 'handedness',
			value: 'RIGHT',
			relation: 'EQUAL',
			suspect_id: 'a',
		},
	]
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'invalid')
	assert.match(outcome.issues.join(' '), /handedness/)
})

test('a clue outside the deduction rules is rejected', () => {
	const clues: IClue[] = [
		...solved,
		{
			id: 'bad',
			type: 'RELATION',
			attribute: 'weapon',
			value: 'Knife',
			relation: 'EQUAL',
			suspect_id: 'a',
			weapon_id: 'knife',
		},
	]
	const outcome = solveCase(grid(clues))
	assert.equal(outcome.status, 'invalid')
	assert.match(outcome.issues.join(' '), /Clue 10/)
})

test('unequal groups cannot be solved', () => {
	const metadata = grid(solved)
	metadata.motives = metadata.motives.slice(0, 2)
	const outcome = solveCase(metadata)
	assert.equal(outcome.status, 'invalid')
	assert.match(outcome.issues.join(' '), /same size/)
})

test('publish fails unless the saved answer is the only tuple', () => {
	const metadata = grid(solved)
	assert.doesNotThrow(() => {
		assertUniquelySolvable(metadata, {
			murder_id: 'a',
			weapon_id: 'knife',
			motive_id: 'greed',
			location_id: 'hall',
		})
	})

	assert.throws(
		() => {
			assertUniquelySolvable(metadata, {
				murder_id: 'b',
				weapon_id: 'rope',
				motive_id: 'revenge',
				location_id: 'library',
			})
		},
		(error: unknown) => {
			assert.ok(error instanceof CaseNotSolvableError)
			assert.match(error.message, /saved answer/)
			return true
		},
	)

	const ambiguous = grid(solved.filter((clue) => clue.id !== 'c8'))
	assert.throws(
		() => {
			assertUniquelySolvable(ambiguous, {
				murder_id: 'a',
				weapon_id: 'knife',
				motive_id: 'greed',
				location_id: 'hall',
			})
		},
		(error: unknown) => {
			assert.ok(error instanceof CaseNotSolvableError)
			assert.match(error.message, /more than one solution/)
			return true
		},
	)

	const broken = grid([
		...solved,
		{
			id: 'nope',
			type: 'EXCLUSION',
			attribute: 'location',
			value: 'Library',
			relation: 'NOT_EQUAL',
			suspect_id: 'b',
			location_id: 'library',
		},
	])
	assert.throws(
		() => {
			assertUniquelySolvable(broken, {
				murder_id: 'a',
				weapon_id: 'knife',
				motive_id: 'greed',
				location_id: 'hall',
			})
		},
		(error: unknown) => {
			assert.ok(error instanceof CaseNotSolvableError)
			assert.match(error.message, /no solution/)
			return true
		},
	)
})
