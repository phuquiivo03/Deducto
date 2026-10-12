"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { StickyTag } from "@/components/ui/sticky-tag";
import { signInWithGoogle } from "@/features/user/user.sign-in";
import { useAuthUser } from "@/hooks/use-auth-user";

import Card from "./Card";

export default function IntroCard({
  title,
  description,
  difficulty,
  victim,
  start,
  disabled = false,
  startError = null,
}: {
  title: string;
  description: string;
  difficulty: string;
  victim: string;
  start: () => void;
  disabled?: boolean;
  startError?: string | null;
}) {
  const { user, isLoading } = useAuthUser();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const showLogin = !user && !isLoading;

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setSignInError("Không thể đăng nhập bằng Google.");
      setIsSigningIn(false);
    }
  };

  return (
    <Card decoration="tack" tone="postit" tilt="left" className="mb-0">
      <StickyTag className="mb-4 rotate-0">Tệp case</StickyTag>

      <h1 className="font-heading text-4xl mb-3 text-pencil">{title}</h1>

      <p className="text-base leading-relaxed mb-6 text-pencil">
        {description}
      </p>

      <div className="border-t-2 border-dashed border-pencil pt-4 space-y-2 text-base">
        <div className="flex justify-between gap-4">
          <span>Độ khó</span>
          <b className="font-heading">{difficulty}</b>
        </div>
        <div className="flex justify-between gap-4">
          <span>Nạn nhân</span>
          <b className="font-heading text-right">{victim}</b>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {showLogin ? (
          <GoogleLoginButton
            onClick={handleGoogleSignIn}
            isSigningIn={isSigningIn}
          />
        ) : (
          <Button
            type="button"
            onClick={start}
            disabled={disabled || !user}
            className="w-full"
          >
            Bắt đầu điều tra
          </Button>
        )}

        {startError || signInError ? (
          <p className="text-sm text-marker text-center" role="alert">
            {startError ?? signInError}
          </p>
        ) : null}

        {showLogin ? (
          <p className="text-sm text-pencil/60 text-center">
            Đăng nhập với Google để chơi và lưu lại các case đã giải quyết.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
