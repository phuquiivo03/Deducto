import { env } from "@/config/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
