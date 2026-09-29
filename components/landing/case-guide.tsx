'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { GUIDE_STEPS } from '@/lib/landing-constants'

function GuideStepPanel({
	step,
	isActive,
}: {
	step: (typeof GUIDE_STEPS)[number]
	isActive: boolean
}) {
	return (
		<div
			className={`
absolute inset-0 flex flex-col md:flex-row
items-start md:items-center gap-8 md:gap-12
transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
${isActive
					? 'opacity-100 translate-y-0 pointer-events-auto'
					: 'opacity-0 translate-y-6 pointer-events-none'
				}
`}
			aria-hidden={!isActive}
		>
			<div className="flex-1 min-w-0">
				<p
					className="
font-display text-[4.5rem] md:text-[6rem]
leading-none text-gold/35 select-none
"
				>
					{step.num}
				</p>

				<h2
					className="
font-display text-3xl md:text-4xl text-ink
tracking-tight -mt-2 md:-mt-4
"
				>
					{step.title}
				</h2>

				<p className="mt-4 text-base text-soft leading-relaxed max-w-md">
					{step.body}
				</p>
			</div>

			<div
				className="
relative w-full md:w-[min(42%,320px)]
aspect-[4/3] shrink-0
rounded-card overflow-hidden border border-line shadow-card
hidden sm:block
"
			>
				<Image
					src="/images/landing/guide-evidence.png"
					alt=""
					fill
					sizes="320px"
					className={`
object-cover transition-transform duration-700
${isActive ? 'scale-100' : 'scale-105'}
`}
				/>
			</div>
		</div>
	)
}

function GuideReducedMotion() {
	return (
		<section className="border-t border-line bg-goldBg/40 py-16 md:py-24">
			<div className="max-w-7xl mx-auto px-4 md:px-6">
				<h2 className="font-display text-3xl md:text-4xl text-ink mb-12">
					How you solve it
				</h2>

				<ol className="grid gap-10 md:grid-cols-2">
					{GUIDE_STEPS.map((step) => (
						<li key={step.num} className="flex gap-5">
							<span
								className="
font-display text-4xl text-gold/50 leading-none
"
							>
								{step.num}
							</span>
							<div>
								<h3 className="font-display text-xl text-ink">
									{step.title}
								</h3>
								<p className="mt-2 text-sm text-soft leading-relaxed">
									{step.body}
								</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	)
}

function pickActiveIndex(ratios: number[]): number {
	let best = 0
	let bestRatio = ratios[0] ?? 0
	for (let i = 1; i < ratios.length; i += 1) {
		if (ratios[i] > bestRatio) {
			bestRatio = ratios[i]
			best = i
		}
	}
	return best
}

export default function CaseGuide() {
	const [activeIndex, setActiveIndex] = useState(0)
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
	const [motionReady, setMotionReady] = useState(false)
	const triggerRefs = useRef<(HTMLDivElement | null)[]>([])
	const visibleRatios = useRef<number[]>(
		GUIDE_STEPS.map(() => 0),
	)

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
		const sync = () => setPrefersReducedMotion(mq.matches)
		sync()
		setMotionReady(true)
		mq.addEventListener('change', sync)
		return () => mq.removeEventListener('change', sync)
	}, [])

	useEffect(() => {
		if (!motionReady || prefersReducedMotion) return

		const elements = triggerRefs.current.filter(Boolean) as HTMLDivElement[]
		if (elements.length !== GUIDE_STEPS.length) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const index = Number(
						entry.target.getAttribute('data-step-index'),
					)
					if (Number.isNaN(index)) continue
					visibleRatios.current[index] = entry.intersectionRatio
				}
				setActiveIndex(pickActiveIndex(visibleRatios.current))
			},
			{
				root: null,
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
				rootMargin: '-42% 0px -42% 0px',
			},
		)

		for (const el of elements) {
			observer.observe(el)
		}

		return () => observer.disconnect()
	}, [motionReady, prefersReducedMotion])

	if (!motionReady) {
		return (
			<section
				className="border-t border-line bg-goldBg/40 min-h-[50vh]"
				aria-hidden
			/>
		)
	}

	if (prefersReducedMotion) {
		return <GuideReducedMotion />
	}

	return (
		<section
			className="relative border-t border-line bg-goldBg/40"
			aria-label="How to play"
		>
			<div
				className="
sticky top-16 z-10
min-h-[calc(100dvh-4rem)]
max-w-7xl mx-auto px-4 md:px-6
py-12 md:py-16
bg-goldBg/40
"
			>
				<div className="relative min-h-[min(520px,calc(100dvh-8rem))]">
					{GUIDE_STEPS.map((step, index) => (
						<GuideStepPanel
							key={step.num}
							step={step}
							isActive={activeIndex === index}
						/>
					))}

					<ol
						className="
absolute right-0 top-1/2 -translate-y-1/2
hidden md:flex flex-col gap-2
"
						aria-hidden
					>
						{GUIDE_STEPS.map((step, index) => (
							<li key={step.num}>
								<span
									className={`
block h-8 w-0.5 rounded-full transition-all duration-500
${activeIndex === index
											? 'bg-gold scale-y-110'
											: 'bg-line scale-y-100'
										}
`}
								/>
							</li>
						))}
					</ol>
				</div>

				<p className="sr-only" aria-live="polite">
					Step {activeIndex + 1} of {GUIDE_STEPS.length}:{' '}
					{GUIDE_STEPS[activeIndex].title}
				</p>
			</div>

			{GUIDE_STEPS.map((step, index) => (
				<div
					key={step.num}
					data-step-index={index}
					ref={(el) => {
						triggerRefs.current[index] = el
					}}
					className="h-[75vh]"
					aria-hidden
				/>
			))}
		</section>
	)
}
