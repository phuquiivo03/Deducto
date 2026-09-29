import Link from 'next/link'

import { OpenCaseLink } from './open-case-link'

export default function LandingNav() {
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

			<OpenCaseLink
				className="
inline-flex items-center justify-center
rounded-xl bg-ink text-paper
px-4 py-2.5 text-sm font-bold
transition-transform active:scale-[0.98]
hover:bg-[#1f1d19]
"
			/>
		</header>
	)
}
