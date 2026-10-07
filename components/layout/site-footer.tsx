import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-dashed border-pencil py-12 text-center">
      <div className="max-w-5xl mx-auto px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading text-lg text-pencil">Deducto</p>
        <nav
          className="flex flex-wrap justify-center gap-6 text-base text-pencil/80"
          aria-label="Footer"
        >
          <Link
            href="/store"
            className="hover:line-through hover:text-pencil transition-colors"
          >
            Cửa hàng
          </Link>
          <Link
            href="/create"
            className="hover:line-through hover:text-pencil transition-colors"
          >
            Tạo case
          </Link>
        </nav>
      </div>
    </footer>
  );
}
