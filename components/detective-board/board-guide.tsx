'use client'

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import { buttonClassName } from '@/components/ui/button'
import { HelpMark } from '@/components/ui/help-mark'
import { cn } from '@/lib/cn'

const SEEN_KEY = 'deducto-board-guide-opened'

interface GuideStep {
	text: string
	media?: { src: string; kind: 'image' | 'video' }
	target?: 'timer' | 'accuse'
}

const STEPS: GuideStep[] = [
	{
		text:
			'Dựa vào các manh mối, kết nối các thông tin có liên quan đến nhau',
		media: { src: '/guide/step1.gif', kind: 'image' },
	},
	{
		text: 'Quản lý các manh mối bằng cách đánh dấu trạng thái',
		media: { src: '/guide/step2.mp4', kind: 'video' },
	},
	{
		text: 'Thêm các ghi chú để dễ dàng quản lý thông tin',
		media: { src: '/guide/step3.gif', kind: 'image' },
	},
	{
		text: 'Giải mã các thông tin để tìm manh mối',
		media: { src: '/guide/step4.gif', kind: 'image' },
	},
	{
		text: 'Thời gian phá án sẽ được ghi nhận',
		target: 'timer',
	},
	{
		text: 'Khi đã có đủ chứng cứ, hãy buộc tội hung thủ',
		target: 'accuse',
	},
]

interface GuideBox {
	top: number
	left: number
	width: number
	height: number
}

function clamp (value: number, min: number, max: number) {
	if (max < min) return min
	return Math.min(Math.max(value, min), max)
}

function useGuideBox (selector: string | null) {
	const [tracked, setTracked] = useState(selector)
	const [box, setBox] = useState<GuideBox | null>(null)
	const [isReady, setIsReady] = useState(selector === null)

	if (tracked !== selector) {
		setTracked(selector)
		setBox(null)
		setIsReady(selector === null)
	}

	useLayoutEffect(() => {
		if (!selector) return

		const measure = () => {
			const node = document.querySelector(selector)
			if (!node) {
				setBox(null)
				setIsReady(true)
				return
			}
			const rect = node.getBoundingClientRect()
			setBox({
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
			})
			setIsReady(true)
		}

		const node = document.querySelector(selector)
		node?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		measure()
		window.addEventListener('resize', measure)
		window.addEventListener('scroll', measure, true)
		return () => {
			window.removeEventListener('resize', measure)
			window.removeEventListener('scroll', measure, true)
		}
	}, [selector])

	return { box, isReady }
}

function GuideClip ({
	src,
	kind,
}: {
	src: string
	kind: 'image' | 'video'
}) {
	const [isMissing, setIsMissing] = useState(false)
	const [isReady, setIsReady] = useState(false)
	if (isMissing) return null

	const frame = cn(
		'w-full rounded-wobbly-sm border-2 border-pencil',
		'bg-paper object-contain',
		isReady
			? 'mb-3 max-h-44'
			: 'pointer-events-none absolute h-px w-px overflow-hidden opacity-0',
	)

	if (kind === 'video') {
		return (
			<video
				className={frame}
				src={src}
				aria-hidden
				autoPlay
				muted
				loop
				playsInline
				onLoadedData={(event) => {
					event.currentTarget.muted = true
					setIsReady(true)
					void event.currentTarget.play().catch(() => undefined)
				}}
				onError={() => setIsMissing(true)}
			/>
		)
	}

	return (
		// Local guide clips are added later and may 404.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className={frame}
			src={src}
			alt=""
			aria-hidden
			loading="lazy"
			decoding="async"
			onLoad={() => setIsReady(true)}
			onError={() => setIsMissing(true)}
		/>
	)
}

