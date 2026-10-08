'use client'

import { useEffect, useState } from 'react'

import {
	elapsedInvestigationMs,
	formatInvestigationClock,
} from '@/lib/game-clock'
import { useGameStore } from '@/store/game.store'

export function useGameClock() {
	const startedAt = useGameStore((state) => state.startedAt)
	const endedAt = useGameStore((state) => state.endedAt)
	const [now, setNow] = useState(() => Date.now())
	const isRunning = startedAt !== null && endedAt === null

	useEffect(() => {
		if (!isRunning) {
			return
		}

		const tick = () => {
			setNow(Date.now())
		}

		tick()
		const id = window.setInterval(tick, 1000)
		return () => {
			window.clearInterval(id)
		}
	}, [isRunning])

	const elapsedMs = elapsedInvestigationMs(startedAt, endedAt, now)

	return {
		label: formatInvestigationClock(elapsedMs),
		isRunning,
	}
}
