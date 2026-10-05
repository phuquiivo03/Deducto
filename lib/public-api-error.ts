export interface PublicApiFailure<T> {
	data: T
	success: false
	message: string
}

/**
 * Log a server error and return a client payload that does not include it.
 * `fallback` is the only string copied into the response.
 */
export function publicApiFailure<T> (
	scope: string,
	error: unknown,
	fallback: string,
	data: T,
): PublicApiFailure<T> {
	console.error(scope, error)
	return {
		data,
		success: false,
		message: fallback,
	}
}
