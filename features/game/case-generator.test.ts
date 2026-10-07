import assert from 'node:assert/strict'
import test from 'node:test'

import type { GameLevelStrict } from '@/features/game/game.schemas'
import { entityCountForLevel } from '@/features/game/game.schemas'

import { normalizeDraft } from './case-draft'
import type { NormalizedCaseEntities } from './case-draft'
import { generateCaseLogic, type Rng } from './case-generator'
import { assertUniquelySolvable, solveCase } from './case-solver'
import { detectTemplate } from '@/lib/clue-templates'

function mulberry32(seed: number): Rng {
	let t = seed
	return () => {
		t += 0x6d2b79f5
		let r = Math.imul(t ^ (t >>> 15), 1 | t)
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296
	}
}

function fixtureDraft(level: GameLevelStrict) {
	const n = entityCountForLevel(level)
	const suspects = Array.from({ length: n }, (_, i) => ({
		id: `s${i + 1}`,
		name: `Nghi phạm ${i + 1}`,
		avatar: '🧑',
		age: 30 + i,
		gender: 'female' as const,
		description: 'Khách mời của nạn nhân.',
		attributes: {
			height: 160 + i * 5,
			hairColor: i % 2 === 0 ? 'black' : 'brown',
			handedness: i === 0 ? 'LEFT' : 'RIGHT',
			birthday: `199${i}-01-0${i + 1}`,
		},
	}))
	const weapons = Array.from({ length: n }, (_, i) => ({
		id: `w${i + 1}`,
		name: `Vũ khí ${i + 1}`,
		icon: '🔪',
		description: 'Một vật dụng.',
		attributes: {
			weight: (['LIGHT', 'MEDIUM', 'HEAVY'] as const)[i % 3],
			material: i % 2 === 0 ? 'thép' : 'gỗ',
			type: 'dao',
		},
	}))
	const locations = Array.from({ length: n }, (_, i) => ({
		id: `l${i + 1}`,
		name: `Phòng ${i + 1}`,
		icon: '🚪',
		description: 'Một không gian.',
		attributes: { type: 'indoor' as const, characteristic: 'cửa gỗ' },
	}))
	const motives = Array.from({ length: n }, (_, i) => ({
		id: `m${i + 1}`,
		name: `Động cơ ${i + 1}`,
		icon: '💰',
		description: 'Thủ phạm muốn che giấu sự thật.',
	}))
	return {
		title: 'Vụ án thử nghiệm',
		description: 'Một vụ án dùng để kiểm tra bộ sinh manh mối.',
		banner: '/images/cases/vu-an-thu-nghiem.jpg',
		suspects,
		weapons,
		locations,
		motives,
	}
}

function entitiesForLevel(level: GameLevelStrict): NormalizedCaseEntities {
	return normalizeDraft(fixtureDraft(level), level)
}

const LEVEL_RULES: Record<
	GameLevelStrict,
	{ min: number; max: number; maxPositive: number }
> = {
	easy: { min: 6, max: 9, maxPositive: 0.5 },
	medium: { min: 9, max: 14, maxPositive: 0.4 },
	hard: { min: 12, max: 20, maxPositive: 0.25 },
}

function isPositiveTemplate(clue: { type: string; relation: string }) {
	const key = detectTemplate(clue as never)
	return key === 'L1' || key === 'L3' || key === 'R1' || key === 'R3'
}

for (const level of ['easy', 'medium', 'hard'] as const) {
	test(`generateCaseLogic produces valid ${level} cases`, () => {
		const entities = entitiesForLevel(level)
		const rules = LEVEL_RULES[level]
		for (let seed = 1; seed <= 30; seed += 1) {
			const rng = mulberry32(seed * 997 + level.length)
			const { clues, result } = generateCaseLogic(entities, level, rng)
			const meta = {
				id: 'meta-test',
				...entities,
				clues,
			}
			assertUniquelySolvable(meta, result)
			const outcome = solveCase(meta)
			assert.equal(outcome.status, 'unique')
			assert.ok(clues.length >= rules.min)
			assert.ok(clues.length <= rules.max)
			const positives = clues.filter(isPositiveTemplate).length
			assert.ok(positives / clues.length <= rules.maxPositive + 0.01)
			assert.ok(clues.some((c) => detectTemplate(c) === 'A1'))
		}
	})
}

test('normalizeDraft remaps ids and keeps entity counts', () => {
	const draft = fixtureDraft('medium')
	const normalized = normalizeDraft(draft, 'medium')
	assert.equal(normalized.suspects.length, 4)
	const ids = new Set([
		...normalized.suspects.map((s) => s.id),
		...normalized.weapons.map((w) => w.id),
	])
	assert.equal(ids.size, 8)
	assert.ok(!normalized.suspects.some((s) => s.id.startsWith('s1')))
	const heights = normalized.suspects.map(
		(s) => s.attributes?.height ?? 0,
	)
	assert.equal(new Set(heights).size, heights.length)
})
