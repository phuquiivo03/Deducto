'use client'

import type { ClueAttribute, IClue, IGameMetadata } from '@/features/game/game.schemas'
import {
	A1_ANCHOR_ATTRIBUTES,
	A2_ATTRIBUTES,
	CLUE_TEMPLATES,
	buildClue,
	detectTemplate,
	type TemplateKey,
} from '@/lib/clue-templates'
import { clueToText } from '@/lib/clues.helper'
import { useCreateGameStore } from '@/store/create-game.store'

import { inputClass } from './field-shell'

function anchorValueOptions(
	attribute: ClueAttribute,
	metadata: IGameMetadata,
): { label: string; value: string }[] {
	if (attribute === 'location') {
		return metadata.locations.map((l) => ({
			label: l.name,
			value: l.name,
		}))
	}
	if (attribute === 'motive') {
		return metadata.motives.map((m) => ({
			label: m.name,
			value: m.name,
		}))
	}
	if (attribute === 'handedness') {
		return [
			{ label: 'LEFT', value: 'LEFT' },
			{ label: 'RIGHT', value: 'RIGHT' },
		]
	}
	if (attribute === 'hairColor') {
		return [
			'black',
			'brown',
			'blonde',
			'red',
			'gray',
			'white',
			'auburn',
		].map((v) => ({ label: v, value: v }))
	}
	if (attribute === 'weight') {
		return ['LIGHT', 'MEDIUM', 'HEAVY'].map((v) => ({ label: v, value: v }))
	}
	if (attribute === 'material') {
		const mats = new Set(
			metadata.weapons
				.map((w) => w.attributes?.material)
				.filter(Boolean) as string[],
		)
		return [...mats].map((v) => ({ label: v, value: v }))
	}
	return []
}

export default function ClueEditor({
	clue,
	index,
	metadata,
}: {
	clue: IClue
	index: number
	metadata: IGameMetadata
}) {
	const updateClue = useCreateGameStore((s) => s.updateClue)
	const detected = detectTemplate(clue)
	const templateKey = detected === 'custom' ? 'E1' : detected

	const applyTemplate = (key: TemplateKey) => {
		const next = buildClue(
			clue.id,
			key,
			{
				suspect_id: clue.suspect_id,
				weapon_id: clue.weapon_id,
				location_id: clue.location_id,
			},
			clue.value,
			clue.attribute,
		)
		updateClue(clue.id, next)
	}

	const preview = clueToText(clue, metadata)

	return (
		<div
			className="space-y-3 pt-2"
			data-field-path={`gameMetadata.clues.${index}.value`}
		>
			{detected === 'custom' ? (
				<p className="text-xs text-red">
					This clue does not match a known template. Pick a template
					to edit safely.
				</p>
			) : null}
			<p className="text-sm text-pencil bg-paper/80 rounded-wobbly-sm px-3 py-2">
				{preview}
			</p>
			<label className="text-xs font-semibold uppercase text-pencil/70">
				Template
				<select
					value={templateKey}
					onChange={(e) => applyTemplate(e.target.value as TemplateKey)}
					className={`${inputClass(false)} mt-1`}
				>
					{CLUE_TEMPLATES.filter((t) => t.key !== 'A2').map((t) => (
						<option key={t.key} value={t.key}>
							{t.key}: {t.label}
						</option>
					))}
					<option value="A2">A2: Entity fact</option>
				</select>
			</label>

			{templateKey === 'A1' ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Anchor attribute
					<select
						value={clue.attribute}
						onChange={(e) => {
							const attr = e.target.value as ClueAttribute
							const opts = anchorValueOptions(attr, metadata)
							updateClue(
								clue.id,
								buildClue(clue.id, 'A1', {}, opts[0]?.value ?? '', attr),
							)
						}}
						className={`${inputClass(false)} mt-1`}
					>
						{A1_ANCHOR_ATTRIBUTES.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</label>
			) : null}

			{templateKey === 'A2' ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Fact attribute
					<select
						value={clue.attribute}
						onChange={(e) =>
							updateClue(clue.id, {
								...clue,
								attribute: e.target.value as ClueAttribute,
							})
						}
						className={`${inputClass(false)} mt-1`}
					>
						{A2_ATTRIBUTES.map((a) => (
							<option key={a} value={a}>
								{a}
							</option>
						))}
					</select>
				</label>
			) : null}

			{CLUE_TEMPLATES.find((t) => t.key === templateKey)?.suspectId ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Suspect
					<select
						value={clue.suspect_id ?? ''}
						onChange={(e) => {
							const suspect_id = e.target.value
							updateClue(
								clue.id,
								buildClue(
									clue.id,
									templateKey,
									{
										suspect_id,
										weapon_id: clue.weapon_id,
										location_id: clue.location_id,
									},
									clue.value,
									clue.attribute,
								),
							)
						}}
						className={`${inputClass(false)} mt-1`}
					>
						<option value="">Select…</option>
						{metadata.suspects.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</label>
			) : null}

			{CLUE_TEMPLATES.find((t) => t.key === templateKey)?.weaponId ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Weapon
					<select
						value={clue.weapon_id ?? ''}
						onChange={(e) => {
							const weapon_id = e.target.value
							updateClue(
								clue.id,
								buildClue(
									clue.id,
									templateKey,
									{
										suspect_id: clue.suspect_id,
										weapon_id,
										location_id: clue.location_id,
									},
									clue.value,
									clue.attribute,
								),
							)
						}}
						className={`${inputClass(false)} mt-1`}
					>
						<option value="">Select…</option>
						{metadata.weapons.map((w) => (
							<option key={w.id} value={w.id}>
								{w.name}
							</option>
						))}
					</select>
				</label>
			) : null}

			{CLUE_TEMPLATES.find((t) => t.key === templateKey)?.locationId ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Location
					<select
						value={clue.location_id ?? ''}
						onChange={(e) => {
							const location_id = e.target.value
							updateClue(
								clue.id,
								buildClue(
									clue.id,
									templateKey,
									{
										suspect_id: clue.suspect_id,
										weapon_id: clue.weapon_id,
										location_id,
									},
									clue.value,
									clue.attribute,
								),
							)
						}}
						className={`${inputClass(false)} mt-1`}
					>
						<option value="">Select…</option>
						{metadata.locations.map((l) => (
							<option key={l.id} value={l.id}>
								{l.name}
							</option>
						))}
					</select>
				</label>
			) : null}

			{templateKey === 'E3' || templateKey === 'A1' ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Value
					{templateKey === 'A1' ? (
						<select
							value={clue.value}
							onChange={(e) =>
								updateClue(clue.id, { ...clue, value: e.target.value })
							}
							className={`${inputClass(false)} mt-1`}
						>
							{anchorValueOptions(clue.attribute, metadata).map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					) : (
						<select
							value={clue.value}
							onChange={(e) =>
								updateClue(clue.id, { ...clue, value: e.target.value })
							}
							className={`${inputClass(false)} mt-1`}
						>
							{metadata.motives.map((m) => (
								<option key={m.id} value={m.name}>
									{m.name}
								</option>
							))}
						</select>
					)}
				</label>
			) : null}

			{templateKey === 'A2' ? (
				<label className="text-xs font-semibold uppercase text-pencil/70 block">
					Value
					<input
						value={clue.value}
						onChange={(e) =>
							updateClue(clue.id, { ...clue, value: e.target.value })
						}
						className={`${inputClass(false)} mt-1`}
					/>
				</label>
			) : null}
		</div>
	)
}
