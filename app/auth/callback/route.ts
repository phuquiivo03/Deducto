import { NextResponse } from "next/server";

import { profileFromAuthUser } from "@/features/user/user.oauth";
import { createClient } from "@/infrastructure/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

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
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        updated_at: now,
      },
      { onConflict: "id" },
    );

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.redirect(`${origin}/?auth=profile-error`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
