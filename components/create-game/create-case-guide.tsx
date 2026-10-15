'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { HelpMark } from '@/components/ui/help-mark'
import { ModalShell } from '@/components/ui/modal-shell'

const SEEN_KEY = 'deducto-create-guide-opened'
const VIDEO_SRC =
	'https://www.youtube-nocookie.com/embed/voTqUdLTCp4?autoplay=1'

function CreateGuideModal ({ onClose }: { onClose: () => void }) {
	useEffect(() => {
		function handleKey (event: KeyboardEvent) {
			if (event.key !== 'Escape') return
			event.preventDefault()
			onClose()
		}

		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [onClose])

	return (
		<ModalShell
			open
			onClose={onClose}
			title="Hướng dẫn"
			panelClassName="max-w-3xl"
		>
			<iframe
				src={VIDEO_SRC}
				title="Hướng dẫn tạo vụ án"
				className="
aspect-video w-full rounded-wobbly-sm border-2 border-pencil
"
				allow="autoplay; encrypted-media; picture-in-picture"
				allowFullScreen
			/>
			<div className="mt-4 flex justify-end">
				<Button type="button" size="sm" onClick={onClose}>
					Đóng
				</Button>
			</div>
		</ModalShell>
	)
}

/**
 * Create-page help. Opening the shared ? plays the guide and
 * stops the pulse for later visits.
 */
export default function CreateCaseGuide () {
	return (
		<HelpMark storageKey={SEEN_KEY}>
			{(close) => <CreateGuideModal onClose={close} />}
		</HelpMark>
	)
}
