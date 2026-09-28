import { createClient } from '@/infrastructure/supabase/server'

export async function getSessionUserId(): Promise<string | null> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	return user?.id ?? null
}
