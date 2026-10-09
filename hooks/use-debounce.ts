"use client";

import { useEffect, useState } from "react";

/**
 * Returns the latest value only after it stays unchanged for `delayMs`.
 * Each new value restarts the wait, so a burst of updates runs the
 * downstream action once.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
