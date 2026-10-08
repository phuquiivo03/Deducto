import type { Metadata } from 'next'

import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'
import PuzzleLab from '@/features/puzzles/puzzle-lab'

export const metadata: Metadata = {
	title: 'Puzzle lab',
	robots: { index: false, follow: false },
}

export default function PuzzleLabPage () {
	return (
		<div className="min-h-dvh bg-paper text-pencil">
			<Header />
			<main className="mx-auto w-full max-w-5xl px-6 py-20">
				<PuzzleLab />
			</main>
			<SiteFooter />
		</div>
	)
}
