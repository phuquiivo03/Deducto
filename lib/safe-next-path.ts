const FALLBACK_PATH = '/'

function hasControlChar (value: string): boolean {
	for (let index = 0; index < value.length; index += 1) {
		const code = value.charCodeAt(index)
		if (code <= 32 || code === 127) {
			return true
		}
	}
	return false
}

/**
 * A single on-site path starts with one slash, stays a path after decoding,
 * and does not use backslashes or control characters.
 */
function isSingleOnSitePath (value: string): boolean {
	if (!value.startsWith('/')) {
		return false
	}
	if (value.startsWith('//') || value.startsWith('/\\')) {
		return false
	}
	if (value.includes('\\') || hasControlChar(value)) {
		return false
	}

	let decoded = value
	try {
		decoded = decodeURIComponent(value)
	} catch {
		return false
	}

	const pathOnly = decoded.split(/[?#]/, 1)[0] ?? ''
	if (!pathOnly.startsWith('/') || pathOnly.startsWith('//')) {
		return false
	}
	if (pathOnly.includes('\\') || hasControlChar(pathOnly)) {
		return false
	}
	return true
}

/**
 * Resolve the auth callback `next` value to one on-site path.
 * Anything else (external, protocol-relative, userinfo, scheme) becomes `/`.
 */
export function safeNextPath (
	next: string | null | undefined,
	origin: string,
): string {
	const candidate = typeof next === 'string' ? next.trim() : ''
	if (!isSingleOnSitePath(candidate)) {
		return FALLBACK_PATH
	}

	try {
		const url = new URL(candidate, origin)
		if (
			url.origin !== origin
			|| url.username !== ''
			|| url.password !== ''
		) {
			return FALLBACK_PATH
		}
		return `${url.pathname}${url.search}${url.hash}`
	} catch {
		return FALLBACK_PATH
	}
}
