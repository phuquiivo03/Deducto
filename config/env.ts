export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY!,
  supabaseJwksUrl: process.env.NEXT_PUBLIC_SUPABASE_JWKS_URL!,
  databaseUrl: process.env.DATABASE_URL!,
  directUrl: process.env.DIRECT_URL!,
  stateTimeSeconds: parseInt(process.env.NEXT_PUBLIC_STATE_TIME_SECONDS!) || 60,
  gcTimeSeconds: parseInt(process.env.NEXT_PUBLIC_GC_TIME_SECONDS!) || 300,
};
