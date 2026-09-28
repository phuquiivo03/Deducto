import { createClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

export function createServiceClient() {
	return createClient(env.supabaseUrl, env.supabaseSecretKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	})
}
