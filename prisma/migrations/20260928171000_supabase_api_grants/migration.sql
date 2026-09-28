-- Tables created via Prisma are not auto-granted to Supabase API roles.
-- Without these, PostgREST returns "permission denied for schema public".

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_submissions TO anon, authenticated, service_role;
