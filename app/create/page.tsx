import CreateCaseGuide from '@/components/create-game/create-case-guide'
import CreateGameWizard from '@/components/create-game/CreateGameWizard'
import Header from '@/components/layout/Header'
import { SiteFooter } from '@/components/layout/site-footer'
import { pageMetadata } from '@/lib/page-metadata'

export const metadata = pageMetadata({
	title: 'Tạo case trinh sát với AI',
	description:
		'Tạo case trinh sát của riêng bạn: mô tả vụ án, để AI sinh nghi phạm, hung khí, động cơ và chứng cứ, rồi xuất bản lên cửa hàng cho mọi người phá án.',
	path: '/create',
})

export default function CreateGamePage() {
	return (
		<div className="min-h-dvh bg-paper text-pencil">
			<Header />
			<main className="w-full max-w-5xl mx-auto px-6 py-20">
				<header className="mb-8">
					<h1 className="font-heading text-4xl text-pencil md:text-5xl">
						Tạo case trinh sát
					</h1>
					<p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-pencil/80">
						Mô tả một vụ án, để AI dựng nghi phạm, hung khí và chứng
						cứ, rồi chỉnh lại trước khi đăng lên cửa hàng.
					</p>
				</header>
				<div className="mb-4 flex justify-end">
					<CreateCaseGuide />
				</div>
				<CreateGameWizard />
			</main>
			<SiteFooter />
		</div>
	)
}
