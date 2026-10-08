export function elapsedInvestigationMs(
	startedAt: number | null,
	endedAt: number | null,
	now = Date.now(),
): number {
	if (startedAt === null) {
		return 0
	}

	const end = endedAt ?? now
	return Math.max(0, end - startedAt)
}

export function elapsedInvestigationSeconds(
	startedAt: number | null,
	endedAt: number | null,
	now = Date.now(),
): number {
	return Math.floor(elapsedInvestigationMs(startedAt, endedAt, now) / 1000)
}

export function formatInvestigationClock(elapsedMs: number): string {
	const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const pad = (value: number) => String(value).padStart(2, '0')

	if (hours > 0) {
		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
	}

	return `${pad(minutes)}:${pad(seconds)}`
}
