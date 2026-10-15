'use client'

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'

function readSeen (key: string) {
	try {
		return window.localStorage.getItem(key) === '1'
	} catch {
		return false
	}
}

function markSeen (key: string) {
	try {
		window.localStorage.setItem(key, '1')
	} catch {
		// Storage can be blocked; the pulse still stops for this visit.
	}
}

interface HelpMarkProps {
	storageKey: string
	onOpen?: () => void
	children: (close: () => void) => ReactNode
}

/**
 * Paper ? used by in-app guides. It pulses until opened once per key.
 */
export function HelpMark ({
	storageKey,
	onOpen,
	children,
}: HelpMarkProps) {
	const triggerRef = useRef<HTMLButtonElement>(null)
	const [isBlinking, setIsBlinking] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		setIsBlinking(!readSeen(storageKey))
	}, [storageKey])

	const handleClose = useCallback(() => {
		setIsOpen(false)
		triggerRef.current?.focus()
	}, [])

	function handleOpen () {
		markSeen(storageKey)
		setIsBlinking(false)
		onOpen?.()
		setIsOpen(true)
	}

	return (
		<>
			<div className="relative shrink-0">
				{isBlinking ? (
					<span
						aria-hidden
						className="
pointer-events-none absolute inset-0 rounded-full
bg-marker/70 animate-ping
"
					/>
				) : null}
				<button
					ref={triggerRef}
					type="button"
					onClick={handleOpen}
					aria-label="Hướng dẫn"
					aria-expanded={isOpen}
					title="Hướng dẫn"
					className="
relative flex h-10 w-10 items-center justify-center
rounded-full border-2 border-pencil bg-postit
font-heading text-xl leading-none text-pencil
shadow-hard-sm
hover:translate-x-0.5 hover:translate-y-0.5
focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-pen
"
				>
					<span className={cn(isBlinking && 'guide-blink')}>?</span>
				</button>
			</div>
			{isOpen
				? createPortal(children(handleClose), document.body)
				: null}
		</>
	)
}
