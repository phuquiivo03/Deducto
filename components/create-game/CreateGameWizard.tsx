'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createGameInputSchema } from '@/features/game/game.schemas'
import type { AppResponse } from '@/features/type'
import type { IGeneratedCase } from '@/features/game/game.schemas'
import { resolveClueValueForSubmit } from '@/lib/clue-templates'
import { signInWithGoogle } from '@/features/user/user.sign-in'
import { useAuthUser } from '@/hooks/use-auth-user'
import { useCreateGameStore } from '@/store/create-game.store'
import Card from '@/components/ui/Card'
import { StickyTag } from '@/components/ui/sticky-tag'

import CaseEditor from './CaseEditor'
import GeneratingState from './GeneratingState'
import PromptPanel from './PromptPanel'
import GoogleLoginButton from '../ui/GoogleLoginButton'

export default function CreateGameWizard() {
	const router = useRouter()
	const { user, isLoading } = useAuthUser()
	const abortRef = useRef<AbortController | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isSigningIn, setIsSigningIn] = useState(false)

	const phase = useCreateGameStore((s) => s.phase)
	const prompt = useCreateGameStore((s) => s.prompt)
	const level = useCreateGameStore((s) => s.level)
	const draft = useCreateGameStore((s) => s.draft)
	const result = useCreateGameStore((s) => s.result)
	const setPhase = useCreateGameStore((s) => s.setPhase)
	const setCase = useCreateGameStore((s) => s.setCase)
	const setIssues = useCreateGameStore((s) => s.setIssues)
	const reset = useCreateGameStore((s) => s.reset)

	const runGenerate = useCallback(async () => {
		setError(null)
		abortRef.current?.abort()
		const controller = new AbortController()
		abortRef.current = controller
		setPhase('generating')

		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt, level }),
				signal: controller.signal,
			})
			const json = (await res.json()) as AppResponse<IGeneratedCase>
			if (!json.success || !json.data) {
				throw new Error(json.message ?? 'Generation failed')
			}
			setCase(json.data)
		} catch (e) {
			if (e instanceof Error && e.name === 'AbortError') {
				setPhase('prompt')
				return
			}
			setError(e instanceof Error ? e.message : 'Generation failed')
			setPhase('prompt')
		}
	}, [level, prompt, setCase, setPhase])

	const handleRegenerate = () => {
		if (
			!window.confirm(
				'Discard edits and generate a new case from your prompt?',
			)
		) {
			return
		}
		runGenerate()
	}

	const handleCreate = async () => {
		if (!draft || !result) {
			return
		}
		setError(null)

		const clues = draft.gameMetadata.clues.map((c) =>
			resolveClueValueForSubmit(c, draft.gameMetadata),
		)
		const payload = {
			title: draft.title,
			description: draft.description,
			banner: draft.banner,
			level: draft.level,
			gameMetadata: { ...draft.gameMetadata, clues },
			result,
		}

		const parsed = createGameInputSchema.safeParse(payload)
		if (!parsed.success) {
			setIssues(parsed.error.issues)
			setError('Please fix validation issues below.')
			return
		}

		setPhase('submitting')
		setIssues([])

		try {
			const res = await fetch('/api/game', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
			})
			const json = (await res.json()) as AppResponse<{ id: string }>
			if (!json.success || !json.data?.id) {
				throw new Error(json.message ?? 'Could not create case')
			}
			reset()
			router.push(`/case/${json.data.id}`)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Could not create case')
			setPhase('editing')
		}
	}

	useEffect(() => {
		return () => {
			abortRef.current?.abort()
		}
	}, [])

	const handleGoogleSignIn = async () => {
		setIsSigningIn(true)
		try {
			await signInWithGoogle()
		} catch {
			setError('Could not start Google sign-in.')
			setIsSigningIn(false)
		}
	}

	if (isLoading) {
		return (
			<p className="text-center text-lg text-pencil/70 py-10">
				Checking sign-in…
			</p>
		)
	}

	if (!user) {
		return (
			<Card decoration="tape" className="text-center space-y-4 mb-0">
				<h1 className="font-heading text-3xl text-pencil">
					Sign in to create cases
				</h1>
				<p className="text-base text-pencil/80">
					Case generation uses AI and saves your work to your account.
				</p>
				<GoogleLoginButton
					onClick={handleGoogleSignIn}
					isSigningIn={isSigningIn}
				/>
				<Link
					href="/"
					className="text-sm text-pencil/70 wavy-underline block"
				>
					Back to home
				</Link>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-2">
				<Link
					href="/"
					className="text-sm text-pencil/70 wavy-underline"
				>
					← Home
				</Link>
				<span className="text-sm text-pencil/60 truncate max-w-[50%]">
					{user.email}
				</span>
			</div>

			{error ? (
				<StickyTag tone="marker" className="block text-center rotate-0">
					{error}
				</StickyTag>
			) : null}

			{phase === 'prompt' ? <PromptPanel onGenerate={runGenerate} /> : null}

			{phase === 'generating' ? (
				<GeneratingState
					onCancel={() => {
						abortRef.current?.abort()
						setPhase('prompt')
					}}
				/>
			) : null}

			{phase === 'editing' || phase === 'submitting' ? (
				<CaseEditor
					onCreate={handleCreate}
					onRegenerate={handleRegenerate}
					isSubmitting={phase === 'submitting'}
				/>
			) : null}
		</div>
	)
}
