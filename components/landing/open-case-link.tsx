import Link from 'next/link'
import type { ReactNode } from 'react'

import { SAMPLE_CASE_PATH } from '@/lib/landing-constants'

interface OpenCaseLinkProps {
	className?: string
	children?: ReactNode
}

export function OpenCaseLink({
	className = '',
	children = 'Open a case',
}: OpenCaseLinkProps) {
	return (
		<Link href={SAMPLE_CASE_PATH} className={className}>
			{children}
		</Link>
	)
}
