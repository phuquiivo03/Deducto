import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { safeNextPath } from './safe-next-path.ts'

const origin = 'https://deducto.example'

function redirected (next: string | null | undefined): URL {
	return new URL(safeNextPath(next, origin), origin)
}

describe('safeNextPath', () => {
	it('keeps a single on-site path, query, and hash', () => {
		assert.equal(safeNextPath('/store', origin), '/store')
		assert.equal(safeNextPath('/', origin), '/')
		assert.equal(
			safeNextPath('/case/abc?tab=public', origin),
			'/case/abc?tab=public',
		)
		assert.equal(
			safeNextPath('/case/abc#board', origin),
			'/case/abc#board',
		)
		assert.equal(safeNextPath('  /create  ', origin), '/create')
	})

	it('defaults when next is missing', () => {
		assert.equal(safeNextPath(null, origin), '/')
		assert.equal(safeNextPath(undefined, origin), '/')
		assert.equal(safeNextPath('', origin), '/')
		assert.equal(safeNextPath('   ', origin), '/')
	})

	it('rejects values that would leave the site', () => {
		const malicious = [
			'//evil.example',
			'///evil.example',
			'//evil.example/phish',
			'/\\evil.example',
			'\\\\evil.example',
			'\\evil.example',
			'@evil.example',
			'@evil.example/phish',
			' @evil.example',
			'\t@evil.example',
			'\n@evil.example',
			'.evil.example',
			'evil.example',
			'https://evil.example',
			'https://evil.example/phish',
			'http://evil.example',
			'javascript:alert(1)',
			'https://deducto.example.evil.example',
			'https://deducto.example/store',
			'/%2f%2fevil.example',
			'/%5cevil.example',
			'/store\r\nLocation: https://evil.example',
			' /\t//evil.example',
		]

		for (const next of malicious) {
			const path = safeNextPath(next, origin)
			const url = new URL(path, origin)
			assert.equal(path, '/', next)
			assert.equal(url.origin, origin, next)
			assert.equal(url.username, '', next)
			assert.notEqual(url.host, 'evil.example', next)
		}
	})

	it('does not build the old string-concat open redirect', () => {
		const next = '@evil.example'
		const unsafe = new URL(`${origin}${next}`)
		assert.equal(unsafe.host, 'evil.example')
		assert.equal(redirected(next).host, 'deducto.example')
		assert.equal(redirected('//evil.example').host, 'deducto.example')
	})

	it('normalizes dot segments without leaving the origin', () => {
		assert.equal(safeNextPath('/store/../create', origin), '/create')
		assert.equal(redirected('/store/../create').origin, origin)
	})
})
