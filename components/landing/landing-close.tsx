import { buttonClassName } from '@/components/ui/button'

import { OpenCaseLink } from './open-case-link'

export default function LandingClose() {
	return (
		<section className="border-t-2 border-dashed border-pencil py-20">
			<div className="max-w-5xl mx-auto px-6 text-center">
				<p className="font-heading text-2xl md:text-4xl text-pencil max-w-2xl mx-auto -rotate-1">
					Your board is waiting. Pick up the case file and start
					connecting what the witnesses will not say aloud.
				</p>

				<OpenCaseLink
					className={buttonClassName({
						size: 'lg',
						className: 'mt-10',
					})}
				/>
			</div>
		</section>
	)
}
