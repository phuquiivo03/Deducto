import type { User } from '@supabase/supabase-js'

export function profileFromAuthUser(user: User): {
	id: string
	name: string
	email: string
	avatar: string | null
} {
	const metadata = user.user_metadata as Record<string, unknown>
	const fullName =
		(typeof metadata.full_name === 'string' && metadata.full_name) ||
		(typeof metadata.name === 'string' && metadata.name) ||
		user.email?.split('@')[0] ||
		'Player'
	const avatar =
		(typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
		(typeof metadata.picture === 'string' && metadata.picture) ||
		null

	return {
		id: user.id,
		name: fullName,
		email: user.email ?? `${user.id}@unknown.local`,
		avatar,
	}
}
