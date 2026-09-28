'use client'

import { useState } from 'react'

import { signInWithGoogle, signOut } from '@/features/user/user.sign-in'
import { useAuthUser } from '@/hooks/use-auth-user'

import Card from './Card'

export default function IntroCard({
	start,
	disabled = false,
}: {
	start: () => void
	disabled?: boolean
}) {
	const { user, isLoading } = useAuthUser()
	const [authError, setAuthError] = useState<string | null>(null)
	const [isSigningIn, setIsSigningIn] = useState(false)

	const handleGoogleSignIn = async () => {
		setAuthError(null)
		setIsSigningIn(true)
		try {
			await signInWithGoogle()
		} catch {
			setAuthError('Could not start Google sign-in. Try again.')
			setIsSigningIn(false)
		}
	}

	const handleSignOut = async () => {
		setAuthError(null)
		try {
			await signOut()
		} catch {
			setAuthError('Could not sign out. Try again.')
		}
	}

	const displayName =
		(typeof user?.user_metadata?.full_name === 'string' &&
			user.user_metadata.full_name) ||
		(typeof user?.user_metadata?.name === 'string' &&
			user.user_metadata.name) ||
		user?.email ||
		'Detective'

	return (
		<Card>
			<span className="inline-block text-xs font-bold text-gold bg-goldBg px-3 py-1 rounded-full mb-3">
				Case #024
			</span>

			<h1
				className="
font-serif
text-3xl
mb-2
"
			>
				The Midnight Murder
			</h1>

			<p className="text-sm text-soft mb-4">
				A body was found at 11:42 PM inside the old Raven mansion.
			</p>

			<p
				className="
text-sm
leading-relaxed
mb-5
"
			>
				Jonathan Raven was discovered in his study after dinner party. Three
				guests remained.
			</p>

			<div
				className="
border-t border-line
pt-4
flex justify-between
"
			>
				<span>Victim</span>
				<b className="font-serif">Jonathan Raven</b>
			</div>

			<div className="mt-5 space-y-3">
				{isLoading ? (
					<p className="text-xs text-soft text-center">Checking sign-in…</p>
				) : user ? (
					<div className="rounded-xl border border-line bg-paper/50 px-4 py-3 text-sm">
						<p className="text-soft text-xs uppercase tracking-wide">
							Signed in
						</p>
						<p className="font-serif font-semibold mt-1">{displayName}</p>
						<button
							type="button"
							onClick={handleSignOut}
							className="mt-2 text-xs text-soft underline"
						>
							Sign out
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={handleGoogleSignIn}
						disabled={isSigningIn}
						className="
w-full
rounded-xl
border
border-line
bg-white
py-3
font-bold
text-ink
disabled:opacity-50
"
					>
						{isSigningIn ? 'Redirecting…' : 'Continue with Google'}
					</button>
				)}

				{authError ? (
					<p className="text-xs text-red-700 text-center">{authError}</p>
				) : null}

				<button
					type="button"
					onClick={start}
					disabled={disabled || !user}
					className="
w-full
bg-ink
text-paper
rounded-xl
py-4
font-bold
disabled:opacity-50
disabled:cursor-not-allowed
"
				>
					Start investigation
				</button>

				{!user && !isLoading ? (
					<p className="text-xs text-soft text-center">
						Sign in with Google to play and save your solve.
					</p>
				) : null}
			</div>
		</Card>
	)
}
