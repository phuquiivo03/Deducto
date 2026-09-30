import Link from "next/link";

import BoardProfile from "@/components/detective-board/board-profile";

export default function Header() {
  return (
    <header
      className="
sticky top-0 z-50
h-16
flex items-center justify-between
max-w-7xl mx-auto px-4 md:px-6
bg-paper/90 backdrop-blur-md
border-b border-line
"
    >
      <Link
        href="/"
        className="
font-display font-semibold text-lg text-ink
tracking-tight
"
      >
        Deducto
      </Link>

      <nav
        className="hidden sm:flex items-center gap-6 text-sm font-semibold"
        aria-label="Main"
      >
        <Link
          href="/store"
          className="text-ink hover:text-gold transition-colors"
        >
          Store
        </Link>
      </nav>
      <BoardProfile />
    </header>
  );
}
