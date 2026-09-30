import Image from 'next/image'

import { buttonClassName } from '@/components/ui/button'

interface GoogleLoginButtonProps {
	onClick: () => void
	isSigningIn: boolean
}

export default function GoogleLoginButton({
	onClick,
	isSigningIn,
}: GoogleLoginButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={isSigningIn}
			className={buttonClassName({
				className: 'w-full',
			})}
		>
			<Image src={'/google.svg'} alt="" width={20} height={20} />
			{isSigningIn ? 'Redirecting…' : 'Continue with Google'}
		</button>
	)
}
