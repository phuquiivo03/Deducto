import CreateGameWizard from '@/components/create-game/CreateGameWizard'

export default function CreateGamePage() {
	return (
		<main className="min-h-screen bg-paper pb-16">
			<div className="w-full max-w-4xl mx-auto px-4 pt-6">
				<CreateGameWizard />
			</div>
		</main>
	)
}
