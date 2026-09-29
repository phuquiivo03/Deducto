import type { ZodIssue } from 'zod'

export function normalizePath(path: ZodIssue['path']): (string | number)[] {
	return path.filter(
		(p): p is string | number =>
			typeof p === 'string' || typeof p === 'number',
	)
}

export function issuePathKey(path: ZodIssue['path']): string {
	return normalizePath(path).join('.')
}

export function issuesForPath(
	issues: ZodIssue[],
	prefix: (string | number)[],
): ZodIssue[] {
	const key = prefix.join('.')
	return issues.filter((issue) => {
		const issueKey = issuePathKey(issue.path)
		return issueKey === key || issueKey.startsWith(`${key}.`)
	})
}

export function firstIssueMessage(
	issues: ZodIssue[],
	path: (string | number)[],
): string | undefined {
	const target = path.join('.')
	const match = issues.find(
		(i) => issuePathKey(i.path) === target,
	)
	return match?.message
}
