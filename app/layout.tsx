import './globals.css'
import { kalam, patrickHand } from './fonts'

export const metadata = {
	title: 'Deducto',
	description:
		'Build a detective board, connect the clues, and solve the case.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html
			lang="en"
			className={`${kalam.variable} ${patrickHand.variable}`}
		>
			<body className="font-body antialiased">{children}</body>
		</html>
	)
}
