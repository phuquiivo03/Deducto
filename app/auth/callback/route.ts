import { NextResponse } from "next/server";

import { profileFromAuthUser } from "@/features/user/user.oauth";
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
  const { error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return NextResponse.redirect(`${origin}/?auth=error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const profile = profileFromAuthUser(user);
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase
      .from("users")
      .upsert(
        {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          updated_at: now,
        },
        { onConflict: "id" },
      )
      .select("id, name, avatar");

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.redirect(`${origin}/?auth=profile-error`);
    }
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