function Dim ({ box }: { box: GuideBox | null }) {
	if (!box) {
		return <div className="absolute inset-0 bg-pencil/50" aria-hidden />
	}

	const pad = 6
	const top = box.top - pad
	const left = box.left - pad
	const width = box.width + pad * 2
	const height = box.height + pad * 2

	return (
		<div aria-hidden className="pointer-events-none absolute inset-0">
			<div
				className="absolute inset-x-0 top-0 bg-pencil/50"
				style={{ height: Math.max(0, top) }}
			/>
			<div
				className="absolute inset-x-0 bg-pencil/50"
				style={{ top: top + height, bottom: 0 }}
			/>
			<div
				className="absolute bg-pencil/50"
				style={{
					top: Math.max(0, top),
					left: 0,
					width: Math.max(0, left),
					height,
				}}
			/>
			<div
				className="absolute bg-pencil/50"
				style={{
					top: Math.max(0, top),
					left: left + width,
					right: 0,
					height,
				}}
			/>
			<div
				className="absolute rounded-wobbly-sm border-2 border-marker"
				style={{ top, left, width, height }}
			/>
		</div>
	)
}

function Pointer ({
	side,
	offset,
}: {
	side: 'above' | 'below'
	offset: number
}) {
	const isAbove = side === 'above'
	return (
		<svg
			aria-hidden
			width="18"
			height="12"
			viewBox="0 0 18 12"
			className="absolute text-pencil"
			style={{
				left: offset,
				top: isAbove ? undefined : -10,
				bottom: isAbove ? -10 : undefined,
				transform: isAbove ? 'rotate(180deg)' : undefined,
			}}
		>
			<path
				d="M1 11 L9 1 L17 11"
				className="fill-postit stroke-pencil"
				strokeWidth="2"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function GuideCard ({
	index,
	showTape,
	onBack,
	onNext,
	onClose,
}: {
	index: number
	showTape: boolean
	onBack: () => void
	onNext: () => void
	onClose: () => void
}) {
	const step = STEPS[index]
	const isFirst = index === 0
	const isLast = index === STEPS.length - 1
	const dialogRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		dialogRef.current?.focus()
	}, [index])

	useEffect(() => {
		function handleKey (event: KeyboardEvent) {
			const dialog = dialogRef.current
			if (!dialog) return
			if (event.key === 'Escape') {
				event.preventDefault()
				onClose()
				return
			}
			if (event.key !== 'Tab') return
			const items = [
				...dialog.querySelectorAll<HTMLButtonElement>(
					'button:not(:disabled)',
				),
			]
			if (items.length === 0) return
			const first = items[0]
			const last = items[items.length - 1]
			const active = document.activeElement
			if (event.shiftKey && (active === first || active === dialog)) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && active === last) {
				event.preventDefault()
				first.focus()
			}
		}

		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [onClose])

	return (
		<div
			ref={dialogRef}
			role="dialog"
			aria-modal="true"
			aria-labelledby="board-guide-step"
			tabIndex={-1}
			className={cn(
				'relative border-2 border-pencil bg-postit p-4',
				'rounded-wobbly-md shadow-hard text-pencil outline-none',
				showTape && '-rotate-1',
			)}
		>
			{showTape ? (
				<span
					aria-hidden
					className="
pointer-events-none absolute left-1/2 top-0 h-4 w-16
-translate-x-1/2 -translate-y-1/2 rotate-2
border border-pencil/20 bg-erased/80
"
				/>
			) : null}
			<p className="font-heading text-sm text-pen">
				<span className="sr-only">Bước </span>
				{index + 1} / {STEPS.length}
			</p>
			{step.media ? (
				<GuideClip
					key={step.media.src}
					src={step.media.src}
					kind={step.media.kind}
				/>
			) : null}
			<p
				id="board-guide-step"
				className="mt-2 text-lg leading-snug"
			>
				{step.text}
			</p>
			<div
				className="
mt-4 flex flex-wrap items-center justify-between gap-2
"
			>
				<button
					type="button"
					onClick={onBack}
					disabled={isFirst}
					className={buttonClassName({
						variant: 'ghost',
						size: 'sm',
						className: 'px-3',
					})}
				>
					Quay lại
				</button>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onClose}
						className={buttonClassName({
							variant: 'ghost',
							size: 'sm',
							className: 'px-3',
						})}
					>
						Bỏ qua
					</button>
					<button
						type="button"
						onClick={onNext}
						className={buttonClassName({
							variant: 'primary',
							size: 'sm',
							className: 'px-3',
						})}
					>
						{isLast ? 'Xong' : 'Tiếp'}
					</button>
				</div>
			</div>
		</div>
	)
}

