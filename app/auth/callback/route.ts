import { NextResponse } from "next/server";

import { saveSignedInProfile } from "@/features/user/user.profile";
import { createClient } from "@/infrastructure/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = safeNextPath(searchParams.get("next"), origin);

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth=missing-code`);
  }

  const supabase = await createClient();
  const { data, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !data.user) {
    return NextResponse.redirect(`${origin}/?auth=error`);
  }

  const saved = await saveSignedInProfile(data.user);
  if (!saved) {
    return NextResponse.redirect(`${origin}/?auth=profile-error`);
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
