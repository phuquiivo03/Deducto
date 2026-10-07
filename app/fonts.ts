import { Mali, Patrick_Hand } from 'next/font/google'

export const mali = Mali({
	weight: '700',
	subsets: ['latin', 'latin-ext', 'vietnamese'],
	display: 'swap',
	variable: '--font-mali',
})

export const patrickHand = Patrick_Hand({
	weight: '400',
	subsets: ['latin', 'latin-ext', 'vietnamese'],
	display: 'swap',
	variable: '--font-patrick-hand',
})
