'use client'

import { Note } from '@/types/detective'
import { useEffect, useRef } from 'react'

interface Props {
	note: Note
	onMove: (x: number, y: number) => void
	onDelete: () => void
	onChange: (text: string) => void
}

export default function StickyNote({
	note,
	onMove,
	onDelete,
	onChange,
}: Props) {
	const editorRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!editorRef.current) return
		if (editorRef.current.innerText !== note.text) {
			editorRef.current.innerText = note.text
		}
	}, [note.text])

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		const startX = e.clientX
		const startY = e.clientY
		const originX = note.x
		const originY = note.y
		const target = e.currentTarget
		target.setPointerCapture(e.pointerId)

		function move(ev: PointerEvent) {
			const dx = ev.clientX - startX
			const dy = ev.clientY - startY
			onMove(originX + dx, originY + dy)
		}

		function up() {
			target.releasePointerCapture(e.pointerId)
			target.removeEventListener('pointermove', move)
			target.removeEventListener('pointerup', up)
		}

		target.addEventListener('pointermove', move)
		target.addEventListener('pointerup', up)
	}

	return (
		<div
			onPointerDown={handlePointerDown}
			style={{
				left: `${note.x}px`,
				top: `${note.y}px`,
				transform: `rotate(${note.rot}deg)`,
			}}
			className="
absolute w-[150px] min-h-[96px] bg-postit
border-2 border-pencil rounded-wobbly-sm p-3 shadow-hard
cursor-grab select-none text-sm text-pencil touch-none
"
		>
			<div
				className="
pointer-events-none absolute left-1/2 top-0
h-5 w-16 -translate-x-1/2 -translate-y-1/2
rotate-1 border border-pencil/20 bg-erased/80
"
				aria-hidden
			/>

			<button
				type="button"
				onPointerDown={(e) => e.stopPropagation()}
				onClick={onDelete}
				className="absolute right-1 top-1 text-pencil/50 hover:text-marker"
			>
				×
			</button>

			<div
				ref={editorRef}
				contentEditable
				suppressContentEditableWarning
				onPointerDown={(e) => e.stopPropagation()}
				onInput={(e) => onChange(e.currentTarget.innerText)}
				className="outline-none min-h-[70px] font-body"
			/>
		</div>
	)
}
