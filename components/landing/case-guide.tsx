import {
	Gavel,
	Lightbulb,
	Search,
	Waypoints,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import Card from '@/components/ui/Card'
import { DoodleSquiggle } from '@/components/ui/doodles'
import { IconCircle } from '@/components/ui/icon-circle'
import { GUIDE_STEPS } from '@/lib/landing-constants'

const STEP_ICONS: Record<
	(typeof GUIDE_STEPS)[number]['num'],
	LucideIcon
> = {
	'01': Search,
	'02': Waypoints,
	'03': Lightbulb,
	'04': Gavel,
}

export default function CaseGuide() {
	return (
		<section
			className="border-t-2 border-dashed border-pencil py-20"
			aria-labelledby="how-you-solve-it"
		>
			<div className="max-w-5xl mx-auto px-6">
				<h2
					id="how-you-solve-it"
					className="font-heading text-3xl md:text-4xl text-pencil"
				>
					How you solve it
				</h2>
				<DoodleSquiggle className="mt-4 mb-10 max-w-md" />

				<ol
					className="
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
gap-6
"
				>
					{GUIDE_STEPS.map((step, index) => {
						const Icon = STEP_ICONS[step.num]
						const isEven = index % 2 === 0

						return (
							<li key={step.num} className="min-w-0">
								<Card
									tone="postit"
									tilt={isEven ? 'left' : 'right'}
									decoration={isEven ? 'tape' : 'tack'}
									className="mb-0 h-full"
								>
									<div className="flex items-start justify-between gap-3">
										<p
											className="
font-heading text-5xl leading-none
text-pencil/25 select-none
"
										>
											{step.num}
										</p>
										<IconCircle icon={Icon} />
									</div>

									<h3
										className="
font-heading text-2xl text-pencil mt-4
"
									>
										{step.title}
									</h3>

									<p
										className="
mt-3 text-base text-pencil/80 leading-relaxed
"
									>
										{step.body}
									</p>
								</Card>
							</li>
						)
					})}
				</ol>
			</div>
		</section>
	)
}
