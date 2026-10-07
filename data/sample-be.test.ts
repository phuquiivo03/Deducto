import assert from 'node:assert/strict'
import test from 'node:test'

import { solveCase } from '@/features/game/case-solver'
import type { IGameMetadata } from '@/features/game/game.schemas'
import { clueToText } from '@/lib/clues.helper'

import { sampleGame, sampleResult } from './sample-be'

function metadata (): IGameMetadata {
	const value = sampleGame.gameMetadata
	if (typeof value === 'string') {
		throw new Error('sample metadata must be an object')
	}
	return value
}

test('the homepage case has one solution, including motive', () => {
	const meta = metadata()
	const outcome = solveCase(meta)
	assert.equal(outcome.status, 'unique')
	assert.deepEqual(outcome.tuple, {
		murderId: sampleResult.answer.murder_id,
		weaponId: sampleResult.answer.weapon_id,
		locationId: sampleResult.answer.location_id,
		motiveId: sampleResult.answer.motive_id,
	})
})

test('sample anchors are crime-level and motives are clued', () => {
	const meta = metadata()
	const sentences = meta.clues.map((clue) => clueToText(clue, meta))
	const anchors = meta.clues.filter(
		(clue) => clue.type === 'ATTRIBUTE' && clue.relation === 'REQUIRED',
	)

	assert.ok(anchors.length >= 1)
	for (const anchor of anchors) {
		assert.equal(anchor.suspect_id, undefined)
		assert.equal(anchor.weapon_id, undefined)
		assert.equal(anchor.location_id, undefined)
	}

	assert.ok(
		sentences.some((sentence) => sentence.includes('không có động cơ')),
	)
	assert.equal(
		sentences.some((sentence) => sentence.includes('is right-handed')),
		false,
	)
	assert.equal(
		sentences.some((sentence) => sentence.includes('is heavy')),
		false,
	)
	assert.ok(sentences.includes('The location is Phòng ăn.'))
})
