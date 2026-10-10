import type { User } from '@supabase/supabase-js'

import { createServiceClient } from '@/infrastructure/supabase/service'

import { profileFromAuthUser } from '@/features/user/user.oauth'

/**
 * Writes the signed-in profile with the service role.
 *
 * The browser role cannot upsert `public.users`: that statement needs
 * table-level SELECT, which would expose email. The callback already
 * checked the OAuth user, so this write stays on the server.
 */
export async function saveSignedInProfile(user: User): Promise<boolean> {
	const profile = profileFromAuthUser(user)
	const supabase = createServiceClient()
	const { error } = await supabase.from('users').upsert(
		{
			id: profile.id,
			name: profile.name,
			email: profile.email,
			avatar: profile.avatar,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'id' },
	)

	if (error) {
		console.error(error)
		return false
	}

	return true
}
