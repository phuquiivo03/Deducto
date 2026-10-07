import Link from "next/link";

import BoardProfile from "@/components/detective-board/board-profile";

export default function Header() {
  return (
    <header
      className="
sticky top-0 z-50 h-16
flex items-center justify-between
max-w-5xl mx-auto px-6
bg-paper border-b-2 border-dashed border-pencil
"
    >
      <Link href="/" className="font-heading text-xl md:text-2xl text-pencil">
        Deducto
      </Link>

      <nav
        className="hidden sm:flex items-center gap-8 text-lg font-body"
        aria-label="Main"
      >
        <Link
          href="/store"
          className="text-pencil wavy-underline hover:text-pen transition-colors"
        >
          Cửa hàng
        </Link>
        <Link
          href="/create"
          className="text-pencil wavy-underline hover:text-pen transition-colors"
        >
          Tạo case
        </Link>
      </nav>
      <BoardProfile />
    </header>
  );
}
