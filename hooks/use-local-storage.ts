'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

function readStorage<T> (key: string, fallback: T): T {
	if (typeof window === 'undefined') {
		return fallback
	}

	try {
		const raw = window.localStorage.getItem(key)

		if (raw === null) {
			return fallback
		}

		return JSON.parse(raw) as T
	} catch {
		return fallback
	}
}

/**
 * Keeps a value in component state and in localStorage.
 * Starts from `initialValue` so server and client markup match,
 * then reads the stored value after mount.
 */
export function useLocalStorage<T> (key: string, initialValue: T) {
	const [value, setValue] = useState<T>(initialValue)
	const initialValueRef = useRef(initialValue)

	useEffect(() => {
		initialValueRef.current = initialValue
	}, [initialValue])

	useEffect(() => {
		setValue(readStorage(key, initialValueRef.current))
	}, [key])

	const setStoredValue = useCallback(
		(next: T | ((current: T) => T)) => {
			setValue((current) => {
				const resolved =
					typeof next === 'function'
						? (next as (current: T) => T)(current)
						: next

				try {
					window.localStorage.setItem(
						key,
						JSON.stringify(resolved),
					)
				} catch {
					// Quota or private mode can reject writes.
				}

				return resolved
			})
		},
		[key],
	)

	const removeValue = useCallback(() => {
		try {
			window.localStorage.removeItem(key)
		} catch {
			// Quota or private mode can reject writes.
		}

		setValue(initialValueRef.current)
	}, [key])

	useEffect(() => {
		function handleStorage (event: StorageEvent) {
			if (event.key !== key) {
				return
			}

			setValue(readStorage(key, initialValueRef.current))
		}

		window.addEventListener('storage', handleStorage)

		return () => {
			window.removeEventListener('storage', handleStorage)
		}
	}, [key])

	return {
		value,
		setValue: setStoredValue,
		removeValue,
	}
}
