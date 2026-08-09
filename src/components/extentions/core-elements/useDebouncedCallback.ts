import { useCallback, useEffect, useRef } from "react";

/**
 * Wraps a callback so rapid calls collapse into one trailing call.
 *
 * The wrapper's identity is stable and the latest `callback` is read from a
 * ref, so a caller stored inside a long-lived object — a Tiptap editor's
 * `onUpdate`, say — never fires a stale version.
 *
 * Whatever is pending when the component unmounts is flushed rather than
 * dropped, so the final edit still reaches the host.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<Args | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const args = pendingArgsRef.current;
    pendingArgsRef.current = null;
    if (args) callbackRef.current(...args);
  }, []);

  const invoke = useCallback(
    (...args: Args) => {
      pendingArgsRef.current = args;

      // A delay of 0 means "no debouncing" — call straight through, so hosts
      // that want every keystroke keep the old behaviour.
      if (delay <= 0) {
        flush();
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, delay);
    },
    [delay, flush]
  );

  useEffect(() => flush, [flush]);

  return invoke;
}
