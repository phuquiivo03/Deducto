import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import CaseBrief from './case-brief'

function brief(description: string, title: string) {
	return renderToStaticMarkup(
		createElement(CaseBrief, {
			game: {
				title,
				description,
				level: 'medium',
			},
		}),
	)
}

test('board case file shows the loaded description', () => {
	const manor = brief(
		'Lord Everleigh was found dead in his Victorian manor during a violent thunderstorm.',
		'Stormy Inheritance',
	)
	const abbey = brief(
		'Lord Ashcombe was found dead at Thornfield Abbey on a stormy night.',
		'Thornfield Abbey',
	)

	assert.match(manor, /Case file/)
	assert.match(manor, /Lord Everleigh was found dead/)
	assert.equal(manor.includes('Thornfield'), false)
	assert.equal(manor.includes('Missing Sapphire'), false)

	assert.match(abbey, /Lord Ashcombe was found dead/)
	assert.equal(abbey.includes('Everleigh'), false)
})

test('board case file uses the empty-file fallback', () => {
	const html = brief('   ', 'Untitled case')
	assert.match(html, /No description was filed for this case/)
})