function AnchoredCard ({
	box,
	index,
	onBack,
	onNext,
	onClose,
}: {
	box: GuideBox
	index: number
	onBack: () => void
	onNext: () => void
	onClose: () => void
}) {
	const panelRef = useRef<HTMLDivElement>(null)
	const [top, setTop] = useState(box.top + box.height + 14)
	const [side, setSide] = useState<'above' | 'below'>('below')
	const width = Math.min(352, window.innerWidth - 24)
	const left = clamp(
		box.left + box.width / 2 - width / 2,
		12,
		window.innerWidth - width - 12,
	)
	const arrow = clamp(
		box.left + box.width / 2 - left - 9,
		16,
		width - 28,
	)

	useLayoutEffect(() => {
		const panel = panelRef.current
		if (!panel) return
		const height = panel.offsetHeight
		const gap = 14
		const below = box.top + box.height + gap
		const nextSide =
			below + height > window.innerHeight - 12 &&
			box.top - gap - height > 12
				? 'above'
				: 'below'
		const nextTop =
			nextSide === 'below' ? below : box.top - gap - height
		setSide(nextSide)
		setTop(Math.max(12, nextTop))
	}, [box])

	return (
		<div
			ref={panelRef}
			className="absolute"
			style={{ top, left, width }}
		>
			<Pointer side={side} offset={arrow} />
			<GuideCard
				index={index}
				showTape={false}
				onBack={onBack}
				onNext={onNext}
				onClose={onClose}
			/>
		</div>
	)
}

function GuideDialog ({
	index,
	onBack,
	onNext,
	onClose,
}: {
	index: number
	onBack: () => void
	onNext: () => void
	onClose: () => void
}) {
	const step = STEPS[index]
	const selector = step.target
		? `[data-guide="${step.target}"]`
		: null
	const { box, isReady } = useGuideBox(selector)
	if (!isReady) return null

	const card =
		box && box.width > 0 ? (
			<AnchoredCard
				box={box}
				index={index}
				onBack={onBack}
				onNext={onNext}
				onClose={onClose}
			/>
		) : (
			<div
				className="
absolute inset-0 flex items-center justify-center p-3
"
			>
				<div className="w-full max-w-sm">
					<GuideCard
						index={index}
						showTape
						onBack={onBack}
						onNext={onNext}
						onClose={onClose}
					/>
				</div>
			</div>
		)

	return (
		<div className="fixed inset-0 z-[70]">
			<div className="absolute inset-0" />
			<Dim box={box && box.width > 0 ? box : null} />
			{card}
		</div>
	)
}

/**
 * Six-step tour on the investigation board.
 * The shared help mark stops pulsing after the first open.
 */
export default function BoardGuide () {
	const [index, setIndex] = useState(0)

	function handleBack () {
		setIndex((current) => (current === 0 ? current : current - 1))
	}

	function handleNext (close: () => void) {
		if (index >= STEPS.length - 1) {
			close()
			return
		}
		setIndex(index + 1)
	}

	return (
		<HelpMark
			storageKey={SEEN_KEY}
			onOpen={() => setIndex(0)}
		>
			{(close) => (
				<GuideDialog
					index={index}
					onBack={handleBack}
					onNext={() => handleNext(close)}
					onClose={close}
				/>
			)}
		</HelpMark>
	)
}
