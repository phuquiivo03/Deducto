"use client";

import Link from "next/link";
import { useState } from "react";

import { signInWithGoogle } from "@/features/user/user.sign-in";
import type { StoreTab } from "@/lib/store-constants";
import GoogleLoginButton from "../ui/GoogleLoginButton";

const MESSAGES: Record<
  Exclude<StoreTab, "public">,
  { title: string; body: string }
> = {
  solved: {
    title: "Sign in to see solved cases",
    body: "Cases you have finished appear here after you submit a correct accusation.",
  },
  my: {
    title: "Sign in to see your cases",
    body: "Cases you create and publish show up in this list.",
  },
};

interface StoreSignInEmptyProps {
  tab: Exclude<StoreTab, "public">;
}

export function StoreSignInEmpty({ tab }: StoreSignInEmptyProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = MESSAGES[tab];

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError("Could not start Google sign-in.");
      setIsSigningIn(false);
    }
  };

  return (
    <div
      className="
rounded-card border border-line bg-card p-8 shadow-card
max-w-md mx-auto text-center space-y-4
"
    >
      <h2 className="font-display text-xl text-ink">{copy.title}</h2>
      <p className="text-sm text-soft leading-relaxed">{copy.body}</p>
      {error ? (
        <p className="text-sm text-red" role="alert">
          {error}
        </p>
      ) : null}
      <GoogleLoginButton
        onClick={handleGoogleSignIn}
        isSigningIn={isSigningIn}
      />
      <Link
        href="/store?tab=public"
        className="text-xs text-soft underline block"
      >
        Browse public cases
      </Link>
    </div>
  );
}
