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
        className="flex items-center gap-4 sm:gap-8 text-lg font-body"
        aria-label="Main"
      >
        <Link
          href="/store"
          className="
hidden sm:inline text-pencil wavy-underline
hover:text-pen transition-colors
"
        >
          Cửa hàng
        </Link>
        <Link
          href="/create"
          className="
hidden sm:inline text-pencil wavy-underline
hover:text-pen transition-colors
"
        >
          Tạo case
        </Link>
        <Link
          href="/guide"
          aria-label="Hướng dẫn"
          title="Hướng dẫn"
          className="
inline-flex h-8 w-8 items-center justify-center
rounded-wobbly-sm border-2 border-pencil bg-card
font-heading text-lg leading-none text-pencil
shadow-hard-sm hover:bg-postit hover:text-pen
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
transition-colors
"
        >
          ?
        </Link>
      </nav>
      <BoardProfile />
    </header>
  );
}
