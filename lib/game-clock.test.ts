import assert from 'node:assert/strict'
import test from 'node:test'

import {
	elapsedInvestigationSeconds,
	formatInvestigationClock,
} from './game-clock'

test('formats elapsed investigation time as a clock', () => {
	assert.equal(formatInvestigationClock(0), '00:00')
	assert.equal(formatInvestigationClock(42_000), '00:42')
	assert.equal(formatInvestigationClock(3_661_000), '01:01:01')
})

test('counts whole seconds from the start of the case', () => {
	const startedAt = 1_000
	assert.equal(elapsedInvestigationSeconds(null, null, 5_000), 0)
	assert.equal(elapsedInvestigationSeconds(startedAt, null, 6_400), 5)
	assert.equal(elapsedInvestigationSeconds(startedAt, 4_000, 9_000), 3)
})
