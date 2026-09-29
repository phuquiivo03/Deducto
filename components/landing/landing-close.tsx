import { OpenCaseLink } from './open-case-link'

export default function LandingClose() {
	return (
		<section
			className="
border-t border-line bg-white
py-16 md:py-20
"
		>
			<div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
				<p className="font-display text-2xl md:text-3xl text-ink max-w-xl mx-auto">
					Your board is waiting. Pick up the case file and start
					connecting what the witnesses will not say aloud.
				</p>

				<OpenCaseLink
					className="
mt-8 inline-flex items-center justify-center
rounded-xl bg-ink text-paper
px-8 py-4 text-sm font-bold
transition-transform active:scale-[0.98]
hover:bg-[#1f1d19]
"
				/>
			</div>
		</section>
	)
}
