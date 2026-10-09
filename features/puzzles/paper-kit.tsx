'use client'

import type { ReactNode } from 'react'

/**
 * Hand-drawn circle. Seeds match the Caesar wheel so its rings
 * stay on the same paths.
 */
export function wobblePath (
	cx: number,
	cy: number,
	radius: number,
	seed: number,
): string {
	const steps = 40
	let path = ''
	for (let index = 0; index <= steps; index += 1) {
		const theta = (index / steps) * Math.PI * 2
		const wobble =
			1 +
			Math.sin(theta * 3 + seed) * 0.016 +
			Math.cos(theta * 7 + seed) * 0.01
		const x = cx + Math.cos(theta) * radius * wobble
		const y = cy + Math.sin(theta) * radius * wobble
		path += `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
	}
	return `${path}Z`
}

export interface PaperRoundButtonProps {
	label: string
	onClick: () => void
	disabled?: boolean
	children: ReactNode
}

export function PaperRoundButton ({
	label,
	onClick,
	disabled = false,
	children,
}: PaperRoundButtonProps) {
	return (
		<button
			type="button"
			className="puzzle-round"
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	)
}

export function CipherFields ({
	cipher,
	plain,
}: {
	cipher: string
	plain: string
}) {
	return (
		<div className="grid gap-2 sm:grid-cols-2">
			<label className="puzzle-field">
				<span className="puzzle-field-label">Văn bản mật mã</span>
				<textarea
					readOnly
					rows={2}
					spellCheck={false}
					value={cipher}
					className="puzzle-field-box"
				/>
			</label>
			<label className="puzzle-field">
				<span className="puzzle-field-label puzzle-field-label-accent">
					Văn bản gốc
				</span>
				<textarea
					readOnly
					rows={2}
					spellCheck={false}
					value={plain}
					className="puzzle-field-box"
				/>
			</label>
		</div>
	)
}
