import Image from "next/image";

interface GoogleLoginButtonProps {
  onClick: () => void;
  isSigningIn: boolean;
}

export default function GoogleLoginButton({
  onClick,
  isSigningIn,
}: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSigningIn}
      className="w-full rounded-xl bg-ink text-paper py-3 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <Image src={"/google.svg"} alt="Google" width={20} height={20} />
      {isSigningIn ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
