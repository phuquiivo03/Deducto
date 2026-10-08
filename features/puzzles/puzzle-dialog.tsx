'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(',')

export interface PuzzleDialogProps {
	titleId: string
	descriptionId?: string
	onClose: () => void
	initialFocusRef?: React.RefObject<HTMLElement | null>
	children: React.ReactNode
}

function focusableIn (panel: HTMLElement | null): HTMLElement[] {
	if (!panel) return []
	return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
		(el) => !el.hasAttribute('disabled'),
	)
}

/**
 * Shared solving-screen chrome: focus trap, Escape, backdrop dismiss,
 * and a short entrance. Reduced motion is handled in globals.css.
 */
export function PuzzleDialog ({
	titleId,
	descriptionId,
	onClose,
	initialFocusRef,
	children,
}: PuzzleDialogProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const onCloseRef = useRef(onClose)

	useEffect(() => {
		onCloseRef.current = onClose
	}, [onClose])

	useEffect(() => {
		const panel = panelRef.current
		const previous = document.activeElement
		const initial = initialFocusRef?.current
		if (initial) {
			initial.focus()
		} else {
			focusableIn(panel)[0]?.focus()
		}

		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault()
				onCloseRef.current()
				return
			}
			if (event.key !== 'Tab') return
			const items = focusableIn(panel)
			if (items.length === 0) {
				event.preventDefault()
				return
			}
			const first = items[0]
			const last = items[items.length - 1]
			const active = document.activeElement
			const inside = active instanceof Node && panel?.contains(active)
			if (event.shiftKey && (active === first || !inside)) {
				event.preventDefault()
				last?.focus()
			} else if (!event.shiftKey && active === last) {
				event.preventDefault()
				first?.focus()
			}
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = previousOverflow
			if (previous instanceof HTMLElement) previous.focus()
		}
	}, [initialFocusRef])

	return createPortal(
		<div className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6">
			<div
				className="absolute inset-0 bg-pencil/40"
				onClick={onClose}
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className="
puzzle-dialog relative z-10 flex max-h-[min(92dvh,880px)]
w-full max-w-3xl flex-col overflow-hidden
border-[3px] border-pencil bg-paper
rounded-wobbly-md shadow-hard-lg
"
			>
				{children}
			</div>
		</div>,
		document.body,
	)
}
