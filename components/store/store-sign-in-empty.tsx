"use client";

import Link from "next/link";
import { useState } from "react";

import { signInWithGoogle } from "@/features/user/user.sign-in";
import type { StoreTab } from "@/lib/store-constants";
import Card from "@/components/ui/Card";
import GoogleLoginButton from "../ui/GoogleLoginButton";

const MESSAGES: Record<
  Exclude<StoreTab, "public">,
  { title: string; body: string }
> = {
  solved: {
    title: "Đăng nhập để xem case đã giải quyết",
    body: "Các case đã giải quyết sẽ hiển thị ở đây sau khi bạn đưa ra đúng sự thật.",
  },
  my: {
    title: "Đăng nhập để xem case của bạn",
    body: "Các case bạn tạo và đăng bài sẽ hiển thị ở đây.",
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
    <Card
      decoration="tack"
      tone="postit"
      className="max-w-md mx-auto text-center space-y-4 mb-0"
    >
      <h2 className="font-heading text-2xl text-pencil">{copy.title}</h2>
      <p className="text-base text-pencil/80 leading-relaxed">{copy.body}</p>
      {error ? (
        <p className="text-base text-marker" role="alert">
          {error}
        </p>
      ) : null}
      <GoogleLoginButton
        onClick={handleGoogleSignIn}
        isSigningIn={isSigningIn}
      />
      <Link
        href="/store?tab=public"
        className="text-sm text-pencil/70 wavy-underline block"
      >
        Xem các case công khai
      </Link>
    </Card>
  );
}
