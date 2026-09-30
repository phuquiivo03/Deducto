"use client";

import { useState } from "react";

import { signInWithGoogle, signOut } from "@/features/user/user.sign-in";
import { useAuthUser } from "@/hooks/use-auth-user";
import { Button } from "@/components/ui/button";
import { StickyTag } from "@/components/ui/sticky-tag";

import Card from "./Card";
import GoogleLoginButton from "./GoogleLoginButton";

export default function IntroCard({
  start,
  disabled = false,
}: {
  start: () => void;
  disabled?: boolean;
}) {
  const { user, isLoading } = useAuthUser();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError("Could not start Google sign-in. Try again.");
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    try {
      await signOut();
    } catch {
      setAuthError("Could not sign out. Try again.");
    }
  };

  const displayName =
    (typeof user?.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    (typeof user?.user_metadata?.name === "string" &&
      user.user_metadata.name) ||
    user?.email ||
    "Detective";

  return (
    <Card decoration="tack" tone="postit" tilt="left" className="mb-0">
      <StickyTag className="mb-4 rotate-0">Case file</StickyTag>

      <h1 className="font-heading text-4xl mb-3 text-pencil">
        The Midnight Murder
      </h1>

      <p className="text-base text-pencil/80 mb-4">
        A body was found at 11:42 PM inside the old Raven mansion.
      </p>

      <p className="text-base leading-relaxed mb-6 text-pencil">
        Jonathan Raven was discovered in his study after dinner party. Three
        guests remained.
      </p>

      <div
        className="
border-t-2 border-dashed border-pencil
pt-4 flex justify-between text-base
"
      >
        <span>Victim</span>
        <b className="font-heading">Jonathan Raven</b>
      </div>

      <div className="mt-6 space-y-4">
        {authError ? (
          <p className="text-sm text-marker text-center">{authError}</p>
        ) : null}

        <Button
          type="button"
          onClick={start}
          disabled={disabled || !user}
          className="w-full"
        >
          Start investigation
        </Button>

        {!user && !isLoading ? (
          <p className="text-sm text-pencil/60 text-center">
            Sign in with Google to play and save your solve.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
