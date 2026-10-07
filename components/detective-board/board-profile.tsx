"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import GoogleLoginButton from "@/components/ui/GoogleLoginButton";
import { signInWithGoogle, signOut } from "@/features/user/user.sign-in";
import { profileFromAuthUser } from "@/features/user/user.oauth";
import { useAuthUser } from "@/hooks/use-auth-user";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function BoardProfile() {
  const { user, isLoading } = useAuthUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const closeLogin = useCallback(() => {
    setIsLoginOpen(false);
    setAuthError(null);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (!isLoginOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLogin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginOpen, closeLogin]);

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
    closeMenu();
    try {
      await signOut();
    } catch {
      setAuthError("Could not sign out. Try again.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="
w-[120px]
h-9
rounded-full
bg-erased
border
border-erased
animate-pulse
"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsLoginOpen(true)}
          className="
px-4
py-1.5
rounded-full
bg-erased
border
border-erased
text-xs
font-semibold
text-pencil
hover:border-pencil
transition-colors

"
        >
          Đăng nhập
        </button>

        {isLoginOpen ? (
          <div
            className="
fixed
inset-0
z-50
flex
items-center
justify-center
p-4
"
            role="presentation"
          >
            <button
              type="button"
              className="
absolute
inset-0
bg-pencil/55

"
              aria-label="Close sign in"
              onClick={closeLogin}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="board-login-title"
              className="
relative
w-full
max-w-sm
rounded-2xl
border
border-erased
bg-card
shadow-xl
p-6
space-y-4
"
            >
              <div>
                <h2
                  id="board-login-title"
                  className="
font-heading
font-semibold
text-lg
text-pencil
"
                >
                  Đăng nhập
                </h2>
                <p className="text-xs text-pencil/70 mt-1">
                  Lưu lại các case đã giải quyết và mở các case.
                </p>
              </div>

              <GoogleLoginButton
                onClick={handleGoogleSignIn}
                isSigningIn={isSigningIn}
              />

              {authError ? (
                <p className="text-xs text-red-700 text-center" role="alert">
                  {authError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  const profile = profileFromAuthUser(user);
  const initials = initialsFromName(profile.name);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        className="
flex
items-center
gap-2
pl-1
pr-3
py-1
rounded-full
bg-erased
border
border-erased
text-xs
text-pencil
hover:border-pencil
transition-colors
max-w-[180px]
"
      >
        {profile.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt=""
            className="
w-7
h-7
rounded-full
object-cover
border
border-erased
shrink-0
"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="
w-7
h-7
rounded-full
bg-erased
flex
items-center
justify-center
text-[10px]
font-bold
text-pencil/70
shrink-0
"
            aria-hidden
          >
            {initials}
          </span>
        )}
        <span className="font-semibold truncate">{profile.name}</span>
      </button>

      {isMenuOpen ? (
        <div
          role="menu"
          className="
absolute
right-0
top-[calc(100%+6px)]
z-50
min-w-[160px]
rounded-wobbly-md
border
border-erased
bg-card
shadow-lg
py-1
overflow-hidden
"
        >
          <Link
            href="/store?tab=my"
            role="menuitem"
            onClick={closeMenu}
            className="
block
px-4
py-2.5
text-sm
text-pencil
hover:bg-erased
transition-colors
"
          >
            Các case của tôi
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="
w-full
text-left
px-4
py-2.5
text-sm
text-marker
hover:bg-marker/10
transition-colors
"
          >
            Đăng xuất
          </button>
        </div>
      ) : null}

      {authError ? (
        <p
          className="
absolute
right-0
top-[calc(100%+6px)]
z-40
text-xs
text-red-700
whitespace-nowrap
"
          role="alert"
        >
          {authError}
        </p>
      ) : null}
    </div>
  );
}
