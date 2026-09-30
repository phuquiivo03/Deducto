import CreateGameWizard from '@/components/create-game/CreateGameWizard'
import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'

export default function CreateGamePage() {
	return (
		<div className="min-h-dvh bg-paper text-pencil">
			<Header />
			<main className="w-full max-w-5xl mx-auto px-6 py-20">
				<CreateGameWizard />
			</main>
			<SiteFooter />
		</div>
	)
}
