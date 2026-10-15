'use client'

import { useState } from 'react'

import type { IClue, IGameMetadata } from '@/features/game/game.schemas'
import {
	RULE_KINDS,
	attributeChoices,
	attributeLabel,
	attributeRuleText,
	clueFromRule,
	defaultRule,
	needsOperator,
	needsSuspect,
	needsWeapon,
	valueChoices,
	valueLabel,
	withRulePatch,
	type AttributeRuleDraft,
	type AttributeRuleKind,
} from '@/lib/attribute-rules'
import { newClueId, useCreateGameStore } from '@/store/create-game.store'
import { buttonClassName } from '@/components/ui/button'

const selectClass = `
w-full border-2 border-pencil bg-card px-3 py-3
rounded-wobbly-sm font-body text-base text-pencil
outline-none focus:border-pen focus:ring-2 focus:ring-pen/20
`

export function AttributeRuleFields ({
	draft,
	metadata,
	onChange,
}: {
	draft: AttributeRuleDraft
	metadata: IGameMetadata
	onChange: (next: AttributeRuleDraft) => void
}) {
	const patch = (next: Partial<AttributeRuleDraft>) => {
		onChange(withRulePatch(metadata, draft, next))
	}
	const values = valueChoices(metadata, draft)
	const clue = clueFromRule('preview', draft)
	const sentence = clue ? attributeRuleText(clue, metadata) : null

	return (
		<div className="space-y-3">
			<div className="grid gap-3 sm:grid-cols-2">
				<label className="font-heading text-base text-pencil block">
					Mẫu
					<select
						value={draft.kind}
						onChange={(event) =>
							patch({
								kind: event.target.value as AttributeRuleKind,
							})
						}
						className={`${selectClass} mt-1`}
					>
						{RULE_KINDS.map((item) => (
							<option key={item.kind} value={item.kind}>
								{item.label}
							</option>
						))}
					</select>
				</label>

				<label className="font-heading text-base text-pencil block">
					Thuộc tính
					<select
						value={draft.attribute}
						onChange={(event) =>
							patch({ attribute: event.target.value })
						}
						className={`${selectClass} mt-1`}
					>
						{attributeChoices(draft.kind).map((attribute) => (
							<option key={attribute} value={attribute}>
								{attributeLabel(attribute)}
							</option>
						))}
					</select>
				</label>

				{needsSuspect(draft.kind) ? (
					<label className="font-heading text-base text-pencil block">
						Nghi phạm
						<select
							value={draft.suspectId}
							onChange={(event) =>
								patch({ suspectId: event.target.value })
							}
							className={`${selectClass} mt-1`}
						>
							{metadata.suspects.map((suspect) => (
								<option key={suspect.id} value={suspect.id}>
									{suspect.name}
								</option>
							))}
						</select>
					</label>
				) : null}

				{needsWeapon(draft.kind) ? (
					<label className="font-heading text-base text-pencil block">
						Vũ khí
						<select
							value={draft.weaponId}
							onChange={(event) =>
								patch({ weaponId: event.target.value })
							}
							className={`${selectClass} mt-1`}
						>
							{metadata.weapons.map((weapon) => (
								<option key={weapon.id} value={weapon.id}>
									{weapon.name}
								</option>
							))}
						</select>
					</label>
				) : null}

				{needsOperator(draft.kind) ? (
					<label className="font-heading text-base text-pencil block">
						So sánh
						<select
							value={draft.op}
							onChange={(event) =>
								patch({
									op: event.target.value === 'neq' ? 'neq' : 'eq',
								})
							}
							className={`${selectClass} mt-1`}
						>
							<option value="eq">=</option>
							<option value="neq">≠</option>
						</select>
					</label>
				) : null}

				<label className="font-heading text-base text-pencil block">
					Giá trị
					<select
						value={draft.value}
						onChange={(event) =>
							patch({ value: event.target.value })
						}
						className={`${selectClass} mt-1`}
					>
						{values.length === 0 ? (
							<option value="">Chưa có giá trị</option>
						) : null}
						{values.map((value) => (
							<option key={value} value={value}>
								{valueLabel(draft.attribute, value)}
							</option>
						))}
					</select>
				</label>
			</div>

			<p
				className="
text-base text-pencil bg-paper/80 rounded-wobbly-sm px-3 py-2
"
				aria-live="polite"
			>
				{sentence ?? 'Chọn đủ các ô để xem câu manh mối.'}
			</p>
		</div>
	)
}

export default function AttributeRuleForm ({
	metadata,
}: {
	metadata: IGameMetadata
}) {
	const addClue = useCreateGameStore((s) => s.addClue)
	const [draft, setDraft] = useState<AttributeRuleDraft>(() =>
		defaultRule(metadata),
	)
	const ready = clueFromRule('draft', draft) !== null

	const handleAdd = () => {
		const clue = clueFromRule(newClueId(), draft)
		if (!clue) return
		addClue(clue)
	}

	return (
		<form
			className="
space-y-3 border-2 border-dashed border-pencil
bg-erased/40 p-4 rounded-wobbly-md
"
			onSubmit={(event) => {
				event.preventDefault()
				handleAdd()
			}}
		>
			<h3 className="font-heading text-xl text-pencil">
				Luật thuộc tính
			</h3>
			<AttributeRuleFields
				draft={draft}
				metadata={metadata}
				onChange={setDraft}
			/>
			<button
				type="submit"
				disabled={!ready}
				className={buttonClassName({
					variant: 'secondary',
					size: 'sm',
					disabled: !ready,
				})}
			>
				Thêm luật
			</button>
		</form>
	)
}

export function attributeRuleClue (
	id: string,
	draft: AttributeRuleDraft,
	puzzle: IClue['puzzle'],
): IClue | null {
	const clue = clueFromRule(id, draft)
	if (!clue) return null
	return puzzle ? { ...clue, puzzle } : clue
}
