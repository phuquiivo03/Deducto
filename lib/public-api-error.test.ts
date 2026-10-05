import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { publicApiFailure } from './public-api-error.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function listRouteFiles (dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true })
	const files: string[] = []
	for (const entry of entries) {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...listRouteFiles(path))
			continue
		}
		if (entry.name.endsWith('.ts')) {
			files.push(path)
		}
	}
	return files
}

describe('publicApiFailure', () => {
	it('returns the fallback and keeps the exception off the payload', () => {
		const secret = 'relation "users" password=supersecret host=db.internal'
		const logged: unknown[][] = []
		const original = console.error
		console.error = (...args: unknown[]) => {
			logged.push(args)
		}
		try {
			const body = publicApiFailure(
				'POST /api/game',
				new Error(secret),
				'Could not create this case',
				null,
			)
			const encoded = JSON.stringify(body)
			assert.equal(body.success, false)
			assert.equal(body.data, null)
			assert.equal(body.message, 'Could not create this case')
			assert.equal(encoded.includes('supersecret'), false)
			assert.equal(encoded.includes('db.internal'), false)
			assert.equal(encoded.includes(secret), false)
			const recorded = logged[0]?.[1]
			assert.ok(recorded instanceof Error)
			assert.equal(recorded.message, secret)
		} finally {
			console.error = original
		}
	})

	it('does not copy a non-Error throw value into the message', () => {
		const secret = { message: 'prisma error with DATABASE_URL' }
		const original = console.error
		console.error = () => {}
		try {
			const body = publicApiFailure(
				'POST /api/generate',
				secret,
				'Could not generate a case',
				null,
			)
			assert.equal(body.message, 'Could not generate a case')
			assert.equal(
				JSON.stringify(body).includes('DATABASE_URL'),
				false,
			)
		} finally {
			console.error = original
		}
	})
})

describe('api route error responses', () => {
	it('does not send raw exception or parser messages', () => {
		const files = listRouteFiles(join(root, 'app', 'api'))
		assert.ok(files.length >= 4)
		for (const file of files) {
			const source = readFileSync(file, 'utf8')
			assert.doesNotMatch(source, /e\.message/)
			assert.doesNotMatch(source, /error\.message/)
			assert.doesNotMatch(source, /\.error\.message/)
			assert.match(source, /publicApiFailure/)
		}
	})
})

describe('users rls migration', () => {
	it('drops the open select policy and does not grant email', () => {
		const dir = join(
			root,
			'prisma',
			'migrations',
			'20261005120000_restrict_users_public_profile',
		)
		const sql = readFileSync(join(dir, 'migration.sql'), 'utf8')
		assert.match(sql, /DROP POLICY IF EXISTS "users_select_all"/)
		assert.match(sql, /users_select_public_profile/)
		assert.match(
			sql,
			/REVOKE ALL ON TABLE public\.users FROM PUBLIC, anon, authenticated/,
		)
		assert.match(sql, /GRANT SELECT \(id, name, avatar\)/)
		assert.match(sql, /public\.games\.creator_id = public\.users\.id/)
		assert.doesNotMatch(sql, /GRANT[^;]*\bemail\b[^;]*TO anon/)
		assert.doesNotMatch(sql, /CREATE POLICY "users_select_all"/)
		assert.doesNotMatch(sql, /USING \(true\)/)
	})
})
